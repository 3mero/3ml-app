"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useScheduleStore } from "@/lib/store/schedule-store"
import type { Comment } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"
import { X } from "lucide-react"

export function CommentForm() {
  const [text, setText] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [importance, setImportance] = useState<"low" | "medium" | "high">("medium")
  const [color, setColor] = useState("#3b82f6")
  const [reminder, setReminder] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)

  const { currentSchedule, addComment, updateComment } = useScheduleStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentSchedule) return

    const commentData: Comment = {
      id: editingCommentId || uuidv4(),
      date,
      text,
      importance,
      color,
      reminder: reminder || undefined,
      isCompleted: false,
    }

    if (editingCommentId) {
      updateComment(currentSchedule.id, editingCommentId, commentData)
    } else {
      addComment(currentSchedule.id, commentData)
    }

    resetForm()
  }

  const resetForm = () => {
    setText("")
    setDate(format(new Date(), "yyyy-MM-dd"))
    setImportance("medium")
    setColor("#3b82f6")
    setReminder("")
    setEditingCommentId(null)
  }

  const importanceColors = {
    low: "#4CAF50",
    medium: "#FF9800",
    high: "#F44336",
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-center">{editingCommentId ? "تعديل التعليق" : "إضافة تعليق جديد"}</CardTitle>
      </CardHeader>
      <div className="absolute top-2 left-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            // هنا يمكنك إضافة دالة للإغلاق إذا كنت تستخدم هذا النموذج في مكان آخر
            resetForm()
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="comment-date">التاريخ</Label>
            <Input id="comment-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="comment-text">التعليق</Label>
            <Textarea
              id="comment-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="أدخل نص التعليق"
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="comment-importance">الأهمية</Label>
            <Select
              value={importance}
              onValueChange={(value: "low" | "medium" | "high") => {
                setImportance(value)
                setColor(importanceColors[value])
              }}
            >
              <SelectTrigger id="comment-importance">
                <SelectValue placeholder="اختر مستوى الأهمية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">منخفضة</SelectItem>
                <SelectItem value="medium">متوسطة</SelectItem>
                <SelectItem value="high">عالية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="comment-color">اللون</Label>
            <div className="flex items-center">
              <Input
                id="comment-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 p-1 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="comment-reminder">تذكير</Label>
            <Input
              id="comment-reminder"
              type="datetime-local"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
            />
          </div>

          <div className="flex justify-between">
            <Button type="submit">{editingCommentId ? "تحديث" : "إضافة"}</Button>
            {editingCommentId && (
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

