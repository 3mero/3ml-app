// lib/safe-local-storage.ts

// Check if code is running in browser
const isClient = typeof window !== "undefined"

// Safe localStorage implementation to handle errors
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isClient) return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage:`, error)
      return null
    }
  },

  setItem: (key: string, value: string): void => {
    if (!isClient) return
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage:`, error)
    }
  },

  removeItem: (key: string): void => {
    if (!isClient) return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error)
    }
  },

  isAvailable: (): boolean => {
    if (!isClient) return false
    try {
      const testKey = "__test__"
      localStorage.setItem(testKey, testKey)
      const result = localStorage.getItem(testKey) === testKey
      localStorage.removeItem(testKey)
      return result
    } catch (e) {
      console.error("localStorage is not available:", e)
      return false
    }
  },
}

