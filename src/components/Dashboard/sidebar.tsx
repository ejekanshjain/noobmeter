'use client'

import type React from 'react'

import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { cn } from '@/lib/cn'
import {
  Award,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Code2,
  GitBranch,
  History,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Users,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: number | string
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    title: 'Repositories',
    href: '/repositories',
    icon: <GitBranch className="h-5 w-5" />
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    title: 'History',
    href: '/history',
    icon: <History className="h-5 w-5" />
  }
]

const secondaryNavItems: NavItem[] = [
  {
    title: 'Team',
    href: '/team',
    icon: <Users className="h-5 w-5" />
  },
  {
    title: 'Achievements',
    href: '/achievements',
    icon: <Award className="h-5 w-5" />,
    badge: 'New'
  },
  {
    title: 'Insights',
    href: '/insights',
    icon: <Lightbulb className="h-5 w-5" />
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />
  }
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-black dark:text-white" />
            <span
              className={cn(
                'text-lg font-medium transition-opacity duration-200',
                state === 'collapsed' && 'opacity-0'
              )}
            >
              NOOBMETER
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-7 w-7 rounded-full"
          >
            {state === 'expanded' ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-3 py-2">
          <h3
            className={cn(
              'mb-1 px-2 text-xs font-medium text-gray-500 dark:text-gray-400',
              state === 'collapsed' && 'opacity-0'
            )}
          >
            MAIN
          </h3>
          <SidebarMenu>
            {mainNavItems.map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.title}
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-100 px-1 text-xs dark:bg-gray-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        <div className="mt-2 px-3 py-2">
          <h3
            className={cn(
              'mb-1 px-2 text-xs font-medium text-gray-500 dark:text-gray-400',
              state === 'collapsed' && 'opacity-0'
            )}
          >
            TOOLS
          </h3>
          <SidebarMenu>
            {secondaryNavItems.map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.title}
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-100 px-1 text-xs dark:bg-gray-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-3 dark:border-gray-700">
        <div
          className={cn(
            'rounded-lg bg-gray-100 p-3 transition-opacity duration-200 dark:bg-gray-800',
            state === 'collapsed' && 'opacity-0'
          )}
        >
          <div className="mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-black dark:text-white" />
            <h4 className="text-sm font-medium">Upgrade to Pro</h4>
          </div>
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Get advanced analytics and unlimited repositories
          </p>
          <Button
            size="sm"
            className="w-full bg-black text-white dark:bg-white dark:text-black"
          >
            Upgrade
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
