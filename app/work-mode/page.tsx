"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Check, AlertTriangle } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"

export default function WorkMode() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [timeLeft, setTimeLeft] = useState(5400) // 1:30:00 in seconds
  const [isTimeUp, setIsTimeUp] = useState(false)
  const [progress, setProgress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [extensionInstalled, setExtensionInstalled] = useState(false)
  const [workModeActive, setWorkModeActive] = useState(false)

  // Sample data
  const currentAssignment = {
    name: "Research Paper",
    currentTask: "Write Introduction",
  }

  // Check if the extension is installed and if work mode should be started
  useEffect(() => {
    // Check if the extension is installed
    if (typeof window !== 'undefined' && (window as any).focusLockExtensionInstalled) {
      setExtensionInstalled(true);
    }

    // Listen for the extension ready event
    const handleExtensionReady = () => {
      setExtensionInstalled(true);
    };

    document.addEventListener('focusLockExtensionReady', handleExtensionReady);
    document.addEventListener('focusLockExtensionLoaded', handleExtensionReady);

    // Check if we should show the submission form (from URL parameter)
    if (searchParams.get('submit') === 'true') {
      setIsTimeUp(true);
    }

    return () => {
      document.removeEventListener('focusLockExtensionReady', handleExtensionReady);
      document.removeEventListener('focusLockExtensionLoaded', handleExtensionReady);
    };
  }, [searchParams]);

  // Timer effect
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

  const startWorkMode = async () => {
    if (!extensionInstalled) {
      toast.error("FocusLock extension is not installed");
      return;
    }

    try {
      // Calculate end time (1.5 hours from now)
      const endTime = new Date(Date.now() + timeLeft * 1000).toISOString();
      
      // Send message to extension
      if ((window as any).sendToFocusLockExtension) {
        const response = await (window as any).sendToFocusLockExtension({
          action: 'startWorkMode',
          period_end: endTime
        });
        
        if (response && response.status) {
          setWorkModeActive(true);
          toast.success("Work Mode activated");
        }
      }
    } catch (error) {
      console.error("Error starting Work Mode:", error);
      toast.error("Failed to start Work Mode");
    }
  };

  const endWorkMode = async () => {
    if (!extensionInstalled) return;

    try {
      // Send message to extension
      if ((window as any).sendToFocusLockExtension) {
        const response = await (window as any).sendToFocusLockExtension({
          action: 'endWorkMode'
        });
        
        if (response && response.status) {
          setWorkModeActive(false);
          toast.success("Work Mode deactivated");
        }
      }
    } catch (error) {
      console.error("Error ending Work Mode:", error);
      toast.error("Failed to end Work Mode");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call to submit progress
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // End work mode in the extension
      if (extensionInstalled) {
        await endWorkMode();
      }
      
      toast.success("Progress submitted successfully");
      
      // Navigate back to schedule
      setTimeout(() => {
        router.push("/schedule");
      }, 1000);
    } catch (error) {
      console.error("Error submitting progress:", error);
      toast.error("Failed to submit progress");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-black">
      <Toaster position="top-right" />
      
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

          {!isTimeUp && !workModeActive && extensionInstalled && (
            <div className="text-center pt-4">
              <Button 
                onClick={startWorkMode}
                className="bg-apple-blue hover:bg-apple-blue/90 text-white"
              >
                Activate Work Mode
              </Button>
              <p className="text-white/60 text-sm mt-2">
                This will block distracting websites and keep you focused
              </p>
            </div>
          )}
          
          {!isTimeUp && workModeActive && (
            <div className="text-center pt-4">
              <div className="bg-apple-blue/20 text-white p-3 rounded-md mb-4">
                Work Mode is active. Stay focused!
              </div>
              <Button 
                onClick={endWorkMode}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                End Work Mode Early
              </Button>
            </div>
          )}
          
          {!extensionInstalled && !isTimeUp && (
            <div className="bg-apple-red/20 p-4 rounded-md flex items-start gap-3 mt-4">
              <AlertTriangle className="h-5 w-5 text-apple-red shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-white">Extension Not Detected</h3>
                <p className="text-white/70 text-sm mt-1">
                  The FocusLock extension is not installed. Work Mode restrictions will not be enforced.
                </p>
                <a 
                  href="#" 
                  className="text-apple-blue text-sm mt-2 inline-block"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.error("Please install the FocusLock extension from the extension directory");
                  }}
                >
                  Install Extension
                </a>
              </div>
            </div>
          )}

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

