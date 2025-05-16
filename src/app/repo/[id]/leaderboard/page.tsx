import { getGitConnection } from '@/app/actions/git-connections'
import { DashboardShell } from '@/components/Dashboard/shell'
import { Leaderboard } from '@/components/Repository/leaderboard'
import { Skeleton } from '@/components/ui/skeleton'
import { getAuthSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

export default async function LeaderboardPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getAuthSession()

  if (!session?.user) {
    return notFound()
  }

  const p = await params

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
      <Suspense fallback={<LeaderboardSkeleton />}>
        <Leaderboard repositoryId={p.id} repository={connection} />
      </Suspense>
    </DashboardShell>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <Skeleton className="h-[500px] rounded-lg" />
    </div>
  )
}
