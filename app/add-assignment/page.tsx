"use client"

import type React from "react"

import { useState } from "react"
import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Step {
  id: number
  title: string
  path: string
}

const steps: Step[] = [
  { id: 1, title: "Details", path: "/add-assignment" },
  { id: 2, title: "Schedule", path: "/add-assignment/schedule" },
  { id: 3, title: "Milestones", path: "/add-assignment/milestones" },
  { id: 4, title: "Settings", path: "/add-assignment/settings" },
]

export default function AddAssignment() {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    priority: "",
    duration: "",
    durationUnit: "hours",
    deadline: "",
    description: "",
    sendReminders: true,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log(formData)
    window.location.href = "/schedule"
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
        <h1 className="text-xl font-semibold">New Assignment</h1>
        <div className="flex items-center gap-4">
          <Link href="/schedule">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              Cancel
            </Button>
          </Link>
          <Button type="submit" form="assignment-form" className="bg-red-600 hover:bg-red-700">
            Continue
          </Button>
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
                step.path === "/add-assignment" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-900",
              )}
            >
              {step.title}
            </Link>
          ))}
        </div>

        {/* Main Form */}
        <div className="flex-1 max-w-2xl">
          <form id="assignment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Assignment Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1.5 bg-gray-900 border-0 text-white placeholder:text-gray-500"
                  placeholder="e.g., Research Paper"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Assignment Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger id="type" className="mt-1.5 bg-gray-900 border-0 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="essay">Essay</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger id="priority" className="mt-1.5 bg-gray-900 border-0 text-white">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description / Instructions</Label>
                  <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-gray-400 hover:text-white">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="mt-1.5 bg-gray-900 border-0 text-white placeholder:text-gray-500 min-h-[100px]"
                  placeholder="Add any additional details or instructions..."
                />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="reminders"
                  checked={formData.sendReminders}
                  onCheckedChange={(checked) => handleInputChange("sendReminders", checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="reminders"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Send deadline reminders
                  </label>
                  <p className="text-sm text-gray-400">Receive notifications as the deadline approaches</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

