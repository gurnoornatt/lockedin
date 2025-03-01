"use client"

import type React from "react"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { HelpCircle, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import CustomLink from "@/components/ui/link"
import TabLink from "@/components/ui/tab-link"
import { cn } from "@/lib/utils"
import axios from "axios"
import { toast, Toaster } from "react-hot-toast"

interface Step {
  id: number
  title: string
  path: string
}

interface Milestone {
  task: string
  period: string
}

const steps: Step[] = [
  { id: 1, title: "Details", path: "/add-assignment" },
  { id: 2, title: "Schedule", path: "/add-assignment/schedule" },
  { id: 3, title: "Milestones", path: "/add-assignment/milestones" },
  { id: 4, title: "Settings", path: "/add-assignment/settings" },
]

export default function AddAssignment() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    priority: "",
    duration: "",
    durationUnit: "hours",
    deadline: "",
    description: "",
    sendReminders: true,
    total_hours: "",
  })
  const [milestones, setMilestones] = useState<Milestone[]>([
    { task: "", period: "" }
  ])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleMilestoneChange = (index: number, field: string, value: string) => {
    const updatedMilestones = [...milestones]
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value
    }
    setMilestones(updatedMilestones)
  }

  const addMilestone = () => {
    setMilestones([...milestones, { task: "", period: "" }])
  }

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      const updatedMilestones = milestones.filter((_, i) => i !== index)
      setMilestones(updatedMilestones)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name || !formData.deadline || !formData.total_hours) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate milestones
    const validMilestones = milestones.filter(m => m.task && m.period)
    if (validMilestones.length === 0) {
      toast.error("Please add at least one milestone with task and period")
      return
    }

    // Prepare data for submission
    const assignmentData = {
      name: formData.name,
      deadline: formData.deadline,
      total_hours: parseInt(formData.total_hours as string),
      milestones: validMilestones
    }

    try {
      setIsSubmitting(true)
      const response = await axios.post('http://localhost:5001/api/save_assignment', assignmentData)
      
      if (response.status === 201) {
        toast.success("Assignment saved!")
        // Redirect to schedule after successful submission
        setTimeout(() => {
          router.push("/schedule")
        }, 1000)
      }
    } catch (error) {
      console.error("Error saving assignment:", error)
      toast.error("Oops, something went wrong!")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster position="top-right" />
      <header className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
        <h1 className="text-xl font-semibold">New Assignment</h1>
        <div className="flex items-center gap-4">
          <CustomLink href="/schedule">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              Cancel
            </Button>
          </CustomLink>
          <Button 
            type="submit" 
            form="assignment-form" 
            className="bg-red-600 hover:bg-red-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </div>
      </header>

      <div className="flex gap-6 p-6">
        {/* Steps Navigation */}
        <div className="w-48 space-y-1">
          {steps.map((step) => (
            <TabLink
              key={step.id}
              href={step.path}
              isActive={pathname === step.path}
              className={cn(
                "block w-full px-4 py-2 rounded-lg transition-colors",
                pathname !== step.path && "text-gray-400 hover:bg-gray-900/50"
              )}
            >
              {step.title}
            </TabLink>
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
                  placeholder="e.g., Speech Practice Set 1"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                    className="mt-1.5 bg-gray-900 border-0 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="total_hours">Total Hours</Label>
                  <Input
                    id="total_hours"
                    type="number"
                    min="1"
                    value={formData.total_hours}
                    onChange={(e) => handleInputChange("total_hours", e.target.value)}
                    className="mt-1.5 bg-gray-900 border-0 text-white"
                    placeholder="e.g., 10"
                  />
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

              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Milestones</h3>
                  <Button 
                    type="button" 
                    onClick={addMilestone}
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 border-gray-700 text-gray-300 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add Milestone
                  </Button>
                </div>
                
                {milestones.map((milestone, index) => (
                  <div key={index} className="p-4 border border-gray-800 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Milestone {index + 1}</h4>
                      <Button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                        disabled={milestones.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div>
                      <Label htmlFor={`task-${index}`}>Task</Label>
                      <Input
                        id={`task-${index}`}
                        value={milestone.task}
                        onChange={(e) => handleMilestoneChange(index, "task", e.target.value)}
                        className="mt-1.5 bg-gray-900 border-0 text-white placeholder:text-gray-500"
                        placeholder='e.g., Say "big cat" 3 times'
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`period-${index}`}>Period (e.g., 14:00-16:00)</Label>
                      <Input
                        id={`period-${index}`}
                        value={milestone.period}
                        onChange={(e) => handleMilestoneChange(index, "period", e.target.value)}
                        className="mt-1.5 bg-gray-900 border-0 text-white placeholder:text-gray-500"
                        placeholder="e.g., 14:00-16:00"
                      />
                    </div>
                  </div>
                ))}
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

