import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/tone/route'

// Mock environment variables
process.env.MISTRAL_API_KEY = 'test-api-key'

// Setup MSW server
const server = setupServer(
  // Mock successful Mistral response
  http.post('https://api.mistral.ai/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: 'Transformed text with casual and friendly tone'
          }
        }
      ]
    })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('API Tone Route', () => {
  const createMockRequest = (body: any): NextRequest => {
    return new NextRequest('http://localhost:3000/api/tone', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  describe('POST /api/tone', () => {
    test('should transform text successfully', async () => {
      const request = createMockRequest({
        text: 'Hello world',
        coords: { x: -1, y: -1 },
        promptVersion: '1.0.0'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.transformed).toBe('Transformed text with casual and friendly tone')
      expect(data.cached).toBe(false)
    })

    test('should return cached response when available', async () => {
      // First request
      const request1 = createMockRequest({
        text: 'Hello world',
        coords: { x: -1, y: -1 },
        promptVersion: '1.0.0'
      })

      await POST(request1)

      // Second request with same parameters
      const request2 = createMockRequest({
        text: 'Hello world',
        coords: { x: -1, y: -1 },
        promptVersion: '1.0.0'
      })

      const response = await POST(request2)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.cached).toBe(true)
    })

    test('should validate request body', async () => {
      const request = createMockRequest({
        text: '', // Empty text
        coords: { x: -1, y: -1 },
        promptVersion: '1.0.0'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    test('should validate coordinates', async () => {
      const request = createMockRequest({
        text: 'Hello world',
        coords: { x: 2, y: 1 }, // Invalid x coordinate
        promptVersion: '1.0.0'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    test('should check prompt version compatibility', async () => {
      const request = createMockRequest({
        text: 'Hello world',
        coords: { x: -1, y: -1 },
        promptVersion: '0.9.0' // Old version
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VERSION_MISMATCH')
    })

    test('should handle Mistral API errors', async () => {
      // Mock Mistral API error
      server.use(
        http.post('https://api.mistral.ai/v1/chat/completions', () => {
          return HttpResponse.json(
            { error: 'Invalid API key' },
            { status: 401 }
          )
        })
      )

      const request = createMockRequest({
        text: 'Hello world',
        coords: { x: -1, y: -1 },
        promptVersion: '1.0.0'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('AUTH_ERROR')
      expect(data.error.message).toContain('API key')
    })

    test('should handle rate limiting', async () => {
      // Mock rate limit error
      server.use(
        http.post('https://api.mistral.ai/v1/chat/completions', () => {
          return HttpResponse.json(
            { error: 'Rate limit exceeded' },
            { 
              status: 429,
              headers: { 'retry-after': '60' }
            }
          )
        })
      )

      const request = createMockRequest({
        text: 'Hello world',
        coords: { x: -1, y: -1 },
        promptVersion: '1.0.0'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error.code).toBe('RATE_LIMITED')
      expect(data.error.message).toContain('rate limit')
    })

    test('should handle server errors', async () => {
      // Mock server error
      server.use(
        http.post('https://api.mistral.ai/v1/chat/completions', () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        })
      )

      const request = createMockRequest({
        text: 'Hello world',
        coords: { x: -1, y: -1 },
        promptVersion: '1.0.0'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(502)
      expect(data.error.code).toBe('UPSTREAM_ERROR')
      expect(data.error.message).toContain('temporarily unavailable')
    })

    test('should handle empty response from Mistral', async () => {
      // Mock empty response
      server.use(
        http.post('https://api.mistral.ai/v1/chat/completions', () => {
          return HttpResponse.json({
            choices: [
              {
                message: {
                  content: null
                }
              }
            ]
          })
        })
      )

      const request = createMockRequest({
        text: 'Hello world',
        coords: { x: -1, y: -1 },
        promptVersion: '1.0.0'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('EMPTY_RESPONSE')
    })

    test('should handle network errors gracefully', async () => {
      // Mock network error
      server.use(
        http.post('https://api.mistral.ai/v1/chat/completions', () => {
          return HttpResponse.error()
        })
      )

      const request = createMockRequest({
        text: 'Hello world',
        coords: { x: -1, y: -1 },
        promptVersion: '1.0.0'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('INTERNAL_ERROR')
    })
  })
})
