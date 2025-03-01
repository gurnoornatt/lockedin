"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

// Sample assignments data
const assignmentsData = [
  { id: 1, name: "Research Paper", color: "bg-blue-500" },
  { id: 2, name: "Math Problem Set", color: "bg-green-500" },
  { id: 3, name: "Programming Project", color: "bg-purple-500" },
]

// Sample events data
const eventsData = [
  {
    id: 1,
    title: "Research Sources",
    assignmentId: 1,
    start: new Date(2025, 1, 28, 14, 0), // Feb 28, 2025, 2 PM
    end: new Date(2025, 1, 28, 16, 0), // Feb 28, 2025, 4 PM
  },
  {
    id: 2,
    title: "Write Outline",
    assignmentId: 1,
    start: new Date(2025, 2, 1, 10, 0), // Mar 1, 2025, 10 AM
    end: new Date(2025, 2, 1, 12, 0), // Mar 1, 2025, 12 PM
  },
  {
    id: 3,
    title: "Solve Problems 1-5",
    assignmentId: 2,
    start: new Date(2025, 2, 2, 13, 0), // Mar 2, 2025, 1 PM
    end: new Date(2025, 2, 2, 15, 0), // Mar 2, 2025, 3 PM
  },
  {
    id: 4,
    title: "Setup Environment",
    assignmentId: 3,
    start: new Date(2025, 2, 3, 9, 0), // Mar 3, 2025, 9 AM
    end: new Date(2025, 2, 3, 11, 0), // Mar 3, 2025, 11 AM
  },
]

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1, 28)) // Feb 28, 2025
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week")
  const [selectedAssignments, setSelectedAssignments] = useState<number[]>(assignmentsData.map((a) => a.id))

  const toggleAssignment = (id: number) => {
    setSelectedAssignments((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  const filteredEvents = eventsData.filter((event) => selectedAssignments.includes(event.assignmentId))

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getDaysToShow = () => {
    switch (viewMode) {
      case "day":
        return [currentDate]
      case "week":
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
        return Array.from({ length: 7 }, (_, i) => {
          const day = new Date(startOfWeek)
          day.setDate(startOfWeek.getDate() + i)
          return day
        })
      case "month":
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const daysInMonth = getDaysInMonth(year, month)
        return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
    }
  }

  const daysToShow = getDaysToShow()

  const getMonthYear = () => {
    return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const navigatePrevious = () => {
    const newDate = new Date(currentDate)
    switch (viewMode) {
      case "day":
        newDate.setDate(newDate.getDate() - 1)
        break
      case "week":
        newDate.setDate(newDate.getDate() - 7)
        break
      case "month":
        newDate.setMonth(newDate.getMonth() - 1)
        break
    }
    setCurrentDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    switch (viewMode) {
      case "day":
        newDate.setDate(newDate.getDate() + 1)
        break
      case "week":
        newDate.setDate(newDate.getDate() + 7)
        break
      case "month":
        newDate.setMonth(newDate.getMonth() + 1)
        break
    }
    setCurrentDate(newDate)
  }

  const navigateToday = () => {
    setCurrentDate(new Date())
  }

  const getTimeSlots = () => {
    return Array.from({ length: 24 }, (_, i) => `${i === 0 ? 12 : i > 12 ? i - 12 : i} ${i >= 12 ? "PM" : "AM"}`)
  }

  const timeSlots = getTimeSlots()

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const getEventsForCell = (date: Date, hour: number) => {
    return filteredEvents.filter(
      (event) =>
        event.start.getDate() === date.getDate() &&
        event.start.getMonth() === date.getMonth() &&
        event.start.getFullYear() === date.getFullYear() &&
        event.start.getHours() === hour,
    )
  }

  const formatDate = (date: Date) => {
    return date.getDate().toString()
  }

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }

  return (
    <div className="flex h-screen flex-col bg-apple-black text-white">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-apple-gray/30 bg-apple-black px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-red-500">FocusLock</h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" className="text-white hover:bg-apple-gray/20" onClick={navigatePrevious}>
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button variant="ghost" className="text-red-500 hover:bg-apple-gray/20" onClick={navigateToday}>
            Today
          </Button>

          <Button variant="ghost" className="text-white hover:bg-apple-gray/20" onClick={navigateNext}>
            <ChevronRight className="h-5 w-5" />
          </Button>

          <h2 className="ml-4 text-lg font-medium">{getMonthYear()}</h2>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg bg-apple-gray/50 p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-md px-3 py-1 text-sm",
                viewMode === "day" ? "bg-apple-gray text-white" : "text-white/70 hover:bg-apple-gray/30",
              )}
              onClick={() => setViewMode("day")}
            >
              Day
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-md px-3 py-1 text-sm",
                viewMode === "week" ? "bg-apple-gray text-white" : "text-white/70 hover:bg-apple-gray/30",
              )}
              onClick={() => setViewMode("week")}
            >
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-md px-3 py-1 text-sm",
                viewMode === "month" ? "bg-apple-gray text-white" : "text-white/70 hover:bg-apple-gray/30",
              )}
              onClick={() => setViewMode("month")}
            >
              Month
            </Button>
          </div>

          <Link href="/add-assignment">
            <Button size="icon" variant="ghost" className="ml-2 text-white hover:bg-apple-gray/20">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Calendar Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 border-r border-apple-gray/30 bg-apple-black p-4">
          <h2 className="mb-4 text-lg font-medium">Assignments</h2>

          <div className="space-y-2">
            {assignmentsData.map((assignment) => (
              <div key={assignment.id} className="flex items-center">
                <Checkbox
                  id={`assignment-${assignment.id}`}
                  checked={selectedAssignments.includes(assignment.id)}
                  onCheckedChange={() => toggleAssignment(assignment.id)}
                />
                <label
                  htmlFor={`assignment-${assignment.id}`}
                  className="ml-2 text-sm font-medium text-white cursor-pointer"
                >
                  {assignment.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-[auto_1fr] border-b border-apple-gray/30">
            {/* Empty cell for time column header */}
            <div className="border-r border-apple-gray/30 p-2"></div>

            {/* Day headers */}
            <div className="grid grid-cols-7">
              {daysToShow.map((date, index) => (
                <div
                  key={index}
                  className={cn("border-r border-apple-gray/30 p-2 text-center", isToday(date) && "bg-apple-gray/10")}
                >
                  <div className="text-xs text-white/70">{formatDayName(date)}</div>
                  <div
                    className={cn(
                      "mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm",
                      isToday(date) ? "bg-red-500 text-white" : "text-white",
                    )}
                  >
                    {formatDate(date)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Time slots */}
            {timeSlots.map((timeSlot, hourIndex) => (
              <div key={hourIndex} className="grid grid-cols-[auto_1fr]">
                {/* Time label */}
                <div className="sticky left-0 border-r border-apple-gray/30 bg-apple-black p-2 text-right text-xs text-white/70 w-16">
                  {timeSlot}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7">
                  {daysToShow.map((date, dayIndex) => {
                    const events = getEventsForCell(date, hourIndex)

                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          "relative border-r border-b border-apple-gray/30 h-12",
                          isToday(date) && "bg-apple-gray/10",
                        )}
                      >
                        {events.map((event) => {
                          const assignment = assignmentsData.find((a) => a.id === event.assignmentId)
                          return (
                            <div
                              key={event.id}
                              className={cn(
                                "absolute left-0 right-0 mx-1 rounded p-1 text-xs text-white",
                                assignment?.color || "bg-gray-500",
                                "z-10",
                              )}
                              style={{
                                top: "2px",
                                height: `${(event.end.getHours() - event.start.getHours()) * 48 - 4}px`,
                              }}
                            >
                              {event.title}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

