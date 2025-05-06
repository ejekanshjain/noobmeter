'use client'

import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import { FC } from 'react'

export const Login: FC = () => {
  return (
    <div>
      <Button
        onClick={() => {
          signIn('github', {
            callbackUrl: `/dashboard`
          })
        }}
      >
        Continue with GitHub
      </Button>
    </div>
  )
}
