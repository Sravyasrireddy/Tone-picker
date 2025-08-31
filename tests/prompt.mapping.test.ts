import { 
  PROMPT_VERSION, 
  systemPrompt, 
  userPrompt, 
  getToneLabel, 
  getToneTooltip,
  formalityLevels,
  voiceLevels
} from '@/lib/prompt'

describe('Prompt Mapping', () => {
  test('should have correct prompt version', () => {
    expect(PROMPT_VERSION).toBe('1.0.0')
  })

  test('should have correct formality levels', () => {
    expect(formalityLevels).toEqual(['Casual', 'Neutral', 'Formal'])
  })

  test('should have correct voice levels', () => {
    expect(voiceLevels).toEqual(['Friendly', 'Neutral', 'Direct'])
  })

  test('should have system prompt with required content', () => {
    expect(systemPrompt).toContain('rewrite text')
    expect(systemPrompt).toContain('preserving meaning')
    expect(systemPrompt).toContain('Formality level')
    expect(systemPrompt).toContain('Voice')
    expect(systemPrompt).toContain('Casual')
    expect(systemPrompt).toContain('Formal')
    expect(systemPrompt).toContain('Friendly')
    expect(systemPrompt).toContain('Direct')
  })

  describe('userPrompt function', () => {
    test('should build correct prompt for casual + friendly', () => {
      const prompt = userPrompt('Hello world', { x: -1, y: -1 })
      
      expect(prompt).toContain('Hello world')
      expect(prompt).toContain('Formality: Casual')
      expect(prompt).toContain('Voice: Friendly')
    })

    test('should build correct prompt for neutral + neutral', () => {
      const prompt = userPrompt('Hello world', { x: 0, y: 0 })
      
      expect(prompt).toContain('Hello world')
      expect(prompt).toContain('Formality: Neutral')
      expect(prompt).toContain('Voice: Neutral')
    })

    test('should build correct prompt for formal + direct', () => {
      const prompt = userPrompt('Hello world', { x: 1, y: 1 })
      
      expect(prompt).toContain('Hello world')
      expect(prompt).toContain('Formality: Formal')
      expect(prompt).toContain('Voice: Direct')
    })

    test('should handle empty text', () => {
      const prompt = userPrompt('', { x: 0, y: 0 })
      
      expect(prompt).toContain('"""')
      expect(prompt).toContain('"""')
      expect(prompt).toContain('Formality: Neutral')
      expect(prompt).toContain('Voice: Neutral')
    })

    test('should handle multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3'
      const prompt = userPrompt(multilineText, { x: -1, y: 1 })
      
      expect(prompt).toContain(multilineText)
      expect(prompt).toContain('Formality: Casual')
      expect(prompt).toContain('Voice: Direct')
    })
  })

  describe('getToneLabel function', () => {
    test('should return correct labels for all coordinates', () => {
      const testCases = [
        { coords: { x: -1, y: -1 }, expected: 'Casual + Friendly' },
        { coords: { x: 0, y: -1 }, expected: 'Neutral + Friendly' },
        { coords: { x: 1, y: -1 }, expected: 'Formal + Friendly' },
        { coords: { x: -1, y: 0 }, expected: 'Casual + Neutral' },
        { coords: { x: 0, y: 0 }, expected: 'Neutral + Neutral' },
        { coords: { x: 1, y: 0 }, expected: 'Formal + Neutral' },
        { coords: { x: -1, y: 1 }, expected: 'Casual + Direct' },
        { coords: { x: 0, y: 1 }, expected: 'Neutral + Direct' },
        { coords: { x: 1, y: 1 }, expected: 'Formal + Direct' },
      ]

      testCases.forEach(({ coords, expected }) => {
        expect(getToneLabel(coords)).toBe(expected)
      })
    })
  })

  describe('getToneTooltip function', () => {
    test('should return descriptive tooltips for all coordinates', () => {
      const testCases = [
        { coords: { x: -1, y: -1 }, expected: 'Casual', voiceExpected: 'Friendly' },
        { coords: { x: 0, y: -1 }, expected: 'Neutral', voiceExpected: 'Friendly' },
        { coords: { x: 1, y: -1 }, expected: 'Formal', voiceExpected: 'Friendly' },
        { coords: { x: -1, y: 0 }, expected: 'Casual', voiceExpected: 'Neutral' },
        { coords: { x: 0, y: 0 }, expected: 'Neutral', voiceExpected: 'Neutral' },
        { coords: { x: 1, y: 0 }, expected: 'Formal', voiceExpected: 'Neutral' },
        { coords: { x: -1, y: 1 }, expected: 'Casual', voiceExpected: 'Direct' },
        { coords: { x: 0, y: 1 }, expected: 'Neutral', voiceExpected: 'Direct' },
        { coords: { x: 1, y: 1 }, expected: 'Formal', voiceExpected: 'Direct' },
      ]

      testCases.forEach(({ coords, expected, voiceExpected }) => {
        const tooltip = getToneTooltip(coords)
        expect(tooltip).toContain(expected)
        expect(tooltip).toContain(voiceExpected)
        expect(tooltip).toContain('language')
        expect(tooltip).toContain('tone')
      })
    })

    test('should have consistent tooltip format', () => {
      const tooltip = getToneTooltip({ x: 0, y: 0 })
      
      // Should end with a period
      expect(tooltip.endsWith('.')).toBe(true)
      
      // Should contain both formality and voice descriptions
      expect(tooltip.split('.')).toHaveLength(3) // Two sentences + empty string
    })
  })

  describe('Coordinate validation', () => {
    test('should handle all valid coordinate combinations', () => {
      const validCoords = [
        { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
        { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 },
        { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 },
      ]

      validCoords.forEach(coords => {
        expect(() => userPrompt('test', coords)).not.toThrow()
        expect(() => getToneLabel(coords)).not.toThrow()
        expect(() => getToneTooltip(coords)).not.toThrow()
      })
    })
  })
})
