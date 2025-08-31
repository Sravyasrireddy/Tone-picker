/**
 * Prompt version - increment when changing templates
 */
export const PROMPT_VERSION = '1.0.0'

/**
 * System prompt template for Mistral AI
 */
export const systemPrompt = `You rewrite text **preserving meaning** and factual content while adjusting:
- Formality level: Casual ↔ Neutral ↔ Formal
- Voice: Friendly ↔ Neutral ↔ Direct
Rules:
- Keep language **natural** and **clear**.
- Do **not** add new facts.
- Keep approximate length (±15%).
- Maintain lists/formatting and code fences.
- If input is empty or whitespace, return an empty string.`

/**
 * Formality levels mapping
 */
export const formalityLevels = ['Casual', 'Neutral', 'Formal'] as const

/**
 * Voice levels mapping
 */
export const voiceLevels = ['Friendly', 'Neutral', 'Direct'] as const

/**
 * Builds user prompt for tone transformation
 */
export function userPrompt(text: string, coords: { x: number; y: number }): string {
  const formality = formalityLevels[coords.x + 1]
  const voice = voiceLevels[coords.y + 1]
  
  return `Given this text:
"""
${text}
"""
Adjust tone using these controls:
- Formality: ${formality}
- Voice: ${voice}
Return only the rewritten text.`
}

/**
 * Gets descriptive label for coordinates
 */
export function getToneLabel(coords: { x: number; y: number }): string {
  const formality = formalityLevels[coords.x + 1]
  const voice = voiceLevels[coords.y + 1]
  return `${formality} + ${voice}`
}

/**
 * Gets tooltip text for coordinates
 */
export function getToneTooltip(coords: { x: number; y: number }): string {
  const formality = formalityLevels[coords.x + 1]
  const voice = voiceLevels[coords.y + 1]
  
  const formalityDesc = {
    'Casual': 'Relaxed, informal language',
    'Neutral': 'Standard, balanced tone',
    'Formal': 'Professional, structured language'
  }[formality]
  
  const voiceDesc = {
    'Friendly': 'Warm, approachable tone',
    'Neutral': 'Balanced, objective tone',
    'Direct': 'Clear, concise communication'
  }[voice]
  
  return `${formalityDesc}. ${voiceDesc}.`
}
