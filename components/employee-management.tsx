"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEmployeeStore } from "@/lib/store/employee-store"
import { useScheduleStore } from "@/lib/store/schedule-store"
import { Edit, Trash, Calendar, User } from "lucide-react"

export function EmployeeManagement() {
  const { employees, deleteEmployee } = useEmployeeStore()
  const { savedSchedules, loadScheduleFromHistory, createNewSchedule } = useScheduleStore()
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

  const handleLoadSchedule = (employeeName: string) => {
    // البحث عن جدول الموظف
    const employeeSchedule = savedSchedules.find((s) => s.employeeName === employeeName)
    if (employeeSchedule) {
      loadScheduleFromHistory(employeeSchedule.id)
      alert(`تم تحميل جدول الموظف ${employeeName}`)
    } else {
      // إنشاء جدول جديد للموظف إذا لم يكن موجودًا
      createNewSchedule({
        name: `جدول ${employeeName}`,
        startDate: new Date().toISOString(),
        months: 3,
        workDays: [
          { type: "work", count: 1, color: "#4CAF50" },
          { type: "off", count: 3, color: "#FFFFFF" },
        ],
        notes: {},
        pins: {},
        monthColors: {},
        backgroundColor: "#ffffff",
        employeeName: employeeName,
        comments: [],
        showComments: true,
        assignments: {},
      })
      alert(`تم إنشاء جدول جديد للموظف ${employeeName}`)
    }
  }

  const handleDeleteEmployee = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الموظف ${name}؟`)) {
      deleteEmployee(id)
      alert(`تم حذف الموظف ${name} بنجاح`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <span>إدارة الموظفين</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">لا يوجد موظفين. أضف موظف جديد.</div>
        ) : (
          <div className="space-y-4">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className={`p-4 rounded-lg border transition-all ${
                  selectedEmployee === employee.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                }`}
                onClick={() => setSelectedEmployee(employee.id === selectedEmployee ? null : employee.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-gray-500">{employee.position}</div>
                    <div className="text-xs mt-1 text-gray-400">
                      الحد الأقصى للورديات: {employee.maxShiftsPerWeek} في الأسبوع
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLoadSchedule(employee.name)
                      }}
                    >
                      <Calendar className="h-4 w-4 ml-1" />
                      تحميل الجدول
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        alert(`سيتم تنفيذ ميزة تعديل بيانات الموظف ${employee.name} قريبًا`)
                      }}
                    >
                      <Edit className="h-4 w-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteEmployee(employee.id, employee.name)
                      }}
                    >
                      <Trash className="h-4 w-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                </div>

                {selectedEmployee === employee.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <h4 className="text-sm font-medium mb-2">الورديات المفضلة</h4>
                        {employee.preferredShifts.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {employee.preferredShifts.map((shiftId) => (
                              <div key={shiftId} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                {shiftId}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">لا توجد ورديات مفضلة</div>
                        )}
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <h4 className="text-sm font-medium mb-2">إحصائيات</h4>
                        <div className="text-xs text-gray-500">سيتم إضافة إحصائيات الموظف قريبًا</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

