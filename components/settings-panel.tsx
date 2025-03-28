"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useScheduleStore } from "@/lib/store/schedule-store"
import { useEmployeeStore } from "@/lib/store/employee-store"
import {
  X,
  Save,
  Calendar,
  Users,
  Settings,
  MessageSquare,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Info,
  Trash,
  CheckCircle,
  Bell,
  Plus,
  Palette,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { format, addDays } from "date-fns"
import { ar } from "date-fns/locale"

interface SettingsPanelProps {
  onClose: () => void
  startDate: Date
  setStartDate: (date: Date) => void
  months: number
  setMonths: (months: number) => void
  workDays: number
  setWorkDays: (days: number) => void
  workColor: string
  setWorkColor: (color: string) => void
  offDays: number
  setOffDays: (days: number) => void
  offColor: string
  setOffColor: (color: string) => void
}

export default function SettingsPanel({
  onClose,
  startDate,
  setStartDate,
  months,
  setMonths,
  workDays,
  setWorkDays,
  workColor,
  setWorkColor,
  offDays,
  setOffDays,
  offColor,
  setOffColor,
}: SettingsPanelProps) {
  const {
    currentSchedule,
    updateSchedule,
    savedSchedules,
    loadScheduleFromHistory,
    deleteScheduleFromHistory,
    resetStore,
  } = useScheduleStore()

  const { employees } = useEmployeeStore()

  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null)
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>("general")
  const [showDatePicker, setShowDatePicker] = useState(false)

  // إضافة متغيرات لدعم أيام العمل المتعددة
  const [customWorkDays, setCustomWorkDays] = useState([
    { type: "work", count: workDays, color: workColor },
    { type: "off", count: offDays, color: offColor },
  ])

  // إضافة متغير حالة جديد لخلفية جداول الأشهر بعد متغيرات الألوان الأخرى
  const [mainBgColor, setMainBgColor] = useState("#ffffff")
  const [scheduleBgColor, setScheduleBgColor] = useState("#ffffff")
  const [settingsBgColor, setSettingsBgColor] = useState("#ffffff")
  const [notesBgColor, setNotesBgColor] = useState("#ffffff")
  const [monthCardsBgColor, setMonthCardsBgColor] = useState("#ffffff")

  // مجموعة من الألوان المقترحة
  const suggestedColors = [
    "#FFFFFF", // أبيض
    "#121212", // داكن
    "#4CAF50", // أخضر
    "#2196F3", // أزرق
    "#F44336", // أحمر
    "#FFC107", // أصفر
    "#9C27B0", // بنفسجي
    "#FF9800", // برتقالي
    "#795548", // بني
    "#607D8B", // رمادي أزرق
  ]

  // تحميل ألوان الخلفية من localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMainBgColor = localStorage.getItem("main-bg-color")
      const savedScheduleBgColor = localStorage.getItem("schedule-bg-color")
      const savedSettingsBgColor = localStorage.getItem("settings-bg-color")
      const savedNotesBgColor = localStorage.getItem("notes-bg-color")
      const savedMonthCardsBgColor = localStorage.getItem("month-cards-bg-color")

      if (savedMainBgColor) setMainBgColor(savedMainBgColor)
      if (savedScheduleBgColor) setScheduleBgColor(savedScheduleBgColor)
      if (savedSettingsBgColor) setSettingsBgColor(savedSettingsBgColor)
      if (savedNotesBgColor) setNotesBgColor(savedNotesBgColor)
      if (savedMonthCardsBgColor) setMonthCardsBgColor(savedMonthCardsBgColor)

      // تطبيق ألوان الخلفية
      document.documentElement.style.setProperty("--main-bg-color", savedMainBgColor || "#ffffff")
      document.documentElement.style.setProperty("--schedule-bg-color", savedScheduleBgColor || "#ffffff")
      document.documentElement.style.setProperty("--settings-bg-color", savedSettingsBgColor || "#ffffff")
      document.documentElement.style.setProperty("--notes-bg-color", savedNotesBgColor || "#ffffff")
      document.documentElement.style.setProperty("--month-cards-bg-color", savedMonthCardsBgColor || "#ffffff")

      // تطبيق ألوان الخلفية على العناصر مباشرة
      setTimeout(() => {
        document
          .getElementById("schedule-container")
          ?.style.setProperty("background-color", savedMainBgColor || "#ffffff")
        document.querySelectorAll(".schedule-grid-container, .schedule-cards").forEach((el) => {
          ;(el as HTMLElement).style.setProperty("background-color", savedScheduleBgColor || "#ffffff")
        })
        document.querySelectorAll(".settings-panel").forEach((el) => {
          ;(el as HTMLElement).style.setProperty("background-color", savedSettingsBgColor || "#ffffff")
        })
        document.querySelectorAll(".notes-popup, .comment-modal").forEach((el) => {
          ;(el as HTMLElement).style.setProperty("background-color", savedNotesBgColor || "#ffffff")
        })
        document.querySelectorAll(".month-card").forEach((el) => {
          ;(el as HTMLElement).style.setProperty("background-color", savedMonthCardsBgColor || "#ffffff")
        })
      }, 100)
    }
  }, [])

  // تطبيق ألوان الخلفية بشكل مباشر
  useEffect(() => {
    if (typeof window !== "undefined") {
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
    }
  }, [mainBgColor, scheduleBgColor, settingsBgColor, notesBgColor, monthCardsBgColor])

  const handleColorChange = (colorType: string, color: string) => {
    if (colorType === "work") {
      setWorkColor(color)
    } else if (colorType === "off") {
      setOffColor(color)
    }
    setColorPickerOpen(null)
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

  // تحديث دالة resetApplication لتشمل حذف إعداد لون خلفية جداول الأشهر
  const resetApplication = () => {
    if (window.confirm("هل أنت متأكد من إعادة تهيئة التطبيق؟ سيتم حذف جميع البيانات.")) {
      resetStore()
      localStorage.removeItem("schedule-visited")
      localStorage.removeItem("schedule-start-date")
      localStorage.removeItem("schedule-months")
      localStorage.removeItem("main-bg-color")
      localStorage.removeItem("schedule-bg-color")
      localStorage.removeItem("settings-bg-color")
      localStorage.removeItem("notes-bg-color")
      localStorage.removeItem("month-cards-bg-color")
      window.location.reload()
    }
  }

  // تحديث دالة applySettings لتشمل حفظ لون خلفية جداول الأشهر
  const applySettings = () => {
    if (currentSchedule) {
      updateSchedule(currentSchedule.id, {
        ...currentSchedule,
        startDate: startDate.toISOString(),
        months,
        workDays: customWorkDays,
        backgroundColor: mainBgColor,
      })
    }

    // Save settings to localStorage with current date if invalid
    try {
      localStorage.setItem("schedule-start-date", startDate.toISOString())
    } catch (e) {
      localStorage.setItem("schedule-start-date", new Date().toISOString())
    }
    localStorage.setItem("schedule-months", months.toString())
    localStorage.setItem("main-bg-color", mainBgColor)
    localStorage.setItem("schedule-bg-color", scheduleBgColor)
    localStorage.setItem("settings-bg-color", settingsBgColor)
    localStorage.setItem("notes-bg-color", notesBgColor)
    localStorage.setItem("month-cards-bg-color", monthCardsBgColor)

    // تطبيق ألوان الخلفية على المتغيرات CSS
    document.documentElement.style.setProperty("--main-bg-color", mainBgColor)
    document.documentElement.style.setProperty("--schedule-bg-color", scheduleBgColor)
    document.documentElement.style.setProperty("--settings-bg-color", settingsBgColor)
    document.documentElement.style.setProperty("--notes-bg-color", notesBgColor)
    document.documentElement.style.setProperty("--month-cards-bg-color", monthCardsBgColor)

    // تطبيق ألوان الخلفية على العناصر مباشرة بتأخير صغير
    setTimeout(() => {
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
    }, 100)

    onClose()
  }

  const menuItems = [
    { id: "general", label: "الإعدادات العامة", icon: <Settings className="h-5 w-5" /> },
    { id: "display", label: "قائمة العرض", icon: <Palette className="h-5 w-5" /> },
    { id: "schedules", label: "الجداول المحفوظة", icon: <Calendar className="h-5 w-5" /> },
    { id: "employees", label: "الموظفين", icon: <Users className="h-5 w-5" /> },
    { id: "comments", label: "التعليقات", icon: <MessageSquare className="h-5 w-5" /> },
    { id: "system", label: "النظام", icon: <RefreshCw className="h-5 w-5" /> },
    { id: "about", label: "عن الموقع", icon: <Info className="h-5 w-5" /> },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 md:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl overflow-hidden flex flex-col settings-panel">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">إعدادات الجدول</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Dropdown Selector - Only visible on small screens */}
        <div className="md:hidden p-3 border-b">
          <select
            value={activeSettingsTab}
            onChange={(e) => setActiveSettingsTab(e.target.value)}
            className="w-full p-2 rounded-md border border-gray-300 bg-white"
          >
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Sidebar - Only visible on medium screens and up */}
          <div className="hidden md:block w-64 bg-gray-50 border-l overflow-y-auto">
            <ul className="py-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSettingsTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-right transition-colors ${
                      activeSettingsTab === item.id
                        ? "bg-primary/10 text-primary border-r-4 border-primary"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span className={activeSettingsTab === item.id ? "text-primary" : "text-gray-500"}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {activeSettingsTab === "general" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b pb-2 md:hidden">الإعدادات العامة</h3>

                {/* تاريخ البدء */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">تاريخ البدء</h4>
                    <div className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                      {format(startDate, "yyyy/MM/dd")}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    {/* زر لإظهار التقويم بدلاً من حقل التاريخ المباشر */}
                    <div className="relative">
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
                            value={format(startDate, "yyyy-MM-dd")}
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
                                setStartDate(addDays(new Date(), 1))
                                setShowDatePicker(false)
                              }}
                            >
                              غداً
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setStartDate(addDays(new Date(), 7))
                                setShowDatePicker(false)
                              }}
                            >
                              بعد أسبوع
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* عدد الأشهر */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">عدد الأشهر</h4>
                    <div className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">{months} شهر</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" onClick={() => setMonths(Math.max(1, months - 1))}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 bg-gray-100 rounded-md p-2 text-center font-medium">{months}</div>
                      <Button variant="outline" size="icon" onClick={() => setMonths(Math.min(36, months + 1))}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[3, 6, 12, 24].map((value) => (
                        <Button
                          key={value}
                          variant={months === value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMonths(value)}
                        >
                          {value} شهر
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* أيام العمل والإجازات */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">أنواع أيام العمل والإجازات</h4>

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
                </div>
              </div>
            )}

            {activeSettingsTab === "display" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b pb-2 md:hidden">قائمة العرض</h3>

                <div className="space-y-4">
                  {/* خلفية الصفحة الرئيسية */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-700">خلفية الصفحة الرئيسية</h4>
                      <div className="flex gap-2">
                        {suggestedColors.slice(0, 6).map((color) => (
                          <button
                            key={color}
                            className={`w-6 h-6 rounded-full border hover:scale-110 transition-transform ${
                              mainBgColor === color ? "ring-2 ring-offset-1 ring-primary" : ""
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setMainBgColor(color)}
                          />
                        ))}
                        <button
                          className={`w-6 h-6 rounded-full border hover:scale-110 transition-transform ${
                            mainBgColor !== "#ffffff" && !suggestedColors.slice(0, 6).includes(mainBgColor)
                              ? "ring-2 ring-offset-1 ring-primary"
                              : ""
                          }`}
                          style={{ backgroundColor: mainBgColor }}
                          onClick={() => {
                            const input = document.createElement("input")
                            input.type = "color"
                            input.value = mainBgColor
                            input.addEventListener("change", (e) => setMainBgColor(e.target.value))
                            input.click()
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* خلفية الجداول */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-700">خلفية الجداول</h4>
                      <div className="flex gap-2">
                        {suggestedColors.slice(0, 6).map((color) => (
                          <button
                            key={color}
                            className={`w-6 h-6 rounded-full border hover:scale-110 transition-transform ${
                              scheduleBgColor === color ? "ring-2 ring-offset-1 ring-primary" : ""
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setScheduleBgColor(color)}
                          />
                        ))}
                        <button
                          className={`w-6 h-6 rounded-full border hover:scale-110 transition-transform ${
                            scheduleBgColor !== "#ffffff" && !suggestedColors.slice(0, 6).includes(scheduleBgColor)
                              ? "ring-2 ring-offset-1 ring-primary"
                              : ""
                          }`}
                          style={{ backgroundColor: scheduleBgColor }}
                          onClick={() => {
                            const input = document.createElement("input")
                            input.type = "color"
                            input.value = scheduleBgColor
                            input.addEventListener("change", (e) => setScheduleBgColor(e.target.value))
                            input.click()
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* خلفية قائمة الإعدادات */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-700">خلفية قائمة الإعدادات</h4>
                      <div className="flex gap-2">
                        {suggestedColors.slice(0, 6).map((color) => (
                          <button
                            key={color}
                            className={`w-6 h-6 rounded-full border hover:scale-110 transition-transform ${
                              settingsBgColor === color ? "ring-2 ring-offset-1 ring-primary" : ""
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setSettingsBgColor(color)}
                          />
                        ))}
                        <button
                          className={`w-6 h-6 rounded-full border hover:scale-110 transition-transform ${
                            settingsBgColor !== "#ffffff" && !suggestedColors.slice(0, 6).includes(settingsBgColor)
                              ? "ring-2 ring-offset-1 ring-primary"
                              : ""
                          }`}
                          style={{ backgroundColor: settingsBgColor }}
                          onClick={() => {
                            const input = document.createElement("input")
                            input.type = "color"
                            input.value = settingsBgColor
                            input.addEventListener("change", (e) => setSettingsBgColor(e.target.value))
                            input.click()
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* خلفية الملاحظات */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-700">خلفية الملاحظات</h4>
                      <div className="flex gap-2">
                        {suggestedColors.slice(0, 6).map((color) => (
                          <button
                            key={color}
                            className={`w-6 h-6 rounded-full border hover:scale-110 transition-transform ${
                              notesBgColor === color ? "ring-2 ring-offset-1 ring-primary" : ""
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setNotesBgColor(color)}
                          />
                        ))}
                        <button
                          className={`w-6 h-6 rounded-full border hover:scale-110 transition-transform ${
                            notesBgColor !== "#ffffff" && !suggestedColors.slice(0, 6).includes(notesBgColor)
                              ? "ring-2 ring-offset-1 ring-primary"
                              : ""
                          }`}
                          style={{ backgroundColor: notesBgColor }}
                          onClick={() => {
                            const input = document.createElement("input")
                            input.type = "color"
                            input.value = notesBgColor
                            input.addEventListener("change", (e) => setNotesBgColor(e.target.value))
                            input.click()
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* خلفية جداول الأشهر */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-700">خلفية جداول الأشهر</h4>
                      <div className="flex gap-2">
                        {suggestedColors.slice(0, 6).map((color) => (
                          <button
                            key={color}
                            className={`w-6 h-6 rounded-full border hover:scale-110 transition-transform ${
                              monthCardsBgColor === color ? "ring-2 ring-offset-1 ring-primary" : ""
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setMonthCardsBgColor(color)}
                          />
                        ))}
                        <button
                          className={`w-6 h-6 rounded-full border hover:scale-110 transition-transform ${
                            monthCardsBgColor !== "#ffffff" && !suggestedColors.slice(0, 6).includes(monthCardsBgColor)
                              ? "ring-2 ring-offset-1 ring-primary"
                              : ""
                          }`}
                          style={{ backgroundColor: monthCardsBgColor }}
                          onClick={() => {
                            const input = document.createElement("input")
                            input.type = "color"
                            input.value = monthCardsBgColor
                            input.addEventListener("change", (e) => setMonthCardsBgColor(e.target.value))
                            input.click()
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSettingsTab === "schedules" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b pb-2 md:hidden">الجداول المحفوظة</h3>

                {savedSchedules.length > 0 ? (
                  <div className="space-y-3">
                    {savedSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-primary transition-colors"
                      >
                        <div>
                          <h3 className="font-medium">{schedule.name}</h3>
                          <p className="text-sm text-gray-500">{formatDate(new Date(schedule.createdAt || ""))}</p>
                          {schedule.employeeName && (
                            <p className="text-xs text-primary mt-1">الموظف: {schedule.employeeName}</p>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3 sm:mt-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              loadScheduleFromHistory(schedule.id)
                              onClose()
                              alert(`تم تحميل جدول ${schedule.name}`)
                            }}
                          >
                            تحميل
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف جدول ${schedule.name}؟`)) {
                                deleteScheduleFromHistory(schedule.id)
                                alert(`تم حذف جدول ${schedule.name}`)
                              }
                            }}
                          >
                            حذف
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">لا توجد جداول محفوظة</div>
                )}
              </div>
            )}

            {activeSettingsTab === "employees" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold border-b pb-2 md:hidden">إدارة الموظفين</h3>
                  <Button
                    onClick={() => {
                      onClose()
                      // استدعاء دالة فتح نموذج إضافة موظف
                      window.dispatchEvent(new CustomEvent("openEmployeeForm"))
                    }}
                    className="bg-primary"
                  >
                    <Users className="h-4 w-4 ml-2" />
                    إضافة موظف جديد
                  </Button>
                </div>

                {employees.length > 0 ? (
                  <div className="space-y-3">
                    {employees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border border-gray-200 hover:border-primary transition-colors"
                      >
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          {employee.position && <div className="text-sm text-gray-500">{employee.position}</div>}
                        </div>
                        <div className="flex gap-2 mt-3 sm:mt-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const employeeSchedule = savedSchedules.find((s) => s.employeeName === employee.name)
                              if (employeeSchedule) {
                                loadScheduleFromHistory(employeeSchedule.id)
                                onClose()
                                alert(`تم تحميل جدول الموظف ${employee.name}`)
                              } else {
                                alert(`لا يوجد جدول للموظف ${employee.name}`)
                              }
                            }}
                          >
                            <Calendar className="h-4 w-4 ml-1" />
                            تحميل الجدول
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    لا يوجد موظفين. أضف موظف جديد.
                  </div>
                )}
              </div>
            )}

            {activeSettingsTab === "comments" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b pb-2 md:hidden">التعليقات والملاحظات</h3>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 md:p-6 shadow-sm border border-purple-100">
                  <p className="text-gray-600 mb-4">
                    يمكنك إضافة تعليقات وملاحظات على أيام محددة في الجدول. انقر بزر الماوس الأيمن أو اضغط مطولاً على
                    اليوم لإضافة تعليق.
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <h4 className="font-medium mb-2">أهمية التعليقات</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span>منخفضة - للملاحظات العادية</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span>متوسطة - للتذكيرات المهمة</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span>عالية - للأمور العاجلة والضرورية</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* عرض التعليقات الحالية */}
                {currentSchedule && currentSchedule.comments && currentSchedule.comments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-lg mb-3">التعليقات الحالية</h4>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {currentSchedule.comments.map((comment) => {
                        // تحويل التاريخ إلى كائن Date
                        const commentDate = new Date(comment.date)

                        return (
                          <div
                            key={comment.id}
                            className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                            style={{ borderRightWidth: "4px", borderRightColor: comment.color }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium">{format(commentDate, "d MMMM yyyy", { locale: ar })}</div>
                              <div>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full border ${
                                    comment.importance === "high"
                                      ? "bg-red-100 text-red-800 border-red-300"
                                      : comment.importance === "medium"
                                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                        : "bg-blue-100 text-blue-800 border-blue-300"
                                  }`}
                                >
                                  {comment.importance === "high"
                                    ? "عالية"
                                    : comment.importance === "medium"
                                      ? "متوسطة"
                                      : "منخفضة"}
                                </span>
                              </div>
                            </div>

                            <div className="text-right mb-3">
                              <p className="text-gray-800 whitespace-pre-line">{comment.text}</p>
                            </div>

                            {comment.isCompleted && (
                              <div className="flex items-center text-green-600 text-sm mb-2">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span>تم الإكمال</span>
                              </div>
                            )}

                            {comment.reminder && (
                              <div className="flex items-center text-gray-500 text-sm">
                                <Bell className="h-4 w-4 mr-1" />
                                <span>
                                  تذكير: {format(new Date(comment.reminder), "yyyy/MM/dd HH:mm", { locale: ar })}
                                </span>
                              </div>
                            )}

                            {/* أزرار التحكم */}
                            <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // تبديل حالة الإكمال
                                  updateSchedule(currentSchedule.id, {
                                    ...currentSchedule,
                                    comments: currentSchedule.comments.map((c) =>
                                      c.id === comment.id ? { ...c, isCompleted: !c.isCompleted } : c,
                                    ),
                                  })
                                }}
                              >
                                <CheckCircle
                                  className={`h-4 w-4 ml-1 ${comment.isCompleted ? "text-green-500" : ""}`}
                                />
                                {comment.isCompleted ? "إلغاء الإكمال" : "تم"}
                              </Button>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (window.confirm("هل أنت متأكد من حذف هذا التعليق؟")) {
                                    // حذف التعليق
                                    updateSchedule(currentSchedule.id, {
                                      ...currentSchedule,
                                      comments: currentSchedule.comments.filter((c) => c.id !== comment.id),
                                    })
                                  }
                                }}
                              >
                                <Trash className="h-4 w-4 ml-1" />
                                حذف
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSettingsTab === "system" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b pb-2 md:hidden">إعدادات النظام</h3>

                <div className="bg-red-50 rounded-lg p-4 md:p-6 shadow-sm border border-red-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-100 p-2 rounded-full">
                      <RefreshCw className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-red-700">إعادة تهيئة التطبيق</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    سيؤدي هذا الإجراء إلى حذف جميع البيانات وإعادة تشغيل التطبيق كما لو كنت تستخدمه لأول مرة.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={resetApplication}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    إعادة تهيئة التطبيق
                  </Button>
                </div>
              </div>
            )}

            {activeSettingsTab === "about" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b pb-2 md:hidden">عن الموقع</h3>

                <div className="bg-blue-50 rounded-lg p-4 md:p-6 shadow-sm border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-blue-700">عن الموقع</h3>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <p className="leading-relaxed">
                      السلام عليكم ورحمه الله وبركاته. هذا الموقع تجريبي وقد تواجه بعض الاخطاء وتم تصميمه عبر الذكاء
                      الاصطناعي.
                    </p>
                    <p>شكرا لاستخدامك الموقع.</p>
                    <div className="pt-4 border-t border-blue-200">
                      <p className="font-medium">,,,</p>
                      <p>عمر الوهيبي</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium">واتساب:</span>
                        <a
                          href="https://wa.me/96892670679"
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          +96892670679
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t flex justify-end">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button onClick={applySettings} className="bg-primary">
              <Save className="h-4 w-4 ml-2" />
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

