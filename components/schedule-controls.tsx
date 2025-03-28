"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useScheduleStore } from "@/lib/store/schedule-store"
import { Save, Calendar, Image } from "lucide-react"
import html2canvas from "html2canvas"

export function ScheduleControls() {
  const [scheduleName, setScheduleName] = useState("")
  const { currentSchedule, saveSchedule, createNewSchedule } = useScheduleStore()

  const handleSaveSchedule = () => {
    if (currentSchedule) {
      saveSchedule({
        ...currentSchedule,
        name: scheduleName || currentSchedule.name,
      })
    }
  }

  const handleExportAsImage = async () => {
    const scheduleElement = document.querySelector(".schedule-grid-container")
    if (scheduleElement) {
      try {
        const canvas = await html2canvas(scheduleElement as HTMLElement)
        const image = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = image
        link.download = `${currentSchedule?.name || "schedule"}.png`
        link.click()
      } catch (error) {
        console.error("Error exporting schedule as image:", error)
      }
    }
  }

  const handleCreateNew = () => {
    createNewSchedule({
      name: scheduleName || "جدول جديد",
      startDate: new Date().toISOString(),
      months: 1,
      workDays: [],
      notes: {},
      pins: {},
      monthColors: {},
      comments: [],
      showComments: true,
      assignments: {},
    })
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="schedule-name">اسم الجدول</Label>
            <Input
              id="schedule-name"
              placeholder="أدخل اسم الجدول"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-end">
            <Button onClick={handleSaveSchedule}>
              <Save className="h-4 w-4 ml-2" />
              حفظ
            </Button>
            <Button variant="outline" onClick={handleExportAsImage}>
              <Image className="h-4 w-4 ml-2" />
              تصدير كصورة
            </Button>
            <Button variant="outline" onClick={handleCreateNew}>
              <Calendar className="h-4 w-4 ml-2" />
              جدول جديد
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

