"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useScheduleStore } from "@/lib/store/schedule-store"
import { format, parseISO } from "date-fns"
import { ar } from "date-fns/locale"
import { Check, Clock, Trash } from "lucide-react"

export function CommentList() {
  const { currentSchedule, updateComment, deleteComment, toggleCommentCompletion } = useScheduleStore()
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all")

  if (!currentSchedule || !currentSchedule.comments) return null

  const filteredComments = currentSchedule.comments.filter((comment) => {
    if (filter === "all") return true
    if (filter === "completed") return comment.isCompleted
    if (filter === "pending") return !comment.isCompleted
    return true
  })

  const handleToggleCompletion = (commentId: string) => {
    if (currentSchedule) {
      toggleCommentCompletion(currentSchedule.id, commentId)
    }
  }

  const handleDelete = (commentId: string) => {
    if (currentSchedule) {
      deleteComment(currentSchedule.id, commentId)
    }
  }

  const getImportanceLabel = (importance: string) => {
    switch (importance) {
      case "low":
        return "منخفضة"
      case "medium":
        return "متوسطة"
      case "high":
        return "عالية"
      default:
        return importance
    }
  }

  return (
    <div className="mt-4">
      <div className="flex justify-center space-x-2 mb-4">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="ml-2"
        >
          الكل
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
          className="ml-2"
        >
          معلقة
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          مكتملة
        </Button>
      </div>

      {filteredComments.length === 0 ? (
        <p className="text-center text-muted-foreground">لا توجد تعليقات</p>
      ) : (
        <div className="space-y-3">
          {filteredComments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full ml-2" style={{ backgroundColor: comment.color }}></div>
                      <span className="text-sm font-medium">
                        {format(parseISO(comment.date), "dd MMMM yyyy", { locale: ar })}
                      </span>
                      <span
                        className="mr-2 text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: comment.color + "20",
                          color: comment.color,
                        }}
                      >
                        {getImportanceLabel(comment.importance)}
                      </span>
                    </div>

                    <p className={`text-sm ${comment.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {comment.text}
                    </p>

                    {comment.reminder && (
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 ml-1" />
                        {format(parseISO(comment.reminder), "dd/MM/yyyy HH:mm")}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleToggleCompletion(comment.id)}
                    >
                      <Check className={`h-4 w-4 ${comment.isCompleted ? "text-green-500" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 mr-1"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

