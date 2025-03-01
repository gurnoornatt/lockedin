"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Check, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { toast, Toaster } from "react-hot-toast"

export default function PanicMode() {
  const router = useRouter()
  const [submission, setSubmission] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [extensionInstalled, setExtensionInstalled] = useState(false)
  const [panicModeActive, setPanicModeActive] = useState(false)

  // Sample data
  const requiredWords = 500
  const currentWords = 300
  const timeRemaining = "23h 45m"

  // Check if the extension is installed
  useEffect(() => {
    // Check if the extension is installed
    if (typeof window !== 'undefined' && (window as any).focusLockExtensionInstalled) {
      setExtensionInstalled(true);
      activatePanicMode();
    }

    // Listen for the extension ready event
    const handleExtensionReady = () => {
      setExtensionInstalled(true);
      activatePanicMode();
    };

    document.addEventListener('focusLockExtensionReady', handleExtensionReady);
    document.addEventListener('focusLockExtensionLoaded', handleExtensionReady);

    // Request fullscreen mode
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to enter fullscreen mode:", error);
    }

    return () => {
      document.removeEventListener('focusLockExtensionReady', handleExtensionReady);
      document.removeEventListener('focusLockExtensionLoaded', handleExtensionReady);
    };
  }, []);

  const activatePanicMode = async () => {
    if (!extensionInstalled) return;

    try {
      // Send message to extension
      if ((window as any).sendToFocusLockExtension) {
        const response = await (window as any).sendToFocusLockExtension({
          action: 'startPanicMode'
        });
        
        if (response && response.status) {
          setPanicModeActive(true);
          toast.error("Panic Mode activated - you must complete your work to exit");
        }
      }
    } catch (error) {
      console.error("Error activating Panic Mode:", error);
    }
  };

  const endPanicMode = async () => {
    if (!extensionInstalled) return;

    try {
      // Send message to extension
      if ((window as any).sendToFocusLockExtension) {
        const response = await (window as any).sendToFocusLockExtension({
          action: 'endPanicMode'
        });
        
        if (response && response.status) {
          setPanicModeActive(false);
          toast.success("Panic Mode deactivated");
          
          // Exit fullscreen mode
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      }
    } catch (error) {
      console.error("Error ending Panic Mode:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call to submit progress
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if submission meets requirements
      const wordCount = submission.trim().split(/\s+/).length;
      
      if (wordCount < 50) {
        toast.error("Your submission is too short. Please provide more details.");
        setIsSubmitting(false);
        return;
      }
      
      // End panic mode in the extension
      if (extensionInstalled) {
        await endPanicMode();
      }
      
      toast.success("Submission accepted! Exiting Panic Mode");
      
      // Navigate back to schedule
      setTimeout(() => {
        router.push("/schedule");
      }, 1500);
    } catch (error) {
      console.error("Error submitting work:", error);
      toast.error("Failed to submit work");
      setIsSubmitting(false);
    }
  }

  const progressPercentage = (currentWords / requiredWords) * 100

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-black">
      <Toaster position="top-right" />
      
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
          
          {!extensionInstalled && (
            <div className="bg-apple-red/20 p-4 rounded-md flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-apple-red shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-white">Extension Not Detected</h3>
                <p className="text-white/70 text-sm mt-1">
                  The FocusLock extension is not installed. Panic Mode restrictions will not be enforced.
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

