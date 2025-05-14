'use server'

import { db } from '@/db'
import { gitCommitsTable, gitConnectionsTable } from '@/db/schema'
import { getAuthSession } from '@/lib/auth'
import { and, avg, count, desc, eq, sql } from 'drizzle-orm'

export async function getRepositoryMetrics(repositoryId: string) {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const connection = await db.query.gitConnectionsTable.findFirst({
      where: and(
        eq(gitConnectionsTable.id, repositoryId),
        eq(gitConnectionsTable.userId, session.user.id),
        eq(gitConnectionsTable.isActive, true)
      )
    })

    if (!connection) {
      return { error: 'Repository not found or access denied' }
    }

    const avgScores = await db
      .select({
        avgFinalScore: avg(gitCommitsTable.finalScore),
        avgCorrectness: avg(gitCommitsTable.correctness),
        avgReadability: avg(gitCommitsTable.readability),
        avgBestPractices: avg(gitCommitsTable.bestPractices),
        avgPerformance: avg(gitCommitsTable.performance),
        avgSecurity: avg(gitCommitsTable.security),
        totalCommits: count()
      })
      .from(gitCommitsTable)
      .where(
        and(
          eq(gitCommitsTable.queueStatus, 'processed'),
          eq(gitCommitsTable.gitConnectionId, repositoryId)
        )
      )

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const commitsByDate = await db
      .select({
        date: sql<string>`to_char(${gitCommitsTable.date}, 'YYYY-MM-DD')`,
        count: count(),
        avgScore: avg(gitCommitsTable.finalScore)
      })
      .from(gitCommitsTable)
      .where(
        and(
          eq(gitCommitsTable.queueStatus, 'processed'),
          sql`${gitCommitsTable.date} >= ${sevenDaysAgo}`,
          eq(gitCommitsTable.gitConnectionId, repositoryId)
        )
      )
      .groupBy(sql`to_char(${gitCommitsTable.date}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${gitCommitsTable.date}, 'YYYY-MM-DD')`)

    return {
      metrics: {
        ...avgScores[0],
        commitsByDate
      }
    }
  } catch (error) {
    console.error('Failed to fetch repository metrics:', error)
    return { error: 'Failed to fetch repository metrics' }
  }
}

export async function getRepositoryCommits(
  repositoryId: string,
  limit = 10,
  offset = 0
) {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const connection = await db.query.gitConnectionsTable.findFirst({
      where: and(
        eq(gitConnectionsTable.id, repositoryId),
        eq(gitConnectionsTable.userId, session.user.id),
        eq(gitConnectionsTable.isActive, true)
      )
    })

    if (!connection) {
      return { error: 'Repository not found or access denied' }
    }

    const commits = await db.query.gitCommitsTable.findMany({
      where: eq(gitCommitsTable.gitConnectionId, repositoryId),
      orderBy: commits => [desc(commits.date)],
      limit,
      offset,
      with: {
        gitConnection: true
      }
    })

    const totalCount = await db
      .select({ count: count() })
      .from(gitCommitsTable)
      .where(eq(gitCommitsTable.gitConnectionId, repositoryId))

    return {
      commits,
      pagination: {
        total: totalCount[0]?.count,
        limit,
        offset
      }
    }
  } catch (error) {
    console.error('Failed to fetch repository commits:', error)
    return { error: 'Failed to fetch repository commits' }
  }
}
