"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, title: "Details", path: "/add-assignment" },
  { id: 2, title: "Schedule", path: "/add-assignment/schedule" },
  { id: 3, title: "Settings", path: "/add-assignment/settings" },
]

export default function Schedule() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [workHoursPerDay, setWorkHoursPerDay] = useState(4)
  const [weekendWork, setWeekendWork] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
        <h1 className="text-xl font-semibold">New Assignment - Schedule</h1>
        <div className="flex items-center gap-4">
          <Link href="/schedule">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              Cancel
            </Button>
          </Link>
          <Button className="bg-red-600 hover:bg-red-700">Continue</Button>
        </div>
      </header>

      <div className="flex gap-6 p-6">
        {/* Steps Navigation */}
        <div className="w-48 space-y-1">
          {steps.map((step) => (
            <Link
              key={step.id}
              href={step.path}
              className={cn(
                "block w-full px-4 py-2 rounded-lg transition-colors",
                step.path === "/add-assignment/schedule" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-900",
              )}
            >
              {step.title}
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-2xl space-y-6">
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1.5 bg-gray-900 border-0 text-white"
            />
          </div>

          <div>
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1.5 bg-gray-900 border-0 text-white"
            />
          </div>

          <div>
            <Label htmlFor="work-hours">Work Hours per Day: {workHoursPerDay}</Label>
            <Slider
              id="work-hours"
              min={1}
              max={12}
              step={1}
              value={[workHoursPerDay]}
              onValueChange={([value]) => setWorkHoursPerDay(value)}
              className="mt-2"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="weekend-work">Allow Weekend Work</Label>
            <Switch id="weekend-work" checked={weekendWork} onCheckedChange={setWeekendWork} />
          </div>
        </div>
      </div>
    </div>
  )
}

