"use client"

import { useEffect, useState } from "react"
import { ScheduleGrid } from "@/components/schedule-grid"
import { ScheduleViewSelector } from "@/components/schedule-view-selector"
import { useScheduleStore } from "@/lib/store/schedule-store"
import { useShiftStore } from "@/lib/store/shift-store"
import { useEmployeeStore } from "@/lib/store/employee-store"
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Calendar, ChevronRight, X, Plus, ChevronLeft } from "lucide-react"
import { formatDate, safeLocalStorage } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"
import SettingsPanel from "@/components/settings-panel"

export default function HomePage() {
  const {
    initializeSchedule,
    currentSchedule,
    createNewSchedule,
    updateSchedule,
    loadScheduleFromHistory,
    savedSchedules,
    deleteScheduleFromHistory,
    resetStore,
    saveSchedule,
  } = useScheduleStore()
  const { shifts } = useShiftStore()
  const { employees, deleteEmployee } = useEmployeeStore()

  // Setup wizard states
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const [setupStep, setSetupStep] = useState(1)
  const [scheduleName, setScheduleName] = useState("جدول جديد")
  // تعديل تهيئة متغيرات التاريخ لتستخدم التاريخ الحالي
  const [startDate, setStartDate] = useState(new Date())
  const [workDays, setWorkDays] = useState(1)
  const [workColor, setWorkColor] = useState("#2E7D32") // أخضر غامق
  const [offDays, setOffDays] = useState(3)
  const [offColor, setOffColor] = useState("#FFFFFF") // أبيض
  const [months, setMonths] = useState(12)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [activeSettingsTab, setActiveSettingsTab] = useState("general")
  const [showDatePicker, setShowDatePicker] = useState(false) // إضافة متغير للتحكم في إظهار التقويم

  // Add after other state declarations
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [employeeName, setEmployeeName] = useState("")
  const [employeePosition, setEmployeePosition] = useState("")

  // Add a new state variable for maximum shifts per week
  const [maxShiftsPerWeek, setMaxShiftsPerWeek] = useState(5)

  // تعديل نموذج إضافة الموظف ليكون مشابهًا للمعالج الأولي
  const [employeeSetupStep, setEmployeeSetupStep] = useState(1)
  const [employeeWorkDays, setEmployeeWorkDays] = useState(1)
  const [employeeOffDays, setEmployeeOffDays] = useState(3)
  const [employeeWorkColor, setEmployeeWorkColor] = useState("#4CAF50")
  const [employeeOffColor, setEmployeeOffColor] = useState("#FFFFFF")
  const [employeeMonths, setEmployeeMonths] = useState(12)
  // تعديل تهيئة متغيرات التاريخ لتستخدم التاريخ الحالي
  const [employeeStartDate, setEmployeeStartDate] = useState(new Date())
  const [showEmployeeDatePicker, setShowEmployeeDatePicker] = useState(false) // إضافة متغير للتحكم في إظهار التقويم للموظف
  const [scheduleViewMode, setScheduleViewMode] = useState("cards") // "cards", "arrows", "all"

  // إضافة متغيرات لدعم أيام العمل المتعددة
  const [customWorkDays, setCustomWorkDays] = useState([
    { type: "work", count: workDays, color: workColor },
    { type: "off", count: offDays, color: offColor },
  ])

  // Flag to prevent infinite updates
  const [isInitialized, setIsInitialized] = useState(false)

  // أضف هذا الكود في بداية الدالة HomePage بعد تعريف المتغيرات مباشرة
  // إضافة useEffect لتطبيق الألوان عند تحميل الصفحة
  useEffect(() => {
    if (typeof window !== "undefined") {
      // تأخير صغير لضمان تحميل العناصر في DOM
      const applyColorsTimeout = setTimeout(() => {
        const mainBgColor = localStorage.getItem("main-bg-color") || "#ffffff"
        const scheduleBgColor = localStorage.getItem("schedule-bg-color") || "#ffffff"
        const settingsBgColor = localStorage.getItem("settings-bg-color") || "#ffffff"
        const notesBgColor = localStorage.getItem("notes-bg-color") || "#ffffff"
        const monthCardsBgColor = localStorage.getItem("month-cards-bg-color") || "#ffffff"

        // تطبيق ألوان الخلفية على المتغيرات CSS
        document.documentElement.style.setProperty("--main-bg-color", mainBgColor)
        document.documentElement.style.setProperty("--schedule-bg-color", scheduleBgColor)
        document.documentElement.style.setProperty("--settings-bg-color", settingsBgColor)
        document.documentElement.style.setProperty("--notes-bg-color", notesBgColor)
        document.documentElement.style.setProperty("--month-cards-bg-color", monthCardsBgColor)

        // تطبيق ألوان الخلفية على العناصر مباشرة
        document.getElementById("schedule-container")?.style.setProperty("background-color", mainBgColor)
        document.querySelectorAll(".schedule-grid-container, .schedule-cards").forEach((el) => {
          ;(el as HTMLElement).style.setProperty("background-color", scheduleBgColor)
        })
        document.querySelectorAll(".settings-panel").forEach((el) => {
          ;(el as HTMLElement).style.setProperty("background-color", settingsBgColor)
        })
        document.querySelectorAll(".notes-popup, .comment-modal").forEach((el) => {
          ;(el as HTMLElement).style.setProperty("background-color", notesBgColor)
        })
        document.querySelectorAll(".month-card").forEach((el) => {
          ;(el as HTMLElement).style.setProperty("background-color", monthCardsBgColor)
        })
      }, 500) // تأخير 500 مللي ثانية

      return () => clearTimeout(applyColorsTimeout)
    }
  }, [])

  // إضافة تحقق دوري لتحديث الجدول عند تغير الشهر
  useEffect(() => {
    if (typeof window !== "undefined") {
      // تخزين الشهر الحالي في localStorage
      const currentMonth = new Date().getMonth()
      const storedMonth = localStorage.getItem("current-month")

      if (storedMonth && Number(storedMonth) !== currentMonth) {
        console.log("تم تغيير الشهر من", storedMonth, "إلى", currentMonth)
        // تحديث الشهر المخزن
        localStorage.setItem("current-month", currentMonth.toString())

        // إعادة تحميل الجدول الحالي لتحديث الأشهر المرئية
        if (currentSchedule) {
          const updatedSchedule = {
            ...currentSchedule,
            lastUpdated: new Date().toISOString(), // إضافة طابع زمني للتحديث
          }
          saveSchedule(updatedSchedule)
        }
      } else if (!storedMonth) {
        // تخزين الشهر الحالي إذا لم يكن موجودًا
        localStorage.setItem("current-month", currentMonth.toString())
      }

      // إعداد فحص دوري للتحقق من تغير الشهر (مرة واحدة يوميًا)
      const checkMonthInterval = setInterval(() => {
        const newMonth = new Date().getMonth()
        const storedMonth = localStorage.getItem("current-month")

        if (storedMonth && Number(storedMonth) !== newMonth) {
          console.log("تم اكتشاف تغيير الشهر في الفحص الدوري")
          localStorage.setItem("current-month", newMonth.toString())

          // إعادة تحميل الصفحة لتحديث الجدول
          window.location.reload()
        }
      }, 86400000) // فحص مرة واحدة يوميًا (24 ساعة)

      return () => clearInterval(checkMonthInterval)
    }
  }, [currentSchedule, saveSchedule])

  // Corregido: useEffect para evitar bucles infinitos
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      // Marcar como inicializado para evitar múltiples ejecuciones
      setIsInitialized(true)

      // Verificar si localStorage está disponible
      const isStorageAvailable = safeLocalStorage.isAvailable()

      // Verificar si es la primera visita
      const isFirstVisit = !localStorage.getItem("schedule-visited")

      if (isFirstVisit && isStorageAvailable) {
        localStorage.setItem("schedule-visited", "true")
        setShowSetupWizard(true)
      } else {
        // Asegurarse de que los datos se han cargado correctamente
        // Si no hay horarios cargados, forzar la inicialización
        if (!currentSchedule && savedSchedules.length === 0) {
          console.log("No schedules loaded, reinitializing schedule store")
          initializeSchedule()

          // Intentar cargar el último horario guardado
          setTimeout(() => {
            const lastScheduleId = localStorage.getItem("current-schedule-id")
            if (lastScheduleId && savedSchedules.length > 0) {
              const found = savedSchedules.find((s) => s.id === lastScheduleId)
              if (found) {
                loadScheduleFromHistory(lastScheduleId)
              } else if (savedSchedules.length > 0) {
                // Si no se encuentra el último horario, cargar el más reciente
                loadScheduleFromHistory(savedSchedules[savedSchedules.length - 1].id)
              }
            }
          }, 200) // Pequeño retraso para asegurar que los datos se han cargado
        }

        // Si hay un horario actual, pero no se ha cargado bien
        if (!currentSchedule && savedSchedules.length > 0) {
          loadScheduleFromHistory(savedSchedules[0].id)
        }
      }

      // Cargar el modo de visualización guardado
      const storedViewMode = localStorage.getItem("schedule-view-mode")
      if (storedViewMode) {
        setScheduleViewMode(storedViewMode)
      }

      // إذا كان هناك تاريخ محفوظ في localStorage، استخدمه، وإلا استخدم التاريخ الحالي
      const savedStartDate = localStorage.getItem("schedule-start-date")
      if (savedStartDate) {
        try {
          const parsedDate = new Date(savedStartDate)
          if (!isNaN(parsedDate.getTime())) {
            setStartDate(parsedDate)
          } else {
            setStartDate(new Date()) // استخدم التاريخ الحالي إذا كان التاريخ المحفوظ غير صالح
          }
        } catch (e) {
          setStartDate(new Date()) // استخدم التاريخ الحالي في حالة حدوث خطأ
        }
      } else {
        setStartDate(new Date()) // استخدم التاريخ الحالي إذا لم يكن هناك تاريخ محفوظ
      }
    }
  }, [isInitialized, initializeSchedule, savedSchedules, loadScheduleFromHistory, currentSchedule])

  // إضافة مستمع الحدث لفتح نموذج إضافة موظف من الإعدادات
  useEffect(() => {
    const handleOpenEmployeeForm = () => {
      setShowEmployeeForm(true)
    }

    window.addEventListener("openEmployeeForm", handleOpenEmployeeForm)

    return () => {
      window.removeEventListener("openEmployeeForm", handleOpenEmployeeForm)
    }
  }, [])

  // حفظ وضع العرض عند تغييره
  const handleViewModeChange = (mode: string) => {
    setScheduleViewMode(mode)
    localStorage.setItem("schedule-view-mode", mode)
  }

  // تعديل دالة handleCreateFromWizard لتستخدم التاريخ الحالي إذا لم يتم تحديد تاريخ
  const handleCreateFromWizard = () => {
    createNewSchedule({
      name: scheduleName || "جدول جديد",
      startDate: startDate.toISOString(),
      months: months,
      workDays: customWorkDays,
      notes: {},
      pins: {},
      monthColors: {},
      backgroundColor: "#ffffff",
      employeeName: scheduleName,
      comments: [],
      showComments: true,
      assignments: {},
      createdAt: new Date().toISOString(), // إضافة تاريخ الإنشاء
    })
    setShowSetupWizard(false)
  }

  // دالة حفظ الإعدادات
  const handleSaveSettings = () => {
    try {
      if (currentSchedule) {
        // تحديث الجدول الحالي
        const updatedSchedule = {
          ...currentSchedule,
          startDate: startDate.toISOString(),
          months: months,
          workDays: customWorkDays,
        }

        saveSchedule(updatedSchedule)

        // حفظ وضع العرض
        localStorage.setItem("schedule-view-mode", scheduleViewMode)

        // إغلاق لوحة الإعدادات
        setShowSettingsPanel(false)
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("حدث خطأ أثناء حفظ الإعدادات")
    }
  }

  // تعديل دالة handleAddEmployee لتستخدم التاريخ الحالي
  const handleAddEmployee = () => {
    if (employeeName.trim()) {
      const employeeId = uuidv4()

      // إضافة الموظف
      useEmployeeStore.getState().addEmployee({
        id: employeeId,
        name: employeeName,
        position: employeePosition || "موظف",
        maxShiftsPerWeek: 5, // قيمة افتراضية
        preferredShifts: [],
      })

      // إنشاء جدول للموظف
      createNewSchedule({
        name: `جدول ${employeeName}`,
        startDate: employeeStartDate.toISOString(),
        months: employeeMonths,
        workDays: [
          { type: "work", count: employeeWorkDays, color: employeeWorkColor },
          { type: "off", count: employeeOffDays, color: employeeOffColor },
        ],
        notes: {},
        pins: {},
        monthColors: {},
        backgroundColor: "#ffffff",
        employeeName: employeeName,
        comments: [],
        showComments: true,
        assignments: {},
        createdAt: new Date().toISOString(), // إضافة تاريخ الإنشاء
      })

      // إعادة تعيين القيم
      setEmployeeName("")
      setEmployeePosition("")
      setEmployeeWorkDays(1)
      setEmployeeOffDays(3)
      setEmployeeWorkColor("#4CAF50")
      setEmployeeOffColor("#FFFFFF")
      setEmployeeMonths(12)
      setEmployeeStartDate(new Date()) // إعادة تعيين التاريخ إلى اليوم الحالي
      setEmployeeSetupStep(1) // إعادة تعيين الخطوة إلى الخطوة الأولى
      setShowEmployeeForm(false)

      // إظهار رسالة نجاح
      alert(`تم إضافة الموظف ${employeeName} وإنشاء جدول له بنجاح`)
    }
  }

  // دالة إعادة تهيئة التطبيق
  const handleResetApplication = () => {
    if (window.confirm("هل أنت متأكد من إعادة تهيئة التطبيق؟ سيتم حذف جميع البيانات.")) {
      resetStore()
      localStorage.removeItem("schedule-visited")
      localStorage.removeItem("schedule-start-date")
      localStorage.removeItem("schedule-months")
      localStorage.removeItem("schedule-view-mode")
      window.location.reload()
    }
  }

  // دالة حذف جدول موظف وإعادة فتح نافذة إنشاء جدول جديد
  const handleDeleteScheduleAndCreateNew = (scheduleId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الجدول؟")) {
      deleteScheduleFromHistory(scheduleId)
      setSetupStep(1) // إعادة تعيين الخطوة إلى الخطوة الأولى
      setShowSetupWizard(true) // فتح نافذة إنشاء جدول جديد
    }
  }

  // دالة إضافة نوع يوم جديد (عمل أو إجازة)
  const handleAddWorkDay = (type: "work" | "off") => {
    const newColor = type === "work" ? "#4CAF50" : "#FFFFFF"
    setCustomWorkDays([...customWorkDays, { type, count: 1, color: newColor }])
  }

  // دالة تحديث نوع يوم موجود
  const handleUpdateWorkDay = (index: number, field: "count" | "color", value: any) => {
    const updatedWorkDays = [...customWorkDays]
    updatedWorkDays[index][field] = value
    setCustomWorkDays(updatedWorkDays)
  }

  // دالة حذف نوع يوم
  const handleRemoveWorkDay = (index: number) => {
    if (customWorkDays.length <= 2) {
      alert("يجب أن يكون هناك على الأقل نوعان من الأيام (عمل وإجازة)")
      return
    }
    const updatedWorkDays = customWorkDays.filter((_, i) => i !== index)
    setCustomWorkDays(updatedWorkDays)
  }

  // Actualizar valores de configuración cuando cambia el horario actual
  useEffect(() => {
    if (currentSchedule) {
      // Actualizar los valores de configuración basados en el horario actual
      try {
        const startDateObj = new Date(currentSchedule.startDate)
        if (!isNaN(startDateObj.getTime())) {
          setStartDate(startDateObj)
        }

        if (currentSchedule.months) {
          setMonths(currentSchedule.months)
        }

        if (currentSchedule.workDays && currentSchedule.workDays.length >= 2) {
          setCustomWorkDays(currentSchedule.workDays)

          const workDayConfig = currentSchedule.workDays.find((day) => day.type === "work")
          const offDayConfig = currentSchedule.workDays.find((day) => day.type === "off")

          if (workDayConfig) {
            setWorkDays(workDayConfig.count)
            setWorkColor(workDayConfig.color)
          }

          if (offDayConfig) {
            setOffDays(offDayConfig.count)
            setOffColor(offDayConfig.color)
          }
        }
      } catch (error) {
        console.error("Error updating settings from current schedule:", error)
      }
    }
  }, [currentSchedule])

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <main dir="rtl" className="min-h-screen bg-background p-4 md:p-8" id="schedule-container">
        {/* Setup Wizard */}
        {showSetupWizard && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative">
              <div className="absolute top-0 left-0 right-0 h-2 bg-primary rounded-t-xl"></div>

              {setupStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-center text-primary">مرحباً بك في تطبيق جدول العمل</h2>
                  <p className="text-gray-600 text-center">لنبدأ بإنشاء جدول العمل الخاص بك</p>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">ادخال اسم للجدول</label>
                    <Input
                      type="text"
                      value={scheduleName}
                      onChange={(e) => setScheduleName(e.target.value)}
                      placeholder="أدخل اسم للجدول"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => setSetupStep(2)} className="flex items-center gap-2">
                      التالي
                    </Button>
                  </div>
                </div>
              )}

              {setupStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-center text-primary">تحديد تاريخ البدء</h2>
                  <p className="text-gray-600 text-center">اختر أول يوم عمل في الجدول</p>

                  <div className="flex justify-center">
                    {/* استبدال حقل التاريخ بزر يفتح التقويم */}
                    <div className="relative w-full">
                      <Button
                        variant="outline"
                        className="w-full flex justify-between items-center"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                      >
                        <span>{format(startDate, "yyyy/MM/dd")}</span>
                        <Calendar className="h-4 w-4" />
                      </Button>

                      {showDatePicker && (
                        <div className="absolute z-20 mt-1 p-2 bg-white border rounded-md shadow-lg w-full">
                          <Input
                            type="date"
                            value={startDate.toISOString().split("T")[0]}
                            onChange={(e) => {
                              setStartDate(new Date(e.target.value))
                              setShowDatePicker(false)
                            }}
                            className="w-full mb-2"
                            autoFocus
                          />
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setStartDate(new Date())
                                setShowDatePicker(false)
                              }}
                            >
                              اليوم
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const tomorrow = new Date()
                                tomorrow.setDate(tomorrow.getDate() + 1)
                                setStartDate(tomorrow)
                                setShowDatePicker(false)
                              }}
                            >
                              غداً
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setSetupStep(1)}>
                      السابق
                    </Button>
                    <Button onClick={() => setSetupStep(3)} className="flex items-center gap-2">
                      التالي
                    </Button>
                  </div>
                </div>
              )}

              {setupStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-center text-primary">تحديد أيام العمل والإجازات</h2>
                  <p className="text-gray-600 text-center">حدد أنواع أيام العمل والإجازات</p>

                  <div className="space-y-4">
                    {customWorkDays.map((workDay, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${workDay.type === "work" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className={`font-medium ${workDay.type === "work" ? "text-green-700" : "text-red-700"}`}>
                            {workDay.type === "work" ? "أيام العمل" : "أيام الإجازات"} {index > 1 ? `(${index})` : ""}
                          </h4>
                          {customWorkDays.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500"
                              onClick={() => handleRemoveWorkDay(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateWorkDay(index, "count", Math.max(1, workDay.count - 1))}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <div className="flex-1 bg-white rounded-md p-2 text-center font-medium">{workDay.count}</div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateWorkDay(index, "count", workDay.count + 1)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${workDay.type === "work" ? "text-green-700" : "text-red-700"}`}>
                            اللون:
                          </span>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={workDay.color}
                              onChange={(e) => handleUpdateWorkDay(index, "color", e.target.value)}
                              className="w-12 h-10 p-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2 justify-center mt-4">
                      <Button
                        variant="outline"
                        onClick={() => handleAddWorkDay("work")}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        إضافة أيام عمل
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleAddWorkDay("off")}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        إضافة أيام إجازة
                      </Button>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">عدد الأشهر المعروضة</label>
                      <select
                        value={months}
                        onChange={(e) => setMonths(Number(e.target.value))}
                        className="w-full rounded-lg border p-2"
                      >
                        {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num} شهر
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setSetupStep(2)}>
                      السابق
                    </Button>
                    <Button onClick={handleCreateFromWizard} className="bg-primary">
                      إنشاء الجدول
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t flex justify-center">
                <div className="flex gap-2">
                  <span className={`w-3 h-3 rounded-full ${setupStep === 1 ? "bg-primary" : "bg-gray-300"}`}></span>
                  <span className={`w-3 h-3 rounded-full ${setupStep === 2 ? "bg-primary" : "bg-gray-300"}`}></span>
                  <span className={`w-3 h-3 rounded-full ${setupStep === 3 ? "bg-primary" : "bg-gray-300"}`}></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettingsPanel && (
          <SettingsPanel
            onClose={() => setShowSettingsPanel(false)}
            startDate={startDate}
            setStartDate={setStartDate}
            months={months}
            setMonths={setMonths}
            workDays={workDays}
            setWorkDays={setWorkDays}
            workColor={workColor}
            setWorkColor={setWorkColor}
            offDays={offDays}
            setOffDays={setOffDays}
            offColor={offColor}
            setOffColor={setOffColor}
          />
        )}

        {/* Employee Form */}
        {showEmployeeForm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative">
              <div className="absolute top-0 left-0 right-0 h-2 bg-purple-600 rounded-t-xl"></div>
              <button
                onClick={() => setShowEmployeeForm(false)}
                className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>

              {employeeSetupStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-center text-purple-600">إضافة موظف جديد</h2>
                  <p className="text-gray-600 text-center">أدخل اسم الموظف</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">اسم الموظف</label>
                      <Input
                        type="text"
                        value={employeeName}
                        onChange={(e) => setEmployeeName(e.target.value)}
                        placeholder="أدخل اسم الموظف"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => setEmployeeSetupStep(2)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      التالي
                      <ChevronRight className="h-4 w-4 mr-2" />
                    </Button>
                  </div>
                </div>
              )}

              {employeeSetupStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-center text-purple-600">تحديد تاريخ البدء</h2>
                  <p className="text-gray-600 text-center">اختر أول يوم عمل للموظف</p>

                  <div className="flex justify-center">
                    {/* استبدال حقل التاريخ بزر يفتح التقويم */}
                    <div className="relative w-full">
                      <Button
                        variant="outline"
                        className="w-full flex justify-between items-center"
                        onClick={() => setShowEmployeeDatePicker(!showEmployeeDatePicker)}
                      >
                        <span>{format(employeeStartDate, "yyyy/MM/dd")}</span>
                        <Calendar className="h-4 w-4" />
                      </Button>

                      {showEmployeeDatePicker && (
                        <div className="absolute z-20 mt-1 p-2 bg-white border rounded-md shadow-lg w-full">
                          <Input
                            type="date"
                            value={employeeStartDate.toISOString().split("T")[0]}
                            onChange={(e) => {
                              setEmployeeStartDate(new Date(e.target.value))
                              setShowEmployeeDatePicker(false)
                            }}
                            className="w-full mb-2"
                            autoFocus
                          />
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEmployeeStartDate(new Date())
                                setShowEmployeeDatePicker(false)
                              }}
                            >
                              اليوم
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const tomorrow = new Date()
                                tomorrow.setDate(tomorrow.getDate() + 1)
                                setEmployeeStartDate(tomorrow)
                                setShowEmployeeDatePicker(false)
                              }}
                            >
                              غداً
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setEmployeeSetupStep(1)}>
                      السابق
                    </Button>
                    <Button
                      onClick={() => setEmployeeSetupStep(3)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      التالي
                      <ChevronRight className="h-4 w-4 mr-2" />
                    </Button>
                  </div>
                </div>
              )}

              {employeeSetupStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-center text-purple-600">تحديد أيام العمل والإجازات</h2>
                  <p className="text-gray-600 text-center">حدد عدد أيام العمل والإجازات للموظف</p>

                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">أيام العمل</label>
                      <div className="flex gap-4">
                        <Input
                          type="number"
                          value={employeeWorkDays}
                          onChange={(e) => setEmployeeWorkDays(Number(e.target.value))}
                          min="1"
                          max="30"
                          className="w-20 p-2 border rounded-md"
                        />
                        <div className="relative flex-1">
                          <Input
                            type="color"
                            value={employeeWorkColor}
                            onChange={(e) => setEmployeeWorkColor(e.target.value)}
                            className="w-full h-10 p-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">أيام الإجازات</label>
                      <div className="flex gap-4">
                        <Input
                          type="number"
                          value={employeeOffDays}
                          onChange={(e) => setEmployeeOffDays(Number(e.target.value))}
                          min="1"
                          max="30"
                          className="w-20 p-2 border rounded-md"
                        />
                        <div className="relative flex-1">
                          <Input
                            type="color"
                            value={employeeOffColor}
                            onChange={(e) => setEmployeeOffColor(e.target.value)}
                            className="w-full h-10 p-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">عدد الأشهر المعروضة</label>
                      <select
                        value={employeeMonths}
                        onChange={(e) => setEmployeeMonths(Number(e.target.value))}
                        className="w-full rounded-lg border p-2"
                      >
                        {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num} شهر
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setEmployeeSetupStep(2)}>
                      السابق
                    </Button>
                    <Button onClick={handleAddEmployee} className="bg-purple-600 hover:bg-purple-700 text-white">
                      حفظ وإنشاء الجدول
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t flex justify-center">
                <div className="flex gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${employeeSetupStep === 1 ? "bg-purple-600" : "bg-gray-300"}`}
                  ></span>
                  <span
                    className={`w-3 h-3 rounded-full ${employeeSetupStep === 2 ? "bg-purple-600" : "bg-gray-300"}`}
                  ></span>
                  <span
                    className={`w-3 h-3 rounded-full ${employeeSetupStep === 3 ? "bg-purple-600" : "bg-gray-300"}`}
                  ></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto">
          <header className="bg-white border-b sticky top-0 z-10 shadow-sm mb-6 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">جدول العمل</h1>
              </div>
              <div className="flex-1 flex items-center justify-center mx-8">
                {currentSchedule && <h2 className="text-xl font-semibold text-primary">{currentSchedule.name}</h2>}
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettingsPanel(true)}
                  className="bg-white hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4 ml-2" />
                  <span className="hidden sm:inline">الإعدادات</span>
                  <span className="sm:hidden">إعدادات</span>
                </Button>
                <div className="hidden md:flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-semibold">{formatDate(new Date())}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {!showSetupWizard && (
            <div className="container mx-auto">
              {savedSchedules.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <h3 className="text-xl font-medium text-gray-600 mb-4">لا توجد جداول محفوظة</h3>
                  <p className="text-gray-500 mb-6">قم بإنشاء جدول جديد للبدء</p>
                  <Button
                    onClick={() => {
                      setSetupStep(1)
                      setShowSetupWizard(true)
                    }}
                    className="bg-primary"
                  >
                    <Calendar className="h-4 w-4 ml-2" />
                    إنشاء جدول جديد
                  </Button>
                </div>
              ) : (
                <>
                  <ScheduleViewSelector onViewChange={handleViewModeChange} currentView={scheduleViewMode} />
                  <ScheduleGrid
                    startDate={startDate}
                    months={months}
                    workDays={workDays}
                    offDays={offDays}
                    workColor={workColor}
                    offColor={offColor}
                    viewMode={scheduleViewMode}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </ThemeProvider>
  )
}

