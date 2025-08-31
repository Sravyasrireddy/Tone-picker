'use client'

import { useState, useEffect } from 'react'
import { Loader2, Check, Sparkles } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { getToneLabel, getToneTooltip, PROMPT_VERSION } from '@/lib/prompt'
import { toast } from 'sonner'

/**
 * Tone categories organized in 2-column layout matching the design
 */
const TONE_CATEGORIES = {
  left: [
    { label: 'Professional', coords: { x: 0, y: -1 } },
    { label: 'Friendly', coords: { x: -1, y: 0 } },
    { label: 'Confident', coords: { x: -1, y: -1 } },
    { label: 'Persuasive', coords: { x: -1, y: 1 } },
    { label: 'Concise', coords: { x: 0, y: 1 } },
    { label: 'Humorous', coords: { x: 1, y: 1 } }
  ],
  right: [
    { label: 'Casual', coords: { x: 1, y: -1 } },
    { label: 'Formal', coords: { x: 0, y: 0 } },
    { label: 'Empathetic', coords: { x: 1, y: 0 } },
    { label: 'Creative', coords: { x: 2, y: 0 } },
    { label: 'Detailed', coords: { x: 2, y: 1 } },
    { label: 'Serious', coords: { x: 2, y: -1 } }
  ]
}

/**
 * Tone matrix component with modern glassmorphism design
 */
export function ToneMatrix() {
  const { history, ui, selectCell, setTransforming, applyTransform, setError, setStatus } = useEditorStore()
  const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number } | null>(null)

  const handleCellClick = async (coords: { x: number; y: number }) => {
    if (ui.isTransforming) return
    
    const text = history.present.trim()
    if (!text) {
      toast.error('Please type some text first!')
      return
    }

    selectCell(coords)
    setTransforming(true)
    setPendingCoords(coords)
    setError(undefined)

    try {
      const response = await fetch('/api/tone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          coords,
          promptVersion: PROMPT_VERSION,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed')
      }

      const { transformed, cached } = data
      
      if (transformed) {
        applyTransform(transformed, { cached })
        toast.success(
          cached ? 'Used cached result!' : 'Text transformed successfully!'
        )
      } else {
        throw new Error('No transformation received')
      }

    } catch (error: any) {
      console.error('Tone transformation error:', error)
      
      let errorCode = 'INTERNAL_ERROR'
      let errorMessage = error.message || 'An unexpected error occurred'
      let retryAfterMs: number | undefined

      if (error.message?.includes('rate limit')) {
        errorCode = 'RATE_LIMITED'
        errorMessage = 'Too many requests. Please slow down.'
      } else if (error.message?.includes('API key')) {
        errorCode = 'AUTH_ERROR'
        errorMessage = 'API configuration error. Please check your setup.'
      }

      setError({
        code: errorCode,
        message: errorMessage,
        retryAfterMs,
      })

      toast.error(errorMessage)
    } finally {
      setTransforming(false)
      setPendingCoords(null)
    }
  }

  const getCellState = (coords: { x: number; y: number }) => {
    if (pendingCoords && pendingCoords.x === coords.x && pendingCoords.y === coords.y) {
      return 'pending'
    }
    if (ui.selected && ui.selected.x === coords.x && ui.selected.y === coords.y) {
      return 'selected'
    }
    return 'idle'
  }

  const getCellClasses = (coords: { x: number; y: number }) => {
    const state = getCellState(coords)
    const baseClasses = 'tone-cell w-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent'
    
    switch (state) {
      case 'pending':
        return `${baseClasses} pending`
      case 'selected':
        return `${baseClasses} selected`
      default:
        return `${baseClasses}`
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-card p-8 flex flex-col h-full">
        <div className="text-center mb-8">
          <h2 className="heading-md text-white mb-3 flex items-center justify-center gap-3">
            <span className="text-3xl">🎨</span>
            Tone Matrix
          </h2>
          <p className="text-body text-white/70">
            Click a cell to transform your text's tone
          </p>
        </div>
        
        {/* Beautiful 2-Column Matrix Layout */}
        <div className="grid grid-cols-2 gap-6 mb-8 flex-1">
          {/* Left Column */}
          <div className="space-y-3">
            {TONE_CATEGORIES.left.map((tone) => (
              <button
                key={`${tone.coords.x}-${tone.coords.y}`}
                onClick={() => handleCellClick(tone.coords)}
                disabled={ui.isTransforming}
                className={`${getCellClasses(tone.coords)} tone-matrix-btn w-full`}
                title={getToneTooltip(tone.coords)}
                aria-label={`Apply ${tone.label} tone`}
              >
                <div className="flex items-center justify-center h-full relative z-10">
                  {getCellState(tone.coords) === 'pending' ? (
                    <div className="loading-spinner"></div>
                  ) : getCellState(tone.coords) === 'selected' ? (
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5" />
                      <span className="font-semibold text-base">{tone.label}</span>
                      <Sparkles className="w-4 h-4 sparkle" />
                    </div>
                  ) : (
                    <span className="font-semibold text-base">{tone.label}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {/* Right Column */}
          <div className="space-y-3">
            {TONE_CATEGORIES.right.map((tone) => (
              <button
                key={`${tone.coords.x}-${tone.coords.y}-right`}
                onClick={() => handleCellClick(tone.coords)}
                disabled={ui.isTransforming}
                className={`${getCellClasses(tone.coords)} tone-matrix-btn w-full`}
                title={getToneTooltip(tone.coords)}
                aria-label={`Apply ${tone.label} tone`}
              >
                <div className="flex items-center justify-center h-full relative z-10">
                  {getCellState(tone.coords) === 'pending' ? (
                    <div className="loading-spinner"></div>
                  ) : getCellState(tone.coords) === 'selected' ? (
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5" />
                      <span className="font-semibold text-base">{tone.label}</span>
                      <Sparkles className="w-4 h-4 sparkle" />
                    </div>
                  ) : (
                    <span className="font-semibold text-base">{tone.label}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Current Selection Badge */}
        {ui.selected && (
          <div className="text-center">
            <div className="tone-badge">
              <Sparkles className="w-4 h-4 sparkle" />
              Current: {
                [...TONE_CATEGORIES.left, ...TONE_CATEGORIES.right]
                  .find(tone => tone.coords.x === ui.selected?.x && tone.coords.y === ui.selected?.y)?.label || 
                getToneLabel(ui.selected)
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
