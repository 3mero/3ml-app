"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useScheduleStore } from "@/lib/store/schedule-store"
import { useShiftStore } from "@/lib/store/shift-store"
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export function ScheduleStats() {
  const { currentSchedule } = useScheduleStore()
  const { shifts } = useShiftStore()

  if (!currentSchedule) return null

  // Calculate statistics for the current month
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const shiftCounts: Record<string, number> = {}
  let workDays = 0
  let offDays = days.length

  // Count shifts and work days
  days.forEach((day) => {
    const dateStr = format(day, "yyyy-MM-dd")
    const shiftId = currentSchedule.assignments?.[dateStr]

    if (shiftId) {
      const shift = shifts.find((s) => s.id === shiftId)
      if (shift) {
        shiftCounts[shift.name] = (shiftCounts[shift.name] || 0) + 1
        workDays++
        offDays--
      }
    }
  })

  // Prepare data for pie chart
  const chartData = [
    { name: "أيام العمل", value: workDays, color: "#4CAF50" },
    { name: "أيام الراحة", value: offDays, color: "#F44336" },
  ]

  // Prepare shift data for table
  const shiftData = Object.entries(shiftCounts).map(([name, count]) => {
    const shift = shifts.find((s) => s.name === name)
    return {
      name,
      count,
      color: shift?.color || "#ccc",
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">إحصائيات الشهر الحالي</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">توزيع أيام العمل والراحة</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">توزيع الورديات</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-right">الوردية</th>
                    <th className="border p-2 text-center">عدد الأيام</th>
                    <th className="border p-2 text-center">النسبة</th>
                  </tr>
                </thead>
                <tbody>
                  {shiftData.map((shift, index) => (
                    <tr key={index}>
                      <td className="border p-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full ml-2" style={{ backgroundColor: shift.color }}></div>
                          {shift.name}
                        </div>
                      </td>
                      <td className="border p-2 text-center">{shift.count}</td>
                      <td className="border p-2 text-center">{((shift.count / days.length) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td className="border p-2">المجموع</td>
                    <td className="border p-2 text-center">{workDays}</td>
                    <td className="border p-2 text-center">{((workDays / days.length) * 100).toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

