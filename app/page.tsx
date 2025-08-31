'use client'

import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { Sparkles, Palette, Zap, Heart } from 'lucide-react'
import { Editor } from '@/components/Editor'
import { ToneMatrix } from '@/components/ToneMatrix'
import { Toolbar } from '@/components/Toolbar'
import { ErrorBanner } from '@/components/ErrorBanner'
import { useEditorStore } from '@/store/useEditorStore'
import { useHotkeys } from '@/hooks/useHotkeys'

/**
 * Main page component with modern glassmorphism design
 */
export default function HomePage() {
  const { hydrateFromStorage } = useEditorStore()
  
  // Initialize hotkeys
  useHotkeys()
  
  // Hydrate from localStorage on mount
  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  return (
    <div className="min-h-screen particle-bg">
      {/* Animated Background Orbs */}
      <div className="gradient-orb gradient-orb-1"></div>
      <div className="gradient-orb gradient-orb-2"></div>
      <div className="gradient-orb gradient-orb-3"></div>

      {/* Header Section */}
      <header className="glass px-8 py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Left spacer */}
            <div className="flex-1"></div>
            
            {/* Centered Logo and Title */}
            <div className="text-center fade-in-up">
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-200 to-stone-300 flex items-center justify-center shadow-2xl">
                  <Palette className="w-10 h-10 text-stone-700" />
                </div>
                <div>
                  <h1 className="heading-xl text-gradient mb-3">
                    Tone Picker
                  </h1>
                  <p className="text-body text-stone-600 text-lg">
                    Text Tool
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right side - Toolbar */}
            <div className="flex-1 flex justify-end">
              <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Toolbar />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      <div className="px-8 py-8 mt-8">
        <ErrorBanner />
      </div>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-8 py-16 mt-8 min-h-[calc(100vh-300px)]">
        <div className="workspace-grid h-full gap-12">
          {/* Editor Section */}
          <div className="fade-in-left h-full" style={{ animationDelay: '0.3s' }}>
            <Editor />
          </div>
          
          {/* Tone Matrix Section */}
          <div className="fade-in-right h-full" style={{ animationDelay: '0.4s' }}>
            <ToneMatrix />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass px-8 py-8 border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-body text-stone-500">
            Made with <Heart className="inline w-4 h-4 text-rose-400" /> for creators everywhere
          </p>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(61, 56, 50, 0.15)',
            backdropFilter: 'blur(20px)',
            color: '#3d3832',
            border: '1px solid rgba(61, 56, 50, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(61, 56, 50, 0.15)',
          },
        }}
      />
    </div>
  )
}
