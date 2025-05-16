'use client'

import type React from 'react'

import { Button } from '@/components/ui/button'
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
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
  GitCommit,
  LayoutDashboard,
  Settings,
  Users
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

export function DashboardSidebar() {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const [mounted, setMounted] = useState(false)

  // Check if we're in a repository context
  const repoId = pathname.includes('/repo/')
    ? pathname.split('/repo/')[1]?.split('/')[0]
    : null

  // Define navigation items based on context
  const mainNavItems: NavItem[] = repoId
    ? [
        {
          title: 'Overview',
          href: `/repo/${repoId}`,
          icon: <LayoutDashboard className="h-5 w-5" />
        },
        {
          title: 'Commits',
          href: `/repo/${repoId}/commits`,
          icon: <GitCommit className="h-5 w-5" />
        },
        {
          title: 'Analytics',
          href: `/repo/${repoId}/analytics`,
          icon: <BarChart3 className="h-5 w-5" />
        },
        {
          title: 'Leaderboard',
          href: `/repo/${repoId}/leaderboard`,
          icon: <Award className="h-5 w-5" />,
          badge: 'New'
        }
      ]
    : [
        {
          title: 'Repositories',
          href: '/repositories',
          icon: <GitBranch className="h-5 w-5" />
        },
        {
          title: 'Settings',
          href: '/settings',
          icon: <Settings className="h-5 w-5" />
        }
      ]

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <ShadcnSidebar>
      <SidebarHeader className="">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-teal-500/20 blur-md dark:bg-teal-400/20"></div>
              <Code2 className="relative h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <span
              className={cn(
                'bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-xl font-bold text-transparent transition-opacity duration-200 dark:from-teal-400 dark:to-cyan-400',
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
            className="h-7 w-7 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/30"
          >
            {state === 'expanded' ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="">
        <div className="px-3 py-2">
          <h3
            className={cn(
              'mb-1 px-2 text-xs font-medium text-gray-500 dark:text-gray-400',
              state === 'collapsed' && 'opacity-0'
            )}
          >
            {repoId ? 'REPOSITORY' : 'MAIN'}
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
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-100 px-1 text-xs text-teal-700 dark:bg-teal-900/50 dark:text-teal-400">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {repoId && (
          <div className="mt-2 px-3 py-2">
            <h3
              className={cn(
                'mb-1 px-2 text-xs font-medium text-gray-500 dark:text-gray-400',
                state === 'collapsed' && 'opacity-0'
              )}
            >
              ACTIONS
            </h3>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Back to Repositories"
                  className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/60"
                >
                  <Link
                    href="/repositories"
                    className="flex items-center gap-2"
                  >
                    <GitBranch className="h-5 w-5" />
                    <span>All Repositories</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Team"
                  className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/60"
                >
                  <Link
                    href={`/repo/${repoId}/team`}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-5 w-5" />
                    <span>Team</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Settings"
                  className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/60"
                >
                  <Link
                    href={`/repo/${repoId}/settings`}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        )}
      </SidebarContent>
    </ShadcnSidebar>
  )
}
