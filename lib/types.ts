// نموذج الوردية
export interface Shift {
  id: string
  name: string
  color: string
  startTime: string
  endTime: string
  isNightShift: boolean
}

// نموذج الموظف
export interface Employee {
  id: string
  name: string
  position: string
  maxShiftsPerWeek: number
  preferredShifts: string[]
}

// نموذج يوم العمل
export interface WorkDay {
  type: string // "work" أو "off"
  count: number
  color: string
}

// نموذج التعليق
export interface Comment {
  id: string
  date: string
  text: string
  importance: "low" | "medium" | "high"
  color: string
  reminder?: string
  isCompleted?: boolean
}

// نموذج الجدول
export interface Schedule {
  id: string
  name: string
  startDate: string
  months: number
  workDays: WorkDay[]
  notes: Record<string, string>
  pins: Record<string, boolean>
  monthColors: Record<string, string>
  backgroundColor?: string
  createdAt?: string
  employeeName?: string
  comments: Comment[]
  showComments: boolean
  assignments?: Record<string, string>
}

// نموذج حالة مخزن الجداول
export interface ScheduleState {
  schedules: Schedule[]
  currentSchedule: Schedule | null
  savedSchedules: Schedule[]

  initializeSchedule: () => void
  createNewSchedule: (schedule: Schedule) => void
  saveSchedule: (schedule: Schedule) => void
  exportSchedule: (id: string) => void
  importSchedule: (scheduleData: string) => void

  addComment: (scheduleId: string, comment: Comment) => void
  updateComment: (scheduleId: string, commentId: string, comment: Comment) => void
  deleteComment: (scheduleId: string, commentId: string) => void
  toggleCommentCompletion: (scheduleId: string, commentId: string) => void

  togglePinDay: (scheduleId: string, date: string) => void
  assignShift: (scheduleId: string, date: string, shiftId: string) => void
  removeShift: (scheduleId: string, date: string) => void
  updateSchedule: (id: string, schedule: Schedule) => void
}

// نموذج حالة مخزن الورديات
export interface ShiftState {
  shifts: Shift[]

  addShift: (shift: Shift) => void
  updateShift: (id: string, shift: Shift) => void
  deleteShift: (id: string) => void
}

// نموذج حالة مخزن الموظفين
export interface EmployeeState {
  employees: Employee[]

  addEmployee: (employee: Employee) => void
  updateEmployee: (id: string, employee: Employee) => void
  deleteEmployee: (id: string) => void
}

