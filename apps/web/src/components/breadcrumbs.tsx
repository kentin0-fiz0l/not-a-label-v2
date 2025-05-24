"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname()
  
  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = items || generateBreadcrumbs(pathname)

  if (breadcrumbItems.length <= 1) {
    return null
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}>
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          {item.href && index < breadcrumbItems.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  // Skip the first segment if it's 'dashboard'
  const startIndex = segments[0] === 'dashboard' ? 1 : 0

  for (let i = startIndex; i < segments.length; i++) {
    const segment = segments[i]
    const href = i < segments.length - 1 ? `/${segments.slice(0, i + 1).join('/')}` : undefined
    
    breadcrumbs.push({
      label: formatSegment(segment),
      href
    })
  }

  return breadcrumbs
}

function formatSegment(segment: string): string {
  // Convert kebab-case to Title Case
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}