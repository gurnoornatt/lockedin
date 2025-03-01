'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TabLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  isActive?: boolean
}

/**
 * TabLink component for navigation between tabs/steps within the same major page
 * This prevents full page transitions when navigating between tabs
 */
export default function TabLink({
  href,
  children,
  className,
  isActive = false,
  ...props
}: TabLinkProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof TabLinkProps>) {
  return (
    <Link
      href={href}
      className={cn(className, isActive && 'bg-gray-900 text-white')}
      {...props}
    >
      {children}
    </Link>
  )
} 