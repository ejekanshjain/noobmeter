import { db } from '@/db'
import {
  authVerificationTokensTable,
  sessionsTable,
  userOAuthAccountsTable,
  usersTable
} from '@/db/schema'
import { env } from '@/env.mjs'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { InferSelectModel } from 'drizzle-orm'
import { DefaultSession, getServerSession, NextAuthOptions } from 'next-auth'
import { Adapter } from 'next-auth/adapters'
import GitHub from 'next-auth/providers/github'
import { cache } from 'react'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
    } & DefaultSession['user']
  }

  interface User extends InferSelectModel<typeof usersTable> {}
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
    signOut: '/'
  },
  callbacks: {
    async session({ session, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id
        }
      }
    },
    async signIn({ user }) {
      if (user.createdAt && !user.isActive) {
        return false
      }

      return true
    }
  },
  adapter: DrizzleAdapter(db, {
    usersTable: usersTable,
    accountsTable: userOAuthAccountsTable,
    sessionsTable: sessionsTable,
    verificationTokensTable: authVerificationTokensTable
  }) as Adapter,
  providers: [
    GitHub({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true
    })
  ]
}

export const getAuthSession = cache(() => getServerSession(authOptions))
