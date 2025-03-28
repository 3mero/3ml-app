import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { EmployeeState } from "@/lib/types"
import { safeLocalStorage } from "@/lib/utils"
import db from "@/lib/db"

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      employees: [],

      addEmployee: (employee) => {
        // Guardar en la base de datos local
        if (db) {
          db.saveEmployee(employee)
        }

        set((state) => {
          const newEmployees = [...state.employees, employee]

          // Guardar manualmente en localStorage para asegurar persistencia
          try {
            localStorage.setItem(
              "work-employees-storage",
              JSON.stringify({
                state: { employees: newEmployees },
                version: 0,
              }),
            )
          } catch (error) {
            console.error("Error saving employees to localStorage:", error)
          }

          return { employees: newEmployees }
        })
      },

      updateEmployee: (id, updatedEmployee) => {
        // Guardar en la base de datos local
        if (db) {
          db.saveEmployee(updatedEmployee)
        }

        set((state) => {
          const updatedEmployees = state.employees.map((employee) => (employee.id === id ? updatedEmployee : employee))

          // Guardar manualmente en localStorage
          try {
            localStorage.setItem(
              "work-employees-storage",
              JSON.stringify({
                state: { employees: updatedEmployees },
                version: 0,
              }),
            )
          } catch (error) {
            console.error("Error saving updated employees to localStorage:", error)
          }

          return { employees: updatedEmployees }
        })
      },

      deleteEmployee: (id) => {
        // Eliminar de la base de datos local
        if (db) {
          db.deleteEmployee(id)
        }

        set((state) => {
          const filteredEmployees = state.employees.filter((employee) => employee.id !== id)

          // Guardar manualmente en localStorage
          try {
            localStorage.setItem(
              "work-employees-storage",
              JSON.stringify({
                state: { employees: filteredEmployees },
                version: 0,
              }),
            )
          } catch (error) {
            console.error("Error saving employees after delete to localStorage:", error)
          }

          return { employees: filteredEmployees }
        })
      },
    }),
    {
      name: "work-employees-storage",
      storage: createJSONStorage(() => safeLocalStorage),
      // Añadir una función onRehydrateStorage para verificar que los datos se cargaron correctamente
      onRehydrateStorage: () => (state) => {
        if (state && (!state.employees || state.employees.length === 0)) {
          console.log("Rehydrating employee store from DB")
          // Intentar cargar datos de la base de datos local
          if (db) {
            const dbEmployees = db.getEmployees()
            if (dbEmployees.length > 0) {
              state.employees = dbEmployees
            }
          }
        }
      },
    },
  ),
)

