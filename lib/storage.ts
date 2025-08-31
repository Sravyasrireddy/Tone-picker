import { debounce } from 'lodash'

/**
 * Storage schema version - increment when changing structure
 */
const STORAGE_SCHEMA_VERSION = '1.0.0'

/**
 * Storage key for the application data
 */
const STORAGE_KEY = 'tone-picker-text-tool'

/**
 * Interface for stored data
 */
export interface StoredData {
  schemaVersion: string
  history: {
    past: string[]
    present: string
    future: string[]
  }
  ui: {
    selected: { x: number; y: number } | null
  }
  timestamp: number
}

/**
 * Default stored data structure
 */
const defaultStoredData: StoredData = {
  schemaVersion: STORAGE_SCHEMA_VERSION,
  history: {
    past: [],
    present: '',
    future: [],
  },
  ui: {
    selected: null,
  },
  timestamp: Date.now(),
}

/**
 * Save data to localStorage with debouncing
 */
export const saveToStorage = debounce((data: Partial<StoredData>) => {
  try {
    if (typeof window === 'undefined') return
    
    const existing = loadFromStorage()
    const merged = {
      ...existing,
      ...data,
      timestamp: Date.now(),
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}, 300)

/**
 * Load data from localStorage
 */
export function loadFromStorage(): StoredData {
  try {
    if (typeof window === 'undefined') return defaultStoredData
    
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultStoredData
    
    const parsed = JSON.parse(stored) as StoredData
    
    // Check schema version compatibility
    if (parsed.schemaVersion !== STORAGE_SCHEMA_VERSION) {
      console.warn('Storage schema version mismatch, clearing data')
      clearStorage()
      return defaultStoredData
    }
    
    return parsed
  } catch (error) {
    console.warn('Failed to load from localStorage:', error)
    return defaultStoredData
  }
}

/**
 * Clear all stored data
 */
export function clearStorage(): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear localStorage:', error)
  }
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false
    
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}
