import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">FocusLock</h1>
        <p className="text-lg text-white/80">Stay focused. Get things done.</p>

        <div className="flex flex-col space-y-4 pt-6">
          <Link href="/add-assignment">
            <Button className="w-full bg-apple-blue hover:bg-apple-blue/90 text-white">Add Assignment</Button>
          </Link>

          <Link href="/schedule">
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              View Schedule
            </Button>
          </Link>

          <Link href="/work-mode">
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              Enter Work Mode
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

