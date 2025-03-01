"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, title: "Details", path: "/add-assignment" },
  { id: 2, title: "Schedule", path: "/add-assignment/schedule" },
  { id: 3, title: "Milestones", path: "/add-assignment/milestones" },
  { id: 4, title: "Settings", path: "/add-assignment/settings" },
]

export default function Settings() {
  const [notifications, setNotifications] = useState(true)
  const [reminderFrequency, setReminderFrequency] = useState("daily")
  const [priorityAdjustment, setPriorityAdjustment] = useState(true)
  const [publicVisibility, setPublicVisibility] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
        <h1 className="text-xl font-semibold">New Assignment - Settings</h1>
        <div className="flex items-center gap-4">
          <Link href="/schedule">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              Cancel
            </Button>
          </Link>
          <Button className="bg-red-600 hover:bg-red-700">Save Assignment</Button>
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
                step.path === "/add-assignment/settings" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-900",
              )}
            >
              {step.title}
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="text-lg">
              Enable Notifications
            </Label>
            <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-frequency" className="text-lg">
              Reminder Frequency
            </Label>
            <Select value={reminderFrequency} onValueChange={setReminderFrequency} disabled={!notifications}>
              <SelectTrigger id="reminder-frequency" className="w-full bg-gray-900 border-0 text-white">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="priority-adjustment" className="text-lg">
              Auto-adjust Priority
            </Label>
            <Switch id="priority-adjustment" checked={priorityAdjustment} onCheckedChange={setPriorityAdjustment} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="public-visibility" className="text-lg">
              Public Visibility
            </Label>
            <Switch id="public-visibility" checked={publicVisibility} onCheckedChange={setPublicVisibility} />
          </div>
        </div>
      </div>
    </div>
  )
}

