'use client'

import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { LoadingOverlay } from './LoadingOverlay'

/**
 * Text editor component with modern glassmorphism design
 */
export function Editor() {
  const { history, ui, setText } = useEditorStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize functionality
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const resizeTextarea = () => {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }

    // Initial resize
    resizeTextarea()

    // Add event listener for input changes
    textarea.addEventListener('input', resizeTextarea)
    
    return () => {
      textarea.removeEventListener('input', resizeTextarea)
    }
  }, [history.present])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const getWordCount = (text: string) => {
    if (!text.trim()) return 0
    return text.trim().split(/\s+/).length
  }

  const getCharacterCount = (text: string) => {
    return text.length
  }

  return (
    <div className="h-full flex flex-col">
      {/* Editor Card */}
      <div className="glass-card p-8 flex flex-col h-full">
        {/* Window Chrome */}
        <div className="window-chrome">
          <div className="window-dot red"></div>
          <div className="window-dot yellow"></div>
          <div className="window-dot green"></div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h2 className="heading-md text-white mb-3 flex items-center gap-3">
            <span className="text-3xl">📝</span>
            Your Content
          </h2>
          <p className="text-body text-white/70">
            Type or paste your text here to transform its tone using AI
          </p>
        </div>
        
        {/* Textarea */}
        <div className="relative flex-1 flex flex-col">
          <textarea
            ref={textareaRef}
            id="text-editor"
            value={history.present}
            onChange={handleTextChange}
            disabled={ui.isTransforming}
            placeholder="Start typing your text here... Let AI help you find the perfect tone for your message. ✨"
            className="input-glass w-full resize-none text-body flex-1"
            style={{ overflow: 'hidden' }}
          />
          
          {ui.isTransforming && <LoadingOverlay />}
        </div>

        {/* Stats Display */}
        <div className="flex items-center gap-4 mt-6">
          <div className="stats-display">
            <span className="font-semibold text-white">
              {getWordCount(history.present)} words
            </span>
          </div>
          <div className="stats-display">
            <span className="font-semibold text-white">
              {getCharacterCount(history.present)} characters
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
