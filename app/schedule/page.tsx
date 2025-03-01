"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import axios from "axios"
import { toast, Toaster } from "react-hot-toast"

// Define types for our data
interface Assignment {
  id: number
  name: string
  deadline: string
  total_hours: number
  color: string
}

interface Milestone {
  task: string
  period_start: string
  period_end: string
  cumulative_goal: number
}

interface Event {
  id: string
  title: string
  assignmentId: number
  start: Date
  end: Date
  cumulative_goal: number
}

// Sample assignments data as fallback
const sampleAssignmentsData = [
  { id: 1, name: "Research Paper", color: "bg-blue-500" },
  { id: 2, name: "Math Problem Set", color: "bg-green-500" },
  { id: 3, name: "Programming Project", color: "bg-purple-500" },
]

// Sample events data as fallback
const sampleEventsData = [
  {
    id: "1",
    title: "Research Sources",
    assignmentId: 1,
    start: new Date(2025, 1, 28, 14, 0), // Feb 28, 2025, 2 PM
    end: new Date(2025, 1, 28, 16, 0), // Feb 28, 2025, 4 PM
    cumulative_goal: 2
  },
  {
    id: "2",
    title: "Write Outline",
    assignmentId: 1,
    start: new Date(2025, 2, 1, 10, 0), // Mar 1, 2025, 10 AM
    end: new Date(2025, 2, 1, 12, 0), // Mar 1, 2025, 12 PM
    cumulative_goal: 4
  },
  {
    id: "3",
    title: "Solve Problems 1-5",
    assignmentId: 2,
    start: new Date(2025, 2, 2, 13, 0), // Mar 2, 2025, 1 PM
    end: new Date(2025, 2, 2, 15, 0), // Mar 2, 2025, 3 PM
    cumulative_goal: 3
  },
  {
    id: "4",
    title: "Setup Environment",
    assignmentId: 3,
    start: new Date(2025, 2, 3, 9, 0), // Mar 3, 2025, 9 AM
    end: new Date(2025, 2, 3, 11, 0), // Mar 3, 2025, 11 AM
    cumulative_goal: 2
  },
]

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week")
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [selectedAssignments, setSelectedAssignments] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAssignmentDetails, setSelectedAssignmentDetails] = useState<number | null>(null)

  // Helper function to parse problematic dates
  const parseDateSafely = (dateString: string) => {
    if (!dateString) return null
    
    // Try to parse date string considering different formats
    try {
      // Check if it's a correct ISO format
      if (dateString.includes('T') && dateString.includes(':')) {
        return new Date(dateString)
      }
      
      // Handle period strings like "14:00-16:00"
      if (dateString.includes('-')) {
        // It's a time range, extract just the first part
        const timePart = dateString.split('-')[0].trim()
        
        // Create a date for today with the specified time
        const today = new Date()
        const [hours, minutes] = timePart.split(':').map(num => parseInt(num))
        
        today.setHours(hours || 0, minutes || 0, 0, 0)
        return today
      }
      
      // If it's just a number (like "10"), treat it as an hour
      if (!isNaN(Number(dateString))) {
        const today = new Date()
        today.setHours(parseInt(dateString), 0, 0, 0)
        return today
      }
      
      // Last resort: return current date
      return new Date()
    } catch (error) {
      console.error("Error parsing date:", dateString, error)
      return new Date() // Fallback to current date
    }
  }

  // Fetch assignments and milestones from the API
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get('http://localhost:5001/api/get_schedule')
        
        if (response.data && Array.isArray(response.data)) {
          // Process the assignments data
          const fetchedAssignments = response.data.map((assignment: {
            id: number;
            name: string;
            deadline: string;
            total_hours: number;
            milestones: Milestone[];
          }) => ({
            id: assignment.id,
            name: assignment.name,
            deadline: assignment.deadline,
            total_hours: assignment.total_hours,
            color: getRandomColor(), // Assign a random color to each assignment
          }))
          
          setAssignments(fetchedAssignments)
          
          // Set all assignments as selected by default
          setSelectedAssignments(fetchedAssignments.map((a) => a.id))
          
          // Process the milestones into events
          const fetchedEvents: Event[] = []
          
          response.data.forEach((assignment: {
            id: number;
            milestones: Milestone[];
          }) => {
            if (assignment.milestones && Array.isArray(assignment.milestones)) {
              assignment.milestones.forEach((milestone: Milestone, index: number) => {
                // Handle the milestone period properly
                const startDate = parseDateSafely(milestone.period_start)
                const endDate = parseDateSafely(milestone.period_end)
                
                // Only add event if we could parse the dates
                if (startDate && endDate) {
                  fetchedEvents.push({
                    id: `${assignment.id}-${index}`,
                    title: milestone.task,
                    assignmentId: assignment.id,
                    start: startDate,
                    end: endDate,
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
        setAssignments(sampleAssignmentsData as Assignment[])
        setSelectedAssignments(sampleAssignmentsData.map(a => a.id))
        setEvents(sampleEventsData as Event[])
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

  const toggleAssignmentDetails = (id: number) => {
    setSelectedAssignmentDetails(selectedAssignmentDetails === id ? null : id)
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
    // Return only hours from 8 AM to 11 PM to match the Apple Calendar style
    return Array.from({ length: 16 }, (_, i) => {
      const hour = i + 8 // Start from 8 AM
      return `${hour === 12 ? 12 : hour > 12 ? hour - 12 : hour} ${hour >= 12 ? "PM" : "AM"}`
    })
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
        event.start.getHours() === hour + 8, // Adjust for our 8 AM start
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
    
    // Check if the date is valid
    if (isNaN(date.getTime())) return "Invalid date"
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      hour: "numeric", 
      minute: "numeric" 
    })
  }

  // Format time for milestone display
  const formatTime = (date: Date) => {
    if (!date || isNaN(date.getTime())) return "--:--"
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  }

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-black px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-red-500">FocusLock Calendar</h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" className="text-white hover:bg-gray-800" onClick={navigatePrevious}>
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button variant="ghost" className="text-red-500 hover:bg-gray-800" onClick={navigateToday}>
            Today
          </Button>

          <Button variant="ghost" className="text-white hover:bg-gray-800" onClick={navigateNext}>
            <ChevronRight className="h-5 w-5" />
          </Button>

          <h2 className="ml-4 text-lg font-medium">{getMonthYear()}</h2>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg bg-gray-800 p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-md px-3 py-1 text-sm",
                viewMode === "day" ? "bg-gray-700 text-white" : "text-white/70 hover:bg-gray-700",
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
                viewMode === "week" ? "bg-gray-700 text-white" : "text-white/70 hover:bg-gray-700",
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
                viewMode === "month" ? "bg-gray-700 text-white" : "text-white/70 hover:bg-gray-700",
              )}
              onClick={() => setViewMode("month")}
            >
              Month
            </Button>
          </div>

          <Link href="/add-assignment">
            <Button size="icon" variant="ghost" className="ml-2 text-white hover:bg-gray-800">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Calendar Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-800 bg-black overflow-y-auto flex flex-col">
          {/* Calendar Selection Section */}
          <div className="p-4 border-b border-gray-800">
            <h2 className="mb-3 text-lg font-medium">Calendar</h2>
            
            {isLoading ? (
              <div className="text-white/70">Loading assignments...</div>
            ) : (
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Checkbox
                        id={`assignment-${assignment.id}`}
                        checked={selectedAssignments.includes(assignment.id)}
                        onCheckedChange={() => toggleAssignment(assignment.id)}
                        className={cn("rounded-sm", assignment.color.replace("bg-", "text-").replace("-500", "-400"))}
                      />
                      <label
                        htmlFor={`assignment-${assignment.id}`}
                        className="ml-2 text-sm font-medium text-white cursor-pointer"
                      >
                        {assignment.name}
                      </label>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 rounded-full hover:bg-gray-800"
                      onClick={() => toggleAssignmentDetails(assignment.id)}
                    >
                      <span className="text-xs text-white/70">{selectedAssignmentDetails === assignment.id ? '−' : '+'}</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Assignment Details Section */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedAssignmentDetails && !isLoading && (
              <div>
                {assignments
                  .filter(a => a.id === selectedAssignmentDetails)
                  .map((assignment) => (
                    <div key={`details-${assignment.id}`}>
                      <h3 className="text-md font-medium text-white mb-2">Assignment Details</h3>
                      
                      <div className="p-3 rounded-lg bg-gray-800/40 mb-3">
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
                      </div>
                      
                      {/* Milestones for this assignment */}
                      <div>
                        <h5 className="text-sm font-medium text-white/80 mb-2">Milestones:</h5>
                        <ul className="space-y-2">
                          {events
                            .filter(event => event.assignmentId === assignment.id)
                            .map((event) => (
                              <li key={`milestone-${event.id}`} 
                                  className={cn("text-xs rounded p-2 border-l-2", 
                                  assignment.color.replace("bg-", "border-"),
                                  "bg-gray-800/20")}>
                                <div className="font-medium">{event.title}</div>
                                <div className="flex justify-between mt-1">
                                  <span className="text-white/60">
                                    {formatTime(event.start)} - {formatTime(event.end)}
                                  </span>
                                  <span className="text-white/90 font-medium">{event.cumulative_goal} hrs</span>
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            
            {!selectedAssignmentDetails && !isLoading && (
              <div className="text-white/50 text-sm text-center mt-4">
                Select an assignment to view details
              </div>
            )}
          </div>
        </div>

        {/* Calendar View */}
        <div className="flex-1 overflow-auto">
          {viewMode === "month" ? (
            <div className="grid grid-cols-7 gap-px bg-gray-800">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-white/70 bg-gray-900">
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
                      "min-h-[100px] p-1 border border-gray-800",
                      isToday(date) ? "bg-gray-800/50" : "bg-black",
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
              <div className="w-16 border-r border-gray-800 bg-black">
                <div className="h-12 border-b border-gray-800"></div>
                {timeSlots.map((time, i) => (
                  <div key={i} className="h-14 border-b border-gray-800 pr-2">
                    <div className="text-right text-xs text-white/50 mt-[-0.5em]">{time}</div>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${daysToShow.length}, 1fr)` }}>
                {/* Day headers */}
                <div
                  className="col-span-full grid h-12 border-b border-gray-800"
                  style={{ gridTemplateColumns: `repeat(${daysToShow.length}, 1fr)` }}
                >
                  {daysToShow.map((date, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex flex-col items-center justify-center border-r border-gray-800",
                        isToday(date) ? "bg-gray-800/50" : "",
                      )}
                    >
                      <div className={cn("text-sm font-medium", isToday(date) ? "text-red-500" : "text-white")}>
                        {formatDayName(date)}
                      </div>
                      <div className={cn("text-sm", isToday(date) ? "text-red-500 font-bold" : "text-white/70")}>
                        {formatDate(date)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time grid */}
                {timeSlots.map((_, timeIndex) => (
                  <div
                    key={timeIndex}
                    className="col-span-full grid h-14 border-b border-gray-800"
                    style={{ gridTemplateColumns: `repeat(${daysToShow.length}, 1fr)` }}
                  >
                    {daysToShow.map((date, dateIndex) => {
                      const cellEvents = getEventsForCell(date, timeIndex)
                      return (
                        <div
                          key={dateIndex}
                          className={cn(
                            "relative border-r border-gray-800",
                            isToday(date) ? "bg-gray-800/20" : "",
                          )}
                        >
                          {cellEvents.map((event) => {
                            const assignment = assignments.find((a) => a.id === event.assignmentId)
                            return (
                              <div
                                key={event.id}
                                className={cn(
                                  "absolute inset-x-0 mx-1 p-1 rounded-sm text-xs truncate",
                                  assignment?.color?.replace("-500", "-400/80") || "bg-blue-400/80",
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

