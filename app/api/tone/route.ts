import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createMistralClient, DEFAULT_MODEL, DEFAULT_PARAMS } from '@/lib/mistral'
import { systemPrompt, userPrompt, PROMPT_VERSION } from '@/lib/prompt'
import { getCachedResponse, cacheResponse } from '@/lib/cache'
import { createCacheKey } from '@/lib/hash'
import { checkRateLimit, getClientIdentifier } from '@/lib/rateLimit'

/**
 * Request schema validation
 */
const requestSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty'),
  coords: z.object({
    x: z.number().int().min(-1).max(1),
    y: z.number().int().min(-1).max(1),
  }),
  promptVersion: z.string(),
})

/**
 * Error response types
 */
type ErrorResponse = {
  error: {
    code: string
    message: string
    retryAfterMs?: number
  }
}

/**
 * Success response types
 */
type SuccessResponse = {
  transformed: string
  cached: boolean
}

/**
 * POST handler for tone transformation
 */
export async function POST(req: NextRequest): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // Parse and validate request body
    const body = await req.json()
    const validation = requestSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request format',
          },
        },
        { status: 400 }
      )
    }

    const { text, coords, promptVersion } = validation.data

    // Check prompt version compatibility
    if (promptVersion !== PROMPT_VERSION) {
      return NextResponse.json(
        {
          error: {
            code: 'VERSION_MISMATCH',
            message: 'Prompt version mismatch. Please refresh the page.',
          },
        },
        { status: 400 }
      )
    }

    // Check rate limits
    const clientId = getClientIdentifier(req)
    const rateLimitCheck = checkRateLimit(clientId)
    
    if (!rateLimitCheck.ok) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please slow down.',
            retryAfterMs: rateLimitCheck.retryAfterMs,
          },
        },
        { status: 429 }
      )
    }

    // Check cache first
    const cacheKey = createCacheKey(text, coords, promptVersion)
    const cached = getCachedResponse(cacheKey)
    
    if (cached) {
      return NextResponse.json({
        transformed: cached.transformed,
        cached: true,
      })
    }

    // Call Mistral AI
    const client = createMistralClient()
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt(text, coords) },
    ]

    const response = await client.chat.complete({
      model: DEFAULT_MODEL,
      messages,
      ...DEFAULT_PARAMS,
    })

    const transformed = response?.choices?.[0]?.message?.content?.toString?.() || ''

    if (!transformed) {
      return NextResponse.json(
        {
          error: {
            code: 'EMPTY_RESPONSE',
            message: 'No transformation was generated. Please try again.',
          },
        },
        { status: 500 }
      )
    }

    // Cache the response
    cacheResponse(cacheKey, transformed)

    return NextResponse.json({
      transformed,
      cached: false,
    })

  } catch (error: any) {
    console.error('Tone transformation error:', error)

    // Handle specific Mistral API errors
    if (error.status === 401) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTH_ERROR',
            message: 'API key is invalid or expired. Please check your configuration.',
          },
        },
        { status: 401 }
      )
    }

    if (error.status === 429) {
      const retryAfter = error.headers?.['retry-after']
      const retryAfterMs = retryAfter ? parseInt(retryAfter) * 1000 : undefined
      
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMITED',
            message: 'Mistral API rate limit exceeded. Please try again later.',
            retryAfterMs,
          },
        },
        { status: 429 }
      )
    }

    if (error.status >= 500) {
      return NextResponse.json(
        {
          error: {
            code: 'UPSTREAM_ERROR',
            message: 'Mistral AI service is temporarily unavailable. Please try again later.',
          },
        },
        { status: 502 }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred. Please try again.',
        },
      },
      { status: 500 }
    )
  }
}
