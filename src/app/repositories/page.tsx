import { DashboardShell } from '@/components/Dashboard/shell'
import { RepositoriesList } from '@/components/Repositories/list'
import { Skeleton } from '@/components/ui/skeleton'
import { getAuthSession } from '@/lib/auth'
import { Suspense } from 'react'

export default async function RepositoriesPage() {
  const session = await getAuthSession()

  return (
    <DashboardShell
      user={
        session?.user
          ? {
              name: session.user.name || 'User',
              email: session.user.email || 'user@example.com',
              image: session.user.image || undefined
            }
          : undefined
      }
    >
      <Suspense fallback={<RepositoriesSkeleton />}>
        <RepositoriesList />
      </Suspense>
    </DashboardShell>
  )
}

function RepositoriesSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
      </div>
    </div>
  )
}
