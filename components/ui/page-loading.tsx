'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function PageLoadingIndicator() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    setIsLoading(true)
    
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [pathname])
  
  if (!isLoading) return null
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent overflow-hidden">
      <div 
        className="h-full bg-blue-500"
        style={{
          width: '30%',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      />
    </div>
  )
} 