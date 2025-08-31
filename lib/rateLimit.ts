/**
 * Rate limiting configuration
 */
const RATE_LIMIT_WINDOW_MS = 10 * 1000 // 10 seconds
const RATE_LIMIT_MAX_REQUESTS = 5 // max 5 requests per window

interface RateLimitEntry {
  timestamps: number[]
}

/**
 * In-memory store for rate limiting by IP
 */
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Clean up old timestamps (older than window)
 */
function cleanupOldTimestamps(entry: RateLimitEntry): void {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS
  entry.timestamps = entry.timestamps.filter(timestamp => timestamp > cutoff)
}

/**
 * Check if request is within rate limits
 */
export function checkRateLimit(identifier: string): { ok: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)
  
  if (!entry) {
    // First request from this identifier
    rateLimitStore.set(identifier, { timestamps: [now] })
    return { ok: true }
  }
  
  // Clean up old timestamps
  cleanupOldTimestamps(entry)
  
  // Check if we're within limits
  if (entry.timestamps.length < RATE_LIMIT_MAX_REQUESTS) {
    entry.timestamps.push(now)
    return { ok: true }
  }
  
  // Rate limited - calculate retry time
  const oldestTimestamp = Math.min(...entry.timestamps)
  const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - oldestTimestamp)
  
  return { ok: false, retryAfterMs }
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(req: Request): string {
  // Try to get real IP from various headers
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const cfConnectingIp = req.headers.get('cf-connecting-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp
  }
  
  // Fallback to a default identifier
  return 'unknown'
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupExpiredRateLimits(): void {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS
  
  rateLimitStore.forEach((entry, identifier) => {
    cleanupOldTimestamps(entry)
    
    // Remove entry if no timestamps remain
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(identifier)
    }
  })
}
