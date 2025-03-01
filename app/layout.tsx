import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Fira_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import PageTransition from "@/components/page-transition"
import PageLoadingIndicator from "@/components/ui/page-loading"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Fira_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "FocusLock",
  description: "Stay focused and on track with your assignments",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn("min-h-screen bg-black font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <PageLoadingIndicator />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}

