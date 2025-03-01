"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, title: "Details", path: "/add-assignment" },
  { id: 2, title: "Schedule", path: "/add-assignment/schedule" },
  { id: 3, title: "Milestones", path: "/add-assignment/milestones" },
  { id: 4, title: "Settings", path: "/add-assignment/settings" },
]

interface Milestone {
  id: number
  title: string
  description: string
  dueDate: string
}

export default function Milestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([{ id: 1, title: "", description: "", dueDate: "" }])

  const addMilestone = () => {
    const newId = milestones.length > 0 ? Math.max(...milestones.map((m) => m.id)) + 1 : 1
    setMilestones([...milestones, { id: newId, title: "", description: "", dueDate: "" }])
  }

  const removeMilestone = (id: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((m) => m.id !== id))
    }
  }

  const updateMilestone = (id: number, field: keyof Milestone, value: string) => {
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
        <h1 className="text-xl font-semibold">New Assignment - Milestones</h1>
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
                step.path === "/add-assignment/milestones"
                  ? "bg-gray-900 text-white"
                  : "text-gray-400 hover:bg-gray-900",
              )}
            >
              {step.title}
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-2xl space-y-6">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="space-y-4 p-4 bg-gray-900 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Milestone {index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMilestone(milestone.id)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Label htmlFor={`milestone-${milestone.id}-title`}>Title</Label>
                <Input
                  id={`milestone-${milestone.id}-title`}
                  value={milestone.title}
                  onChange={(e) => updateMilestone(milestone.id, "title", e.target.value)}
                  className="mt-1.5 bg-gray-800 border-0 text-white"
                  placeholder="e.g., Complete Research"
                />
              </div>
              <div>
                <Label htmlFor={`milestone-${milestone.id}-description`}>Description</Label>
                <Textarea
                  id={`milestone-${milestone.id}-description`}
                  value={milestone.description}
                  onChange={(e) => updateMilestone(milestone.id, "description", e.target.value)}
                  className="mt-1.5 bg-gray-800 border-0 text-white"
                  placeholder="Describe the milestone..."
                />
              </div>
              <div>
                <Label htmlFor={`milestone-${milestone.id}-due-date`}>Due Date</Label>
                <Input
                  id={`milestone-${milestone.id}-due-date`}
                  type="date"
                  value={milestone.dueDate}
                  onChange={(e) => updateMilestone(milestone.id, "dueDate", e.target.value)}
                  className="mt-1.5 bg-gray-800 border-0 text-white"
                />
              </div>
            </div>
          ))}
          <Button type="button" onClick={addMilestone} className="w-full bg-gray-800 hover:bg-gray-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Milestone
          </Button>
        </div>
      </div>
    </div>
  )
}

