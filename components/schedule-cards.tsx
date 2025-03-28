"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useScheduleStore } from "@/lib/store/schedule-store"
import { formatDate } from "@/lib/utils"
import { Calendar, Users, Clock } from "lucide-react"

interface ScheduleCardsProps {
  onSelectSchedule: () => void
}

export function ScheduleCards({ onSelectSchedule }: ScheduleCardsProps) {
  const { savedSchedules, loadScheduleFromHistory } = useScheduleStore()
  const [filter, setFilter] = useState("all")

  const filteredSchedules = savedSchedules.filter((schedule) => {
    if (filter === "all") return true
    if (filter === "recent") {
      const createdAt = new Date(schedule.createdAt || new Date())
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return createdAt > thirtyDaysAgo
    }
    return true
  })

  return (
    <div className="space-y-8 schedule-cards">
      {/* {viewMode === "arrows" && ( */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">الجداول المحفوظة</h2>
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              جميع الجداول
            </Button>
            <Button variant={filter === "recent" ? "default" : "outline"} size="sm" onClick={() => setFilter("recent")}>
              الجداول الحديثة
            </Button>
          </div>
        </div>

        {filteredSchedules.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد جداول محفوظة</h3>
                <p className="text-gray-500">قم بإنشاء جدول جديد للبدء</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchedules.map((schedule) => (
              <Card
                key={schedule.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary"
                onClick={() => {
                  loadScheduleFromHistory(schedule.id)
                  onSelectSchedule()
                }}
              >
                <div className="h-2 bg-primary" />
                <CardHeader className="pb-2">
                  <CardTitle>{schedule.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>تاريخ البدء: {formatDate(new Date(schedule.startDate))}</span>
                    </div>

                    {schedule.employeeName && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-2" />
                        <span>الموظف: {schedule.employeeName}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>تم الإنشاء: {formatDate(new Date(schedule.createdAt || ""))}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div className="flex gap-2">
                      {schedule.workDays?.map((workDay, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: workDay.color }}
                          title={workDay.type === "work" ? "أيام العمل" : "أيام الإجازة"}
                        />
                      ))}
                    </div>
                    <Button size="sm">فتح الجدول</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* )} */}
    </div>
  )
}

