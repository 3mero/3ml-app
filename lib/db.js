// Mejorar la base de datos local para garantizar persistencia
class DB {
  constructor() {
    this.data = {}
    this.init()
  }

  init() {
    if (typeof window !== "undefined") {
      try {
        // Intentar cargar datos de localStorage
        const storedData = localStorage.getItem("schedule-db")
        if (storedData) {
          this.data = JSON.parse(storedData)
        }

        // Verificar si hay datos en los stores de Zustand y migrarlos
        this.migrateFromZustandStores()

        // Verificar integridad de los datos
        this.ensureDataStructure()

        // Guardar inmediatamente para asegurar que los datos estén disponibles
        this.save()

        console.log("DB initialized successfully with data:", this.data)
      } catch (error) {
        console.error("Error initializing DB:", error)
        this.data = this.getDefaultData()
        this.save()
      }
    }
  }

  getDefaultData() {
    return {
      schedules: [],
      shifts: [],
      employees: [],
    }
  }

  ensureDataStructure() {
    // Asegurar que todas las propiedades necesarias existan
    if (!this.data.schedules) this.data.schedules = []
    if (!this.data.shifts) this.data.shifts = []
    if (!this.data.employees) this.data.employees = []
  }

  migrateFromZustandStores() {
    try {
      // Migrar datos de los stores de Zustand
      const scheduleStore = localStorage.getItem("work-schedule-storage")
      const shiftStore = localStorage.getItem("work-shifts-storage")
      const employeeStore = localStorage.getItem("work-employees-storage")

      let dataChanged = false

      if (scheduleStore) {
        try {
          const parsedScheduleStore = JSON.parse(scheduleStore)
          if (parsedScheduleStore.state) {
            if (parsedScheduleStore.state.savedSchedules && parsedScheduleStore.state.savedSchedules.length > 0) {
              this.data.schedules = parsedScheduleStore.state.savedSchedules
              dataChanged = true
              console.log("Migrated schedules from Zustand store:", this.data.schedules.length)
            }

            // También guardar el horario actual si existe
            if (parsedScheduleStore.state.currentSchedule) {
              localStorage.setItem("current-schedule-id", parsedScheduleStore.state.currentSchedule.id)
            }
          }
        } catch (e) {
          console.error("Error parsing schedule store:", e)
        }
      }

      if (shiftStore) {
        try {
          const parsedShiftStore = JSON.parse(shiftStore)
          if (parsedShiftStore.state && parsedShiftStore.state.shifts) {
            this.data.shifts = parsedShiftStore.state.shifts
            dataChanged = true
            console.log("Migrated shifts from Zustand store:", this.data.shifts.length)
          }
        } catch (e) {
          console.error("Error parsing shift store:", e)
        }
      }

      if (employeeStore) {
        try {
          const parsedEmployeeStore = JSON.parse(employeeStore)
          if (parsedEmployeeStore.state && parsedEmployeeStore.state.employees) {
            this.data.employees = parsedEmployeeStore.state.employees
            dataChanged = true
            console.log("Migrated employees from Zustand store:", this.data.employees.length)
          }
        } catch (e) {
          console.error("Error parsing employee store:", e)
        }
      }

      if (dataChanged) {
        this.save()
      }
    } catch (error) {
      console.error("Error migrating data from Zustand stores:", error)
    }
  }

  save() {
    if (typeof window !== "undefined") {
      try {
        // Guardar datos en localStorage
        localStorage.setItem("schedule-db", JSON.stringify(this.data))

        // También guardar una copia de respaldo
        localStorage.setItem("schedule-db-backup", JSON.stringify(this.data))
      } catch (error) {
        console.error("Error saving DB:", error)

        // Intentar limpiar datos antiguos si el almacenamiento está lleno
        if (
          error instanceof DOMException &&
          (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
        ) {
          this.cleanupOldData()
          try {
            localStorage.setItem("schedule-db", JSON.stringify(this.data))
          } catch (e) {
            console.error("Still couldn't save after cleanup:", e)

            // Último recurso: guardar solo los datos esenciales
            try {
              const essentialData = {
                schedules: this.data.schedules.slice(0, 5),
                shifts: this.data.shifts.slice(0, 10),
                employees: this.data.employees.slice(0, 10),
              }
              localStorage.setItem("schedule-db", JSON.stringify(essentialData))
            } catch (finalError) {
              console.error("Fatal error saving data:", finalError)
            }
          }
        }
      }
    }
  }

  cleanupOldData() {
    // Limpiar datos antiguos
    if (this.data.schedules && this.data.schedules.length > 10) {
      // Mantener solo los 10 horarios más recientes
      this.data.schedules = this.data.schedules
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 10)
    }

    // Limpiar otros datos si es necesario
    if (this.data.shifts && this.data.shifts.length > 20) {
      this.data.shifts = this.data.shifts.slice(0, 20)
    }

    if (this.data.employees && this.data.employees.length > 20) {
      this.data.employees = this.data.employees.slice(0, 20)
    }
  }

  // CRUD operations for schedules
  getSchedules() {
    return this.data.schedules || []
  }

  getScheduleById(id) {
    const schedules = this.getSchedules()
    return schedules.find((schedule) => schedule.id === id) || null
  }

  saveSchedule(schedule) {
    // Asegurar que el horario tenga todos los campos necesarios
    const scheduleToSave = {
      ...schedule,
      createdAt: schedule.createdAt || new Date().toISOString(),
    }

    const schedules = this.getSchedules()
    const index = schedules.findIndex((s) => s.id === scheduleToSave.id)

    if (index >= 0) {
      // Update existing schedule
      schedules[index] = scheduleToSave
    } else {
      // Add new schedule
      schedules.push(scheduleToSave)
    }

    this.data.schedules = schedules
    this.save()

    // También guardar en el store de Zustand directamente
    try {
      const zustandStore = localStorage.getItem("work-schedule-storage")
      if (zustandStore) {
        const parsedStore = JSON.parse(zustandStore)
        if (parsedStore.state) {
          // Actualizar savedSchedules
          const savedSchedules = parsedStore.state.savedSchedules || []
          const scheduleIndex = savedSchedules.findIndex((s) => s.id === scheduleToSave.id)

          if (scheduleIndex >= 0) {
            savedSchedules[scheduleIndex] = scheduleToSave
          } else {
            savedSchedules.push(scheduleToSave)
          }

          parsedStore.state.savedSchedules = savedSchedules

          // Actualizar currentSchedule si es el mismo ID
          if (parsedStore.state.currentSchedule && parsedStore.state.currentSchedule.id === scheduleToSave.id) {
            parsedStore.state.currentSchedule = scheduleToSave
          }

          localStorage.setItem("work-schedule-storage", JSON.stringify(parsedStore))
        }
      }
    } catch (e) {
      console.error("Error updating Zustand store:", e)
    }

    return scheduleToSave
  }

  deleteSchedule(id) {
    const schedules = this.getSchedules()
    this.data.schedules = schedules.filter((schedule) => schedule.id !== id)
    this.save()

    // También eliminar del store de Zustand
    try {
      const zustandStore = localStorage.getItem("work-schedule-storage")
      if (zustandStore) {
        const parsedStore = JSON.parse(zustandStore)
        if (parsedStore.state) {
          // Actualizar savedSchedules
          parsedStore.state.savedSchedules = (parsedStore.state.savedSchedules || []).filter((s) => s.id !== id)

          // Actualizar currentSchedule si es el mismo ID
          if (parsedStore.state.currentSchedule && parsedStore.state.currentSchedule.id === id) {
            parsedStore.state.currentSchedule = null
          }

          localStorage.setItem("work-schedule-storage", JSON.stringify(parsedStore))
        }
      }
    } catch (e) {
      console.error("Error updating Zustand store after delete:", e)
    }
  }

  // CRUD operations for shifts
  getShifts() {
    return this.data.shifts || []
  }

  saveShift(shift) {
    const shifts = this.getShifts()
    const index = shifts.findIndex((s) => s.id === shift.id)

    if (index >= 0) {
      shifts[index] = shift
    } else {
      shifts.push(shift)
    }

    this.data.shifts = shifts
    this.save()

    // También guardar en el store de Zustand
    try {
      const zustandStore = localStorage.getItem("work-shifts-storage")
      if (zustandStore) {
        const parsedStore = JSON.parse(zustandStore)
        if (parsedStore.state) {
          const storeShifts = parsedStore.state.shifts || []
          const shiftIndex = storeShifts.findIndex((s) => s.id === shift.id)

          if (shiftIndex >= 0) {
            storeShifts[shiftIndex] = shift
          } else {
            storeShifts.push(shift)
          }

          parsedStore.state.shifts = storeShifts
          localStorage.setItem("work-shifts-storage", JSON.stringify(parsedStore))
        }
      }
    } catch (e) {
      console.error("Error updating Zustand shift store:", e)
    }

    return shift
  }

  deleteShift(id) {
    const shifts = this.getShifts()
    this.data.shifts = shifts.filter((shift) => shift.id !== id)
    this.save()

    // También eliminar del store de Zustand
    try {
      const zustandStore = localStorage.getItem("work-shifts-storage")
      if (zustandStore) {
        const parsedStore = JSON.parse(zustandStore)
        if (parsedStore.state) {
          parsedStore.state.shifts = (parsedStore.state.shifts || []).filter((s) => s.id !== id)
          localStorage.setItem("work-shifts-storage", JSON.stringify(parsedStore))
        }
      }
    } catch (e) {
      console.error("Error updating Zustand shift store after delete:", e)
    }
  }

  // CRUD operations for employees
  getEmployees() {
    return this.data.employees || []
  }

  saveEmployee(employee) {
    const employees = this.getEmployees()
    const index = employees.findIndex((e) => e.id === employee.id)

    if (index >= 0) {
      employees[index] = employee
    } else {
      employees.push(employee)
    }

    this.data.employees = employees
    this.save()

    // También guardar en el store de Zustand
    try {
      const zustandStore = localStorage.getItem("work-employees-storage")
      if (zustandStore) {
        const parsedStore = JSON.parse(zustandStore)
        if (parsedStore.state) {
          const storeEmployees = parsedStore.state.employees || []
          const employeeIndex = storeEmployees.findIndex((e) => e.id === employee.id)

          if (employeeIndex >= 0) {
            storeEmployees[employeeIndex] = employee
          } else {
            storeEmployees.push(employee)
          }

          parsedStore.state.employees = storeEmployees
          localStorage.setItem("work-employees-storage", JSON.stringify(parsedStore))
        }
      }
    } catch (e) {
      console.error("Error updating Zustand employee store:", e)
    }

    return employee
  }

  deleteEmployee(id) {
    const employees = this.getEmployees()
    this.data.employees = employees.filter((employee) => employee.id !== id)
    this.save()

    // También eliminar del store de Zustand
    try {
      const zustandStore = localStorage.getItem("work-employees-storage")
      if (zustandStore) {
        const parsedStore = JSON.parse(zustandStore)
        if (parsedStore.state) {
          parsedStore.state.employees = (parsedStore.state.employees || []).filter((e) => e.id !== id)
          localStorage.setItem("work-employees-storage", JSON.stringify(parsedStore))
        }
      }
    } catch (e) {
      console.error("Error updating Zustand employee store after delete:", e)
    }
  }

  // Clear all data
  clearAll() {
    this.data = this.getDefaultData()
    this.save()

    // También limpiar los stores de Zustand
    try {
      localStorage.removeItem("work-schedule-storage")
      localStorage.removeItem("work-shifts-storage")
      localStorage.removeItem("work-employees-storage")
    } catch (e) {
      console.error("Error clearing Zustand stores:", e)
    }
  }
}

// Create a singleton instance
const db = typeof window !== "undefined" ? new DB() : null

export default db

