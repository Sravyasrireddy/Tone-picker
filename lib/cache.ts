import { LRUCache } from 'lru-cache'

export interface CacheEntry {
  transformed: string
  timestamp: number
}

/**
 * LRU Cache for API responses
 * - Max 200 entries
 * - TTL: 10 minutes
 * - Key: SHA-256 hash of text + coordinates + prompt version
 */
export const responseCache = new LRUCache<string, CacheEntry>({
  max: 200,
  ttl: 10 * 60 * 1000, // 10 minutes
  updateAgeOnGet: true,
  allowStale: false,
})

/**
 * Get cached response if available
 */
export function getCachedResponse(key: string): CacheEntry | undefined {
  return responseCache.get(key)
}

/**
 * Cache a response
 */
export function cacheResponse(key: string, transformed: string): void {
  responseCache.set(key, {
    transformed,
    timestamp: Date.now(),
  })
}

/**
 * Clear all cached responses
 */
export function clearCache(): void {
  responseCache.clear()
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: responseCache.size,
    max: responseCache.max,
    ttl: responseCache.ttl,
  }
}
