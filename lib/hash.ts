import { sha256 } from 'js-sha256'

/**
 * Creates a SHA-256 hash of the input string
 */
export function createHash(input: string): string {
  return sha256(input)
}

/**
 * Creates a cache key from text, coordinates, and prompt version
 */
export function createCacheKey(
  text: string,
  coords: { x: number; y: number },
  promptVersion: string
): string {
  const keyString = `${text}|${coords.x}|${coords.y}|${promptVersion}`
  return createHash(keyString)
}
