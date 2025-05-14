'use client'

import type React from 'react'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useEffect, useState } from 'react'
import { DashboardHeader } from './header'
import { DashboardSidebar } from './sidebar'

interface DashboardShellProps {
  children: React.ReactNode
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    id?: string
  }
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-white dark:bg-black">
        <DashboardSidebar />

        <div className="flex w-full flex-1 flex-col">
          <DashboardHeader user={user} />

          <SidebarInset className="w-full">
            <main className="relative z-10 w-full flex-1 overflow-auto p-4 lg:p-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
