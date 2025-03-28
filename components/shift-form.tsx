"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useShiftStore } from "@/lib/store/shift-store"
import type { Shift } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

export function ShiftForm() {
  const [name, setName] = useState("")
  const [color, setColor] = useState("#3b82f6")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [isNightShift, setIsNightShift] = useState(false)
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null)

  const { shifts, addShift, updateShift, deleteShift } = useShiftStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const shiftData: Shift = {
      id: editingShiftId || uuidv4(),
      name,
      color,
      startTime,
      endTime,
      isNightShift,
    }

    if (editingShiftId) {
      updateShift(editingShiftId, shiftData)
    } else {
      addShift(shiftData)
    }

    resetForm()
  }

  const handleEdit = (shift: Shift) => {
    setName(shift.name)
    setColor(shift.color)
    setStartTime(shift.startTime)
    setEndTime(shift.endTime)
    setIsNightShift(shift.isNightShift)
    setEditingShiftId(shift.id)
  }

  const handleDelete = (id: string) => {
    deleteShift(id)
    if (editingShiftId === id) {
      resetForm()
    }
  }

  const resetForm = () => {
    setName("")
    setColor("#3b82f6")
    setStartTime("09:00")
    setEndTime("17:00")
    setIsNightShift(false)
    setEditingShiftId(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{editingShiftId ? "تعديل الوردية" : "إضافة وردية جديدة"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="shift-name">اسم الوردية</Label>
            <Input
              id="shift-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="صباحية، مسائية، الخ"
              required
            />
          </div>

          <div>
            <Label htmlFor="shift-color">لون الوردية</Label>
            <div className="flex items-center gap-2">
              <Input
                id="shift-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#HEX" className="flex-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">وقت البدء</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="end-time">وقت الانتهاء</Label>
              <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="night-shift" checked={isNightShift} onCheckedChange={setIsNightShift} />
            <Label htmlFor="night-shift" className="mr-2">
              وردية ليلية
            </Label>
          </div>

          <div className="flex justify-between">
            <Button type="submit">{editingShiftId ? "تحديث" : "إضافة"}</Button>
            {editingShiftId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                إلغاء
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

