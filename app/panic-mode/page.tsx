"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function PanicMode() {
  const router = useRouter()
  const [submission, setSubmission] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sample data
  const requiredWords = 500
  const currentWords = 300
  const timeRemaining = "23h 45m"

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

  const progressPercentage = (currentWords / requiredWords) * 100

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-black">
      <Card className="w-full max-w-[700px] bg-apple-darkGray shadow-lg border-2 border-apple-red">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold text-white animate-pulse">Panic Mode</CardTitle>
          <p className="text-white/80 mt-2">You&apos;re behind—submit catch-up work to exit</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Required: {requiredWords} words total</span>
              <span className="text-white">Current: {currentWords} words</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-apple-lightGray" indicatorClassName="bg-apple-red" />
          </div>

          <div className="text-right text-sm text-white/70">
            <span>{timeRemaining} remaining</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Textarea
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                placeholder="Enter your catch-up work here..."
                className="bg-apple-lightGray text-white border-0 placeholder:text-white/60 min-h-[120px]"
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
                disabled={isSubmitting || submission.length < 10}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Submit & Exit
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

