import { useEffect, useCallback } from 'react'
import { useEditorStore } from '@/store/useEditorStore'

/**
 * Hook for handling keyboard shortcuts
 */
export function useHotkeys() {
  const { undo, redo, reset } = useEditorStore()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if we're in an input field
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      // Undo: Ctrl/Cmd + Z
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
        return
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if (
        ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) ||
        ((event.ctrlKey || event.metaKey) && event.key === 'y')
      ) {
        event.preventDefault()
        redo()
        return
      }

      // Reset: Ctrl/Cmd + R
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault()
        reset()
        return
      }
    },
    [undo, redo, reset]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}
