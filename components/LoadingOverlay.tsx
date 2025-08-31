'use client'

import { Loader2 } from 'lucide-react'

/**
 * Loading overlay component with modern glassmorphism design
 */
export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 glass-card rounded-lg flex items-center justify-center z-10">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <p className="text-body text-white font-medium">Transforming text...</p>
      </div>
    </div>
  )
}
