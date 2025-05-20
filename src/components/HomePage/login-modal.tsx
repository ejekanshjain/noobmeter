'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Github, Gitlab, Loader2 } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { Dialog, DialogContent } from '../ui/dialog'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()

  const handleLogin = async (method: 'github' | 'gitlab') => {
    setIsLoading(true)
    await signIn(method, {
      callbackUrl: `/repositories`
    })
  }

  const handleLogout = async () => {
    setIsLoading(true)
    await signOut({ callbackUrl: '/' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#00e6ff20] bg-[#0f172a]/80 text-[#f8fafc] backdrop-blur-md sm:max-w-md">
        <div className="flex flex-col items-center justify-center space-y-6 p-4">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-bold">
              <span className="bg-gradient-to-r from-[#00e6ff] via-[#00ccb4] to-[#00aa98] bg-clip-text text-transparent">
                NOOBMETER
              </span>
            </h2>
            <p className="text-sm text-[#94a3b8]">
              Connect your GitHub account to analyze your code and measure your
              noobness.
            </p>
          </div>

          <div className="w-full space-y-4">
            {!session ? (
              <>
                <Button
                  className="group w-full bg-gradient-to-r from-[#00e6ff] to-[#00ccb4] transition-all duration-500 hover:from-[#00ccb4] hover:to-[#00e6ff]"
                  onClick={() => handleLogin('github')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Github className="mr-2 h-4 w-4" />
                  )}
                  Continue with GitHub
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#00e6ff20]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0f172a] px-2 text-[#94a3b8]">Or</span>
                  </div>
                </div>

                <Button
                  className="group w-full bg-gradient-to-r from-[#00e6ff] to-[#00ccb4] transition-all duration-500 hover:from-[#00ccb4] hover:to-[#00e6ff]"
                  onClick={() => handleLogin('gitlab')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Gitlab className="mr-2 h-4 w-4" />
                  )}
                  Continue with GitLab
                </Button>
              </>
            ) : (
              <>
                <div className="mb-4 text-center">
                  <p className="text-lg font-medium">
                    Welcome back, {session.user?.name || 'User'}!
                  </p>
                  <p className="text-sm text-[#94a3b8]">
                    You&apos;re already logged in
                  </p>
                </div>

                <Button
                  className="group w-full bg-gradient-to-r from-[#00e6ff] to-[#00ccb4] transition-all duration-500 hover:from-[#00ccb4] hover:to-[#00e6ff]"
                  asChild
                >
                  <Link href="/repositories">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full border border-gray-700 hover:border-[#00e6ff]"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
