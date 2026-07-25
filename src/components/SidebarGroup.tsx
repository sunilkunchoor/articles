"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/collapsible"

interface SidebarGroupProps {
  title: string
  href?: string
  hasHref?: boolean
  isActive: boolean
  children: React.ReactNode
}

export default function SidebarGroup({
  title,
  href,
  hasHref,
  isActive,
  children
}: SidebarGroupProps) {
  const [isOpen, setIsOpen] = useState(isActive)

  // Sync state if isActive prop changes from outside (e.g., URL navigation)
  useEffect(() => {
    if (isActive) {
      setIsOpen(true)
    }
  }, [isActive])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1.5 pt-2">
      <div className="flex items-center px-1 mb-1.5">
        <CollapsibleTrigger className="text-slate-500 hover:text-white p-0.5 rounded transition-colors mr-1 flex items-center justify-center">
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
        </CollapsibleTrigger>
        {hasHref ? (
          <Link
            href={href!}
            className={`text-xs uppercase tracking-wider font-bold transition-colors flex-1 truncate ${
              isActive
                ? 'text-primary shadow-[0_0_10px_rgba(125,249,255,0.05)]'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            {title}
          </Link>
        ) : (
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold flex-1 truncate">
            {title}
          </span>
        )}
      </div>
      <CollapsibleContent className="space-y-1 pl-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
