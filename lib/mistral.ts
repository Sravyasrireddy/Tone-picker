import { Mistral } from '@mistralai/mistralai'

/**
 * Create Mistral AI client instance
 */
export function createMistralClient(): Mistral {
  const apiKey = process.env.MISTRAL_API_KEY
  
  if (!apiKey) {
    throw new Error('MISTRAL_API_KEY environment variable is not set')
  }
  
  return new Mistral({ apiKey })
}

/**
 * Default model to use
 */
export const DEFAULT_MODEL = 'mistral-small-latest'

/**
 * Default generation parameters
 */
export const DEFAULT_PARAMS = {
  temperature: 0.4,
  maxTokens: 1200,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
}
