'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'

/**
 * Error banner component with modern glassmorphism design
 */
export function ErrorBanner() {
  const { ui, setError, setTransforming } = useEditorStore()
  const { lastError } = ui

  if (!lastError) return null

  const handleRetry = () => {
    setError(undefined)
    setTransforming(false)
  }

  const formatRetryTime = (ms?: number) => {
    if (!ms) return ''
    const seconds = Math.ceil(ms / 1000)
    return ` (retry in ${seconds}s)`
  }

  return (
    <div className="glass-card border-red-400/30 p-6 fade-in-up">
      <div className="flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="heading-md text-white mb-2">
            {lastError.code === 'AUTH_ERROR' && '🔐 Authentication Error'}
            {lastError.code === 'RATE_LIMITED' && '⏱️ Rate Limited'}
            {lastError.code === 'UPSTREAM_ERROR' && '🌐 Service Unavailable'}
            {lastError.code === 'VALIDATION_ERROR' && '❌ Invalid Request'}
            {lastError.code === 'VERSION_MISMATCH' && '🔄 Version Mismatch'}
            {lastError.code === 'EMPTY_RESPONSE' && '📭 Empty Response'}
            {lastError.code === 'INTERNAL_ERROR' && '⚡ Internal Error'}
          </h3>
          <p className="text-body text-white/80 mb-4">
            {lastError.message}
            {lastError.retryAfterMs && formatRetryTime(lastError.retryAfterMs)}
          </p>
        </div>
        <button
          onClick={handleRetry}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    </div>
  )
}
