"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, ChevronLeft, LayoutGrid, Calendar } from "lucide-react"

interface ScheduleViewSelectorProps {
  onViewChange: (view: string) => void
  currentView: string
}

export function ScheduleViewSelector({ onViewChange, currentView }: ScheduleViewSelectorProps) {
  // حفظ اختيار المستخدم في التخزين المحلي
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("schedule-view-mode", currentView)
    }
  }, [currentView])

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant={currentView === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("cards")}
            className="flex items-center gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>بطاقات</span>
          </Button>

          <Button
            variant={currentView === "arrows" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("arrows")}
            className="flex items-center gap-2"
          >
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4" />
              <Calendar className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4" />
            </div>
            <span>بالأسهم</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

