import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { saveToStorage, loadFromStorage, StoredData } from '@/lib/storage'

/**
 * History state interface
 */
export interface HistoryState {
  past: string[]
  present: string
  future: string[]
}

/**
 * UI state interface
 */
export interface UIState {
  isTransforming: boolean
  selected: { x: number; y: number } | null
  lastError?: {
    code: string
    message: string
    retryAfterMs?: number
  }
  lastStatus?: string
}

/**
 * Editor store state
 */
interface EditorState {
  history: HistoryState
  ui: UIState
  initialText: string
  hasInitialized: boolean
}

/**
 * Editor store actions
 */
interface EditorActions {
  // Text management
  setText: (text: string, skipHistory?: boolean) => void
  applyTransform: (transformed: string, meta?: { cached?: boolean }) => void
  
  // History management
  undo: () => void
  redo: () => void
  reset: () => void
  
  // UI management
  selectCell: (coords: { x: number; y: number } | null) => void
  setTransforming: (isTransforming: boolean) => void
  setError: (error?: { code: string; message: string; retryAfterMs?: number }) => void
  setStatus: (status?: string) => void
  
  // Storage
  hydrateFromStorage: () => void
  persistToStorage: () => void
  clearStorage: () => void
}

/**
 * Editor store type
 */
type EditorStore = EditorState & EditorActions

/**
 * Create the editor store
 */
export const useEditorStore = create<EditorStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      history: {
        past: [],
        present: '',
        future: [],
      },
      ui: {
        isTransforming: false,
        selected: null,
      },
      initialText: '',
      hasInitialized: false,

      // Text management
      setText: (text: string, skipHistory = false) =>
        set((state) => {
          if (skipHistory) {
            state.history.present = text
            if (!state.hasInitialized) {
              state.initialText = text
              state.hasInitialized = true
            }
          } else {
            // Push current text to history if it's different
            const current = state.history.present
            if (current !== text) {
              state.history.past.push(current)
              state.history.present = text
              state.history.future = []
            }
          }
        }),

      applyTransform: (transformed: string, meta = {}) =>
        set((state) => {
          const current = state.history.present
          
          // Only push to history if the text actually changed
          if (current !== transformed) {
            state.history.past.push(current)
            state.history.present = transformed
            state.history.future = []
          }
          
          // Clear error and set status
          state.ui.lastError = undefined
          state.ui.lastStatus = meta.cached ? 'Used cached result' : 'Transformation applied'
        }),

      // History management
      undo: () =>
        set((state) => {
          const { past, present, future } = state.history
          if (past.length === 0) return

          const previous = past[past.length - 1]
          const newPast = past.slice(0, past.length - 1)

          state.history.past = newPast
          state.history.present = previous
          state.history.future = [present, ...future]
        }),

      redo: () =>
        set((state) => {
          const { past, present, future } = state.history
          if (future.length === 0) return

          const next = future[0]
          const newFuture = future.slice(1)

          state.history.past = [...past, present]
          state.history.present = next
          state.history.future = newFuture
        }),

      reset: () =>
        set((state) => {
          state.history.past = []
          state.history.present = state.initialText
          state.history.future = []
          state.ui.selected = null
          state.ui.lastError = undefined
          state.ui.lastStatus = 'Reset to original text'
        }),

      // UI management
      selectCell: (coords) =>
        set((state) => {
          state.ui.selected = coords
        }),

      setTransforming: (isTransforming) =>
        set((state) => {
          state.ui.isTransforming = isTransforming
        }),

      setError: (error) =>
        set((state) => {
          state.ui.lastError = error
          if (error) {
            state.ui.lastStatus = `Error: ${error.message}`
          }
        }),

      setStatus: (status) =>
        set((state) => {
          state.ui.lastStatus = status
        }),

      // Storage
      hydrateFromStorage: () => {
        const stored = loadFromStorage()
        set((state) => {
          if (stored.history.present) {
            state.history = stored.history
            state.initialText = stored.history.present
            state.hasInitialized = true
          }
          if (stored.ui.selected) {
            state.ui.selected = stored.ui.selected
          }
        })
      },

      persistToStorage: () => {
        const state = get()
        const data: Partial<StoredData> = {
          history: state.history,
          ui: {
            selected: state.ui.selected,
          },
        }
        saveToStorage(data)
      },

      clearStorage: () => {
        set((state) => {
          state.history.past = []
          state.history.present = state.initialText
          state.history.future = []
          state.ui.selected = null
          state.ui.lastError = undefined
          state.ui.lastStatus = 'Storage cleared'
        })
      },
    }))
  )
)

// Subscribe to changes and persist to storage
useEditorStore.subscribe(
  (state) => ({ history: state.history, ui: { selected: state.ui.selected } }),
  (data) => {
    if (data.history.present) {
      saveToStorage(data)
    }
  }
)
