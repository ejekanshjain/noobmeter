'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  BarChart3,
  Bell,
  Code2,
  GitBranch,
  Plus,
  Search,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface HeaderProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function DashboardHeader({ user }: HeaderProps) {
  const { scrollY } = useScroll()
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)']
  )
  const backgroundColorDark = useTransform(
    scrollY,
    [0, 100],
    ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.8)']
  )
  const backdropBlur = useTransform(
    scrollY,
    [0, 100],
    ['blur(0px)', 'blur(8px)']
  )
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 0.1])

  const [showNotifications, setShowNotifications] = useState(false)
  const [showAddRepoDialog, setShowAddRepoDialog] = useState(false)

  return (
    <>
      <motion.header
        style={{
          backdropFilter: backdropBlur,
          borderBottom: `1px solid rgba(0, 0, 0, ${borderOpacity.get()})`
        }}
        className="sticky top-0 z-40 w-full bg-white/0 transition-colors dark:bg-black/0"
      >
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 md:hidden">
              <SidebarTrigger />
              <Link href="/dashboard" className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-black dark:text-white" />
                <span className="text-lg font-medium text-black dark:text-white">
                  NOOBMETER
                </span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden w-full max-w-md md:block">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search repositories, commits..."
                className="h-8 w-full border-gray-200 bg-gray-100 pl-10 text-sm transition-all duration-300 focus-within:w-80 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="hidden items-center gap-2 border-gray-200 md:flex dark:border-gray-700"
              onClick={() => setShowAddRepoDialog(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Connect Repo</span>
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-black dark:bg-white" />
              </Button>

              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 z-50 mt-2 w-80 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="font-medium">Notifications</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4 p-4">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <GitBranch className="h-4 w-4 text-black dark:text-white" />
                      </div>
                      <div>
                        <p className="text-sm">
                          New repository connected: <strong>mobile-app</strong>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <BarChart3 className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm">
                          Your score improved by <strong>0.3 points</strong>{' '}
                          this week!
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Yesterday
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-200 dark:border-gray-700"
                    >
                      View All Notifications
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {user.image ? (
                        <AvatarImage
                          src={user.image || '/placeholder.svg'}
                          alt={user.name || 'User'}
                        />
                      ) : (
                        <AvatarFallback>
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                        {user.email || 'No email'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href="/profile" className="flex w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href="/settings" className="flex w-full">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href="/api/auth/signout" className="flex w-full">
                      Log out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-gray-200 dark:border-gray-700"
              >
                <Link href="/api/auth/signin">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </motion.header>

      <Dialog open={showAddRepoDialog} onOpenChange={setShowAddRepoDialog}>
        <DialogContent className="border border-gray-200 bg-white sm:max-w-[425px] dark:border-gray-700 dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Connect Repository</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
