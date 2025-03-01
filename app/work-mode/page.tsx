"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Check } from "lucide-react"

export default function WorkMode() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(5400) // 1:30:00 in seconds
  const [isTimeUp, setIsTimeUp] = useState(false)
  const [progress, setProgress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sample data
  const currentAssignment = {
    name: "Research Paper",
    currentTask: "Write Introduction",
  }

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsTimeUp(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false)
      // Use router.push for smooth navigation
      router.push("/schedule")
    }, 1500)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-black">
      <Card className="w-full max-w-[700px] bg-apple-darkGray shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-white">Work Mode</CardTitle>
          <p className="text-white/70">{currentAssignment.name}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl text-white mb-6">
              Current Task: <span className="font-medium">{currentAssignment.currentTask}</span>
            </h2>

            <div className={`text-4xl font-mono ${timeLeft < 300 ? "text-apple-red" : "text-white"}`}>
              {formatTime(timeLeft)}
            </div>
          </div>

          {isTimeUp && (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-white/90 block">Submit your progress:</label>
                <Textarea
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  placeholder="Describe what you've accomplished..."
                  className="bg-apple-lightGray text-white border-0 placeholder:text-white/60 min-h-[100px]"
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Proof
                </Button>

                <Button
                  type="submit"
                  className="bg-apple-blue hover:bg-apple-blue/90 text-white ml-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Submit Progress
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {isTimeUp && (
        <div className="fixed bottom-0 left-0 right-0 bg-apple-darkGray p-4 text-center text-white text-lg animate-pulse">
          Time&apos;s up—submit now!
        </div>
      )}
    </main>
  )
}

