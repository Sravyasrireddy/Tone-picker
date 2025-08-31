'use client'

import { Undo2, Redo2, RotateCcw, Copy } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { toast } from 'sonner'

/**
 * Toolbar component with modern glassmorphism design
 */
export function Toolbar() {
  const {
    history,
    undo,
    redo,
    reset,
  } = useEditorStore()

  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(history.present)
      toast.success('Text copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy text')
    }
  }

  const handleReset = () => {
    reset()
    toast.success('Text reset to original!')
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={undo}
        disabled={!canUndo}
        className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed tooltip"
        title="Undo (Ctrl+Z)"
        data-tooltip="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
        <span className="hidden sm:inline">Undo</span>
      </button>
      
      <button
        onClick={redo}
        disabled={!canRedo}
        className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed tooltip"
        title="Redo (Ctrl+Shift+Z)"
        data-tooltip="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="w-4 h-4" />
        <span className="hidden sm:inline">Redo</span>
      </button>
      
      <button
        onClick={handleReset}
        className="btn-secondary flex items-center gap-2 tooltip"
        title="Reset to original (Ctrl+R)"
        data-tooltip="Reset to original (Ctrl+R)"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="hidden sm:inline">Reset</span>
      </button>
      
      <button
        onClick={handleCopy}
        className="btn-primary flex items-center gap-2 tooltip"
        title="Copy text (Ctrl+C)"
        data-tooltip="Copy text (Ctrl+C)"
      >
        <Copy className="w-4 h-4" />
        <span className="hidden sm:inline">Copy</span>
      </button>
    </div>
  )
}
