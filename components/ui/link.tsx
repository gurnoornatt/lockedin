'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CustomLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export default function CustomLink({
  href,
  children,
  className,
  ...props
}: CustomLinkProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CustomLinkProps>) {
  return (
    <Link
      href={href}
      className={cn('transition-opacity', className)}
      {...props}
    >
      {children}
    </Link>
  )
} 