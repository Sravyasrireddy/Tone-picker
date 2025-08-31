import { renderHook, act } from '@testing-library/react'
import { useEditorStore } from '@/store/useEditorStore'

// Reset store before each test
beforeEach(() => {
  const { result } = renderHook(() => useEditorStore())
  act(() => {
    result.current.clearStorage()
  })
})

describe('Editor Store - History Management', () => {
  test('should initialize with empty history', () => {
    const { result } = renderHook(() => useEditorStore())
    
    expect(result.current.history.past).toHaveLength(0)
    expect(result.current.history.present).toBe('')
    expect(result.current.history.future).toHaveLength(0)
  })

  test('should set text without adding to history when skipHistory is true', () => {
    const { result } = renderHook(() => useEditorStore())
    
    act(() => {
      result.current.setText('Hello world', true)
    })
    
    expect(result.current.history.present).toBe('Hello world')
    expect(result.current.history.past).toHaveLength(0)
    expect(result.current.initialText).toBe('Hello world')
  })

  test('should add text to history when skipHistory is false', () => {
    const { result } = renderHook(() => useEditorStore())
    
    // Set initial text
    act(() => {
      result.current.setText('Hello', true)
    })
    
    // Change text (should add to history)
    act(() => {
      result.current.setText('Hello world')
    })
    
    expect(result.current.history.present).toBe('Hello world')
    expect(result.current.history.past).toHaveLength(1)
    expect(result.current.history.past[0]).toBe('Hello')
  })

  test('should not add duplicate consecutive states to history', () => {
    const { result } = renderHook(() => useEditorStore())
    
    act(() => {
      result.current.setText('Hello', true)
    })
    
    // Try to set the same text multiple times
    act(() => {
      result.current.setText('Hello')
    })
    
    act(() => {
      result.current.setText('Hello')
    })
    
    expect(result.current.history.past).toHaveLength(0)
    expect(result.current.history.present).toBe('Hello')
  })

  test('should undo correctly', () => {
    const { result } = renderHook(() => useEditorStore())
    
    // Set up history
    act(() => {
      result.current.setText('Hello', true)
      result.current.setText('Hello world')
      result.current.setText('Hello world!')
    })
    
    expect(result.current.history.present).toBe('Hello world!')
    expect(result.current.history.past).toHaveLength(2)
    
    // Undo
    act(() => {
      result.current.undo()
    })
    
    expect(result.current.history.present).toBe('Hello world')
    expect(result.current.history.past).toHaveLength(1)
    expect(result.current.history.future).toHaveLength(1)
  })

  test('should redo correctly', () => {
    const { result } = renderHook(() => useEditorStore())
    
    // Set up history
    act(() => {
      result.current.setText('Hello', true)
      result.current.setText('Hello world')
      result.current.setText('Hello world!')
    })
    
    // Undo first
    act(() => {
      result.current.undo()
    })
    
    // Then redo
    act(() => {
      result.current.redo()
    })
    
    expect(result.current.history.present).toBe('Hello world!')
    expect(result.current.history.past).toHaveLength(2)
    expect(result.current.history.future).toHaveLength(0)
  })

  test('should not undo when past is empty', () => {
    const { result } = renderHook(() => useEditorStore())
    
    act(() => {
      result.current.setText('Hello', true)
    })
    
    act(() => {
      result.current.undo()
    })
    
    expect(result.current.history.present).toBe('Hello')
    expect(result.current.history.past).toHaveLength(0)
  })

  test('should not redo when future is empty', () => {
    const { result } = renderHook(() => useEditorStore())
    
    act(() => {
      result.current.setText('Hello', true)
    })
    
    act(() => {
      result.current.redo()
    })
    
    expect(result.current.history.present).toBe('Hello')
    expect(result.current.history.future).toHaveLength(0)
  })

  test('should reset to initial text', () => {
    const { result } = renderHook(() => useEditorStore())
    
    // Set up history
    act(() => {
      result.current.setText('Hello', true)
      result.current.setText('Hello world')
      result.current.setText('Hello world!')
    })
    
    // Reset
    act(() => {
      result.current.reset()
    })
    
    expect(result.current.history.present).toBe('Hello')
    expect(result.current.history.past).toHaveLength(0)
    expect(result.current.history.future).toHaveLength(0)
    expect(result.current.ui.selected).toBeNull()
  })

  test('should apply transform correctly', () => {
    const { result } = renderHook(() => useEditorStore())
    
    act(() => {
      result.current.setText('Hello', true)
    })
    
    act(() => {
      result.current.applyTransform('Hello there!')
    })
    
    expect(result.current.history.present).toBe('Hello there!')
    expect(result.current.history.past).toHaveLength(1)
    expect(result.current.history.past[0]).toBe('Hello')
    expect(result.current.history.future).toHaveLength(0)
  })

  test('should not add to history when transform result is same as current', () => {
    const { result } = renderHook(() => useEditorStore())
    
    act(() => {
      result.current.setText('Hello', true)
    })
    
    act(() => {
      result.current.applyTransform('Hello')
    })
    
    expect(result.current.history.present).toBe('Hello')
    expect(result.current.history.past).toHaveLength(0)
  })
})
