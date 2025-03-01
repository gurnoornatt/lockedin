"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import axios from "axios"
import { toast, Toaster } from "react-hot-toast"

// Sample assignments data as fallback
const sampleAssignmentsData = [
  { id: 1, name: "Research Paper", color: "bg-blue-500" },
  { id: 2, name: "Math Problem Set", color: "bg-green-500" },
  { id: 3, name: "Programming Project", color: "bg-purple-500" },
]

// Sample events data as fallback
const sampleEventsData = [
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
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week")
  const [assignments, setAssignments] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [selectedAssignments, setSelectedAssignments] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch assignments and milestones from the API
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get('http://localhost:5001/api/get_schedule')
        
        if (response.data && Array.isArray(response.data)) {
          // Process the assignments data
          const fetchedAssignments = response.data.map((assignment: any) => ({
            id: assignment.id,
            name: assignment.name,
            deadline: assignment.deadline,
            total_hours: assignment.total_hours,
            color: getRandomColor(), // Assign a random color to each assignment
          }))
          
          setAssignments(fetchedAssignments)
          
          // Set all assignments as selected by default
          setSelectedAssignments(fetchedAssignments.map((a: any) => a.id))
          
          // Process the milestones into events
          const fetchedEvents: any[] = []
          
          response.data.forEach((assignment: any) => {
            if (assignment.milestones && Array.isArray(assignment.milestones)) {
              assignment.milestones.forEach((milestone: any, index: number) => {
                if (milestone.period_start && milestone.period_end) {
                  fetchedEvents.push({
                    id: `${assignment.id}-${index}`,
                    title: milestone.task,
                    assignmentId: assignment.id,
                    start: new Date(milestone.period_start),
                    end: new Date(milestone.period_end),
                    cumulative_goal: milestone.cumulative_goal
                  })
                }
              })
            }
          })
          
          setEvents(fetchedEvents)
        }
      } catch (error) {
        console.error("Error fetching schedule:", error)
        toast.error("Failed to load schedule")
        
        // Use sample data as fallback
        setAssignments(sampleAssignmentsData)
        setSelectedAssignments(sampleAssignmentsData.map(a => a.id))
        setEvents(sampleEventsData)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSchedule()
  }, [])

  // Generate a random color for assignments
  const getRandomColor = () => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", 
      "bg-red-500", "bg-yellow-500", "bg-pink-500",
      "bg-indigo-500", "bg-teal-500", "bg-orange-500"
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const toggleAssignment = (id: number) => {
    setSelectedAssignments((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  const filteredEvents = events.filter((event) => selectedAssignments.includes(event.assignmentId))

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

  // Format deadline for display
  const formatDeadline = (deadline: string) => {
    if (!deadline) return ""
    const date = new Date(deadline)
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      hour: "numeric", 
      minute: "numeric" 
    })
  }

  return (
    <div className="flex h-screen flex-col bg-apple-black text-white">
      <Toaster position="top-right" />
      
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
        <div className="w-64 border-r border-apple-gray/30 bg-apple-black p-4 overflow-y-auto">
          <h2 className="mb-4 text-lg font-medium">Assignments</h2>

          {isLoading ? (
            <div className="text-white/70">Loading assignments...</div>
          ) : (
            <>
              <div className="space-y-2 mb-6">
                {assignments.map((assignment) => (
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
              
              {/* Assignment Details Section */}
              <div className="mt-6 border-t border-apple-gray/30 pt-4">
                <h3 className="mb-3 text-md font-medium">Assignment Details</h3>
                
                {assignments.length > 0 ? (
                  <div className="space-y-4">
                    {assignments.filter(a => selectedAssignments.includes(a.id)).map((assignment) => (
                      <div key={`details-${assignment.id}`} className="p-3 rounded-lg bg-apple-gray/20">
                        <h4 className="font-medium text-white">{assignment.name}</h4>
                        
                        <div className="mt-2 space-y-1 text-sm text-white/70">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                            <span>Due: {formatDeadline(assignment.deadline)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            <span>Total: {assignment.total_hours} hours</span>
                          </div>
                        </div>
                        
                        {/* Milestones for this assignment */}
                        <div className="mt-3 pt-2 border-t border-apple-gray/30">
                          <h5 className="text-xs font-medium text-white/80 mb-2">Milestones:</h5>
                          <ul className="space-y-1.5">
                            {events
                              .filter(event => event.assignmentId === assignment.id)
                              .map((event, idx) => (
                                <li key={`milestone-${event.id}`} className="text-xs">
                                  <div className="flex justify-between">
                                    <span>{event.title}</span>
                                    <span className="text-white/60">{event.cumulative_goal} hrs</span>
                                  </div>
                                  <div className="text-white/50 text-[10px]">
                                    {new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                    {new Date(event.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white/50 text-sm">No assignments selected</div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Calendar View */}
        <div className="flex-1 overflow-auto">
          {viewMode === "month" ? (
            <div className="grid grid-cols-7 gap-px bg-apple-gray/30">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-white/70">
                  {day}
                </div>
              ))}

              {/* Calendar cells */}
              {daysToShow.map((date, i) => {
                const dayEvents = filteredEvents.filter(
                  (event) =>
                    event.start.getDate() === date.getDate() &&
                    event.start.getMonth() === date.getMonth() &&
                    event.start.getFullYear() === date.getFullYear(),
                )

                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[100px] p-1 border border-apple-gray/30",
                      isToday(date) ? "bg-apple-gray/20" : "bg-apple-black",
                    )}
                  >
                    <div
                      className={cn(
                        "text-right text-sm p-1",
                        isToday(date) ? "font-bold text-red-500" : "text-white/70",
                      )}
                    >
                      {formatDate(date)}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.map((event) => {
                        const assignment = assignments.find((a) => a.id === event.assignmentId)
                        return (
                          <div
                            key={event.id}
                            className={cn(
                              "text-xs p-1 rounded truncate",
                              assignment?.color || "bg-blue-500/20",
                            )}
                          >
                            {event.title}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex h-full">
              {/* Time labels */}
              <div className="w-16 border-r border-apple-gray/30">
                <div className="h-12 border-b border-apple-gray/30"></div>
                {timeSlots.map((time, i) => (
                  <div key={i} className="h-12 border-b border-apple-gray/30 pr-2">
                    <div className="text-right text-xs text-white/50 mt-[-0.5em]">{time}</div>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${daysToShow.length}, 1fr)` }}>
                {/* Day headers */}
                <div
                  className="col-span-full grid h-12 border-b border-apple-gray/30"
                  style={{ gridTemplateColumns: `repeat(${daysToShow.length}, 1fr)` }}
                >
                  {daysToShow.map((date, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex flex-col items-center justify-center border-r border-apple-gray/30",
                        isToday(date) ? "bg-apple-gray/20" : "",
                      )}
                    >
                      <div className={cn("text-sm font-medium", isToday(date) ? "text-red-500" : "text-white")}>
                        {formatDayName(date)}
                      </div>
                      <div className={cn("text-sm", isToday(date) ? "text-red-500" : "text-white/70")}>
                        {formatDate(date)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time grid */}
                {timeSlots.map((_, timeIndex) => (
                  <div
                    key={timeIndex}
                    className="col-span-full grid h-12 border-b border-apple-gray/30"
                    style={{ gridTemplateColumns: `repeat(${daysToShow.length}, 1fr)` }}
                  >
                    {daysToShow.map((date, dateIndex) => {
                      const cellEvents = getEventsForCell(date, timeIndex)
                      return (
                        <div
                          key={dateIndex}
                          className={cn(
                            "relative border-r border-apple-gray/30",
                            isToday(date) ? "bg-apple-gray/10" : "",
                          )}
                        >
                          {cellEvents.map((event) => {
                            const assignment = assignments.find((a) => a.id === event.assignmentId)
                            return (
                              <div
                                key={event.id}
                                className={cn(
                                  "absolute inset-x-0 mx-1 p-1 rounded text-xs truncate",
                                  assignment?.color || "bg-blue-500/20",
                                )}
                              >
                                {event.title}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

