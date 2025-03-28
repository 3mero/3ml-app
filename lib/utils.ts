import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

      // Si el error es por espacio insuficiente, intentar liberar espacio
      if (
        error instanceof DOMException &&
        (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
      ) {
        try {
          // Preservar las claves importantes
          const keysToPreserve = [
            "work-schedule-storage",
            "work-shifts-storage",
            "work-employees-storage",
            "current-schedule-id",
            "schedule-visited",
            "schedule-view-mode",
          ]

          // Eliminar elementos antiguos para liberar espacio
          for (let i = 0; i < localStorage.length; i++) {
            const storageKey = localStorage.key(i)
            if (storageKey && !keysToPreserve.includes(storageKey)) {
              localStorage.removeItem(storageKey)
            }
          }

          // Intentar guardar de nuevo
          localStorage.setItem(key, value)
        } catch (e) {
          console.error("No se pudo liberar espacio en localStorage:", e)

          // Último recurso: limpiar todo excepto lo esencial
          if (key === "work-schedule-storage" || key === "work-shifts-storage" || key === "work-employees-storage") {
            try {
              localStorage.clear()
              localStorage.setItem(key, value)
            } catch (finalError) {
              console.error("Error fatal al guardar datos:", finalError)
            }
          }
        }
      }
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

  // Método para verificar si localStorage está disponible y funcionando
  isAvailable: (): boolean => {
    if (!isClient) return false
    try {
      const testKey = "__test__"
      localStorage.setItem(testKey, testKey)
      const result = localStorage.getItem(testKey) === testKey
      localStorage.removeItem(testKey)
      console.log("localStorage availability check:", result)
      return result
    } catch (e) {
      console.error("localStorage is not available:", e)
      return false
    }
  },
}

// Format date for Arabic locale
export function formatDate(date: Date | string, locale = "ar"): string {
  if (typeof date === "string") {
    date = new Date(date)
  }

  if (locale === "ar") {
    return format(date, "dd MMMM yyyy", { locale: ar })
  } else {
    return format(date, "dd/MM/yyyy")
  }
}

// Generate days for a month
export function generateMonthDays(year: number, month: number): Date[] {
  const result: Date[] = []
  const date = new Date(year, month, 1)

  while (date.getMonth() === month) {
    result.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }

  return result
}

// Generate color shades
export function generateColorShades(baseColor: string, count = 5): string[] {
  // Simple implementation - in a real app, use a proper color library
  const shades: string[] = []

  // Convert hex to RGB
  const r = Number.parseInt(baseColor.slice(1, 3), 16)
  const g = Number.parseInt(baseColor.slice(3, 5), 16)
  const b = Number.parseInt(baseColor.slice(5, 7), 16)

  for (let i = 0; i < count; i++) {
    // Calculate shade factor (0 to 1)
    const factor = i / (count - 1)

    // Mix with white for lighter shades
    const rShade = Math.round(r + (255 - r) * factor)
    const gShade = Math.round(g + (255 - g) * factor)
    const bShade = Math.round(b + (255 - b) * factor)

    // Convert back to hex
    const hexShade =
      "#" +
      rShade.toString(16).padStart(2, "0") +
      gShade.toString(16).padStart(2, "0") +
      bShade.toString(16).padStart(2, "0")

    shades.push(hexShade)
  }

  return shades
}

