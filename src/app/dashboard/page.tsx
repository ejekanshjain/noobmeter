import { RepositoriesDashboard } from '@/components/Dashboard/content'
import { DashboardShell } from '@/components/Dashboard/shell'
import { getAuthSession } from '@/lib/auth'
import { Suspense } from 'react'

export default async function DashboardPage() {
  const session = await getAuthSession()

  return (
    <DashboardShell
      user={
        session?.user
          ? {
              name: session.user.name || null,
              email: session.user.email || null,
              image: session.user.image || null
            }
          : undefined
      }
    >
      <Suspense fallback={<></>}>
        <RepositoriesDashboard />
      </Suspense>
    </DashboardShell>
  )
}
