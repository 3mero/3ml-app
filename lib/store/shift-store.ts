import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { ShiftState } from "@/lib/types"
import { safeLocalStorage } from "@/lib/utils"
import db from "@/lib/db"

export const useShiftStore = create<ShiftState>()(
  persist(
    (set, get) => ({
      shifts: [],

      addShift: (shift) => {
        // Guardar en la base de datos local
        if (db) {
          db.saveShift(shift)
        }

        set((state) => {
          const newShifts = [...state.shifts, shift]

          // Guardar manualmente en localStorage para asegurar persistencia
          try {
            localStorage.setItem(
              "work-shifts-storage",
              JSON.stringify({
                state: { shifts: newShifts },
                version: 0,
              }),
            )
          } catch (error) {
            console.error("Error saving shifts to localStorage:", error)
          }

          return { shifts: newShifts }
        })
      },

      updateShift: (id, updatedShift) => {
        // Guardar en la base de datos local
        if (db) {
          db.saveShift(updatedShift)
        }

        set((state) => {
          const updatedShifts = state.shifts.map((shift) => (shift.id === id ? updatedShift : shift))

          // Guardar manualmente en localStorage
          try {
            localStorage.setItem(
              "work-shifts-storage",
              JSON.stringify({
                state: { shifts: updatedShifts },
                version: 0,
              }),
            )
          } catch (error) {
            console.error("Error saving updated shifts to localStorage:", error)
          }

          return { shifts: updatedShifts }
        })
      },

      deleteShift: (id) => {
        // Eliminar de la base de datos local
        if (db) {
          db.deleteShift(id)
        }

        set((state) => {
          const filteredShifts = state.shifts.filter((shift) => shift.id !== id)

          // Guardar manualmente en localStorage
          try {
            localStorage.setItem(
              "work-shifts-storage",
              JSON.stringify({
                state: { shifts: filteredShifts },
                version: 0,
              }),
            )
          } catch (error) {
            console.error("Error saving shifts after delete to localStorage:", error)
          }

          return { shifts: filteredShifts }
        })
      },
    }),
    {
      name: "work-shifts-storage",
      storage: createJSONStorage(() => safeLocalStorage),
      // Añadir una función onRehydrateStorage para verificar que los datos se cargaron correctamente
      onRehydrateStorage: () => (state) => {
        if (state && (!state.shifts || state.shifts.length === 0)) {
          console.log("Rehydrating shift store from DB")
          // Intentar cargar datos de la base de datos local
          if (db) {
            const dbShifts = db.getShifts()
            if (dbShifts.length > 0) {
              state.shifts = dbShifts
            }
          }
        }
      },
    },
  ),
)

