"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEmployeeStore } from "@/lib/store/employee-store"
import { useShiftStore } from "@/lib/store/shift-store"
import type { Employee } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

export function EmployeeForm() {
  const [name, setName] = useState("")
  const [position, setPosition] = useState("")
  const [maxShiftsPerWeek, setMaxShiftsPerWeek] = useState(5)
  const [preferredShifts, setPreferredShifts] = useState<string[]>([])
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)

  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployeeStore()
  const { shifts } = useShiftStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const employeeData: Employee = {
      id: editingEmployeeId || uuidv4(),
      name,
      position,
      maxShiftsPerWeek,
      preferredShifts,
    }

    if (editingEmployeeId) {
      updateEmployee(editingEmployeeId, employeeData)
    } else {
      addEmployee(employeeData)
    }

    resetForm()
  }

  const handleEdit = (employee: Employee) => {
    setName(employee.name)
    setPosition(employee.position)
    setMaxShiftsPerWeek(employee.maxShiftsPerWeek)
    setPreferredShifts(employee.preferredShifts)
    setEditingEmployeeId(employee.id)
  }

  const handleDelete = (id: string) => {
    deleteEmployee(id)
    if (editingEmployeeId === id) {
      resetForm()
    }
  }

  const resetForm = () => {
    setName("")
    setPosition("")
    setMaxShiftsPerWeek(5)
    setPreferredShifts([])
    setEditingEmployeeId(null)
  }

  const handlePreferredShiftChange = (shiftId: string) => {
    setPreferredShifts((prev) => {
      if (prev.includes(shiftId)) {
        return prev.filter((id) => id !== shiftId)
      } else {
        return [...prev, shiftId]
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{editingEmployeeId ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="employee-name">اسم الموظف</Label>
            <Input
              id="employee-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسم الموظف"
              required
            />
          </div>

          <div>
            <Label htmlFor="employee-position">المسمى الوظيفي</Label>
            <Input
              id="employee-position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="أدخل المسمى الوظيفي"
            />
          </div>

          <div>
            <Label htmlFor="max-shifts">الحد الأقصى للورديات في الأسبوع</Label>
            <Input
              id="max-shifts"
              type="number"
              min={1}
              max={7}
              value={maxShiftsPerWeek}
              onChange={(e) => setMaxShiftsPerWeek(Number.parseInt(e.target.value))}
              required
            />
          </div>

          <div>
            <Label>الورديات المفضلة</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {shifts.map((shift) => (
                <div key={shift.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`shift-${shift.id}`}
                    checked={preferredShifts.includes(shift.id)}
                    onChange={() => handlePreferredShiftChange(shift.id)}
                    className="ml-2"
                  />
                  <Label htmlFor={`shift-${shift.id}`} className="flex items-center">
                    <div className="w-3 h-3 rounded-full ml-2" style={{ backgroundColor: shift.color }}></div>
                    {shift.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="submit">{editingEmployeeId ? "تحديث" : "إضافة"}</Button>
            {editingEmployeeId && (
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

