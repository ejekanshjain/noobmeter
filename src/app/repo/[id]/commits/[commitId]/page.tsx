import { getCommitDetails } from '@/app/actions/commits'
import { CommitDetails } from '@/components/Dashboard/commit-details'
import { DashboardShell } from '@/components/Dashboard/shell'

import { Skeleton } from '@/components/ui/skeleton'
import { getAuthSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

export default async function CommitPage({
  params
}: {
  params: Promise<{ commitId: string }>
}) {
  const p = await params
  const session = await getAuthSession()

  if (!session?.user) {
    return notFound()
  }

  const { commit, error } = await getCommitDetails(p.commitId)

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
      <Suspense fallback={<CommitDetailsSkeleton />}>
        <CommitDetails commit={commit} />
      </Suspense>
    </DashboardShell>
  )
}

function CommitDetailsSkeleton() {
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
