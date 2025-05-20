'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Code2 } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LoginModal } from './login-modal'

export function NavBar() {
  const { scrollY } = useScroll()
  const { data: session } = useSession()
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = theme === 'system' ? systemTheme : theme

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    [
      'rgba(0, 0, 0, 0)',
      currentTheme === 'dark'
        ? 'rgba(17, 24, 39, 0.8)'
        : 'rgba(255, 255, 255, 0.8)'
    ]
  )

  const backdropBlur = useTransform(
    scrollY,
    [0, 100],
    ['blur(0px)', 'blur(8px)']
  )

  const borderOpacity = useTransform(scrollY, [0, 100], [0, 0.1])
  const [showLoginModal, setShowLoginModal] = useState(false)

  if (!mounted) return null

  return (
    <>
      <motion.div
        className="fixed top-0 right-0 left-0 z-50 py-4"
        style={{
          backgroundColor,
          backdropFilter: backdropBlur,
          borderBottom: `1px solid rgba(150, 150, 150, ${borderOpacity.get()})`
        }}
      >
        <div className="container mx-auto flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="text-primary h-6 w-6" />
            <span className="text-primary text-xl font-bold">NOOBMETER</span>
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {session ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border border-[#374151] hover:border-[#00e6ff] hover:bg-[#00e6ff10]"
                >
                  <Link href="/repositories">Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="border-[#9f1239] text-[#f43f5e] hover:bg-[#9f123910]"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLoginModal(true)}
                className="border border-[#374151] hover:border-[#00e6ff] hover:bg-[#00e6ff10]"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </motion.div>
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </>
  )
}
