import { getGitConnection } from '@/app/actions/git-connections'
import { DashboardShell } from '@/components/Dashboard/shell'
import { RepositoryOverview } from '@/components/Repository/overview'
import { Skeleton } from '@/components/ui/skeleton'
import { getAuthSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

export default async function RepositoryPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const p = await params
  const session = await getAuthSession()

  if (!session?.user) {
    return notFound()
  }

  const { connection, error } = await getGitConnection(p.id)

  if (error || !connection) {
    return notFound()
  }

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
      <Suspense fallback={<RepositorySkeleton />}>
        <RepositoryOverview repositoryId={p.id} repository={connection} />
      </Suspense>
    </DashboardShell>
  )
}

function RepositorySkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
      </div>

      <Skeleton className="h-[400px] rounded-lg" />
    </div>
  )
}
