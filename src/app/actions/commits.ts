'use server'

import { db } from '@/db'
import { gitCommitsTable, gitConnectionsTable } from '@/db/schema'
import { getAuthSession } from '@/lib/auth'
import { and, avg, count, desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getCommits(connectionId: string, limit = 10, offset = 0) {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const connection = await db.query.gitConnectionsTable.findFirst({
      where: and(
        eq(gitConnectionsTable.id, connectionId),
        eq(gitConnectionsTable.userId, session.user.id),
        eq(gitConnectionsTable.isActive, true)
      )
    })

    if (!connection) {
      return { error: 'Repository not found or access denied' }
    }

    const commits = await db.query.gitCommitsTable.findMany({
      where: eq(gitCommitsTable.gitConnectionId, connectionId),
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
      .where(eq(gitCommitsTable.gitConnectionId, connectionId))

    return {
      commits,
      pagination: {
        total: totalCount[0]?.count,
        limit,
        offset
      }
    }
  } catch (error) {
    console.error('Failed to fetch commits:', error)
    return { error: 'Failed to fetch commits' }
  }
}

export async function getCommitDetails(commitId: string) {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const commit = await db.query.gitCommitsTable.findFirst({
      where: eq(gitCommitsTable.id, commitId),
      with: {
        gitConnection: true
      }
    })

    if (!commit) {
      return { error: 'Commit not found' }
    }

    const connection = await db.query.gitConnectionsTable.findFirst({
      where: and(
        eq(gitConnectionsTable.id, commit.gitConnectionId),
        eq(gitConnectionsTable.userId, session.user.id)
      )
    })

    if (!connection) {
      return { error: 'Access denied to this commit' }
    }

    return { commit }
  } catch (error) {
    console.error('Failed to fetch commit details:', error)
    return { error: 'Failed to fetch commit details' }
  }
}

export async function getRecentCommits(limit = 5) {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const userConnections = await db.query.gitConnectionsTable.findMany({
      where: and(
        eq(gitConnectionsTable.userId, session.user.id),
        eq(gitConnectionsTable.isActive, true)
      ),
      columns: {
        id: true
      }
    })

    const connectionIds = userConnections.map(conn => conn.id)

    if (connectionIds.length === 0) {
      return { commits: [] }
    }

    const commits = await db.query.gitCommitsTable.findMany({
      where: and(
        eq(gitCommitsTable.queueStatus, 'processed'),
        sql`${gitCommitsTable.gitConnectionId} IN (${connectionIds.join(',')})`
      ),
      orderBy: commits => [desc(commits.date)],
      limit,
      with: {
        gitConnection: true
      }
    })

    return { commits }
  } catch (error) {
    console.error('Failed to fetch recent commits:', error)
    return { error: 'Failed to fetch recent commits' }
  }
}

export async function getDashboardMetrics() {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const userConnections = await db.query.gitConnectionsTable.findMany({
      where: and(
        eq(gitConnectionsTable.userId, session.user.id),
        eq(gitConnectionsTable.isActive, true)
      ),
      columns: {
        id: true
      }
    })

    const connectionIds = userConnections.map(conn => conn.id)

    if (connectionIds.length === 0) {
      return {
        metrics: {
          avgFinalScore: 0,
          avgCorrectness: 0,
          avgReadability: 0,
          avgBestPractices: 0,
          avgPerformance: 0,
          avgSecurity: 0,
          totalCommits: 0
        },
        commitsByDate: []
      }
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
          sql`${gitCommitsTable.gitConnectionId} IN (${connectionIds.join(',')})`
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
          sql`${gitCommitsTable.gitConnectionId} IN (${connectionIds.join(',')})`
        )
      )
      .groupBy(sql`to_char(${gitCommitsTable.date}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${gitCommitsTable.date}, 'YYYY-MM-DD')`)

    return {
      metrics: avgScores[0] || {
        avgFinalScore: 0,
        avgCorrectness: 0,
        avgReadability: 0,
        avgBestPractices: 0,
        avgPerformance: 0,
        avgSecurity: 0,
        totalCommits: 0
      },
      commitsByDate
    }
  } catch (error) {
    console.error('Failed to fetch dashboard metrics:', error)
    return { error: 'Failed to fetch dashboard metrics' }
  }
}

export async function triggerCommitAnalysis(commitId: string) {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const commit = await db.query.gitCommitsTable.findFirst({
      where: eq(gitCommitsTable.id, commitId),
      columns: {
        id: true,
        gitConnectionId: true
      }
    })

    if (!commit) {
      return { error: 'Commit not found' }
    }

    const connection = await db.query.gitConnectionsTable.findFirst({
      where: and(
        eq(gitConnectionsTable.id, commit.gitConnectionId),
        eq(gitConnectionsTable.userId, session.user.id),
        eq(gitConnectionsTable.isActive, true)
      )
    })

    if (!connection) {
      return { error: 'Access denied to this commit' }
    }

    await db
      .update(gitCommitsTable)
      .set({ queueStatus: 'pending' })
      .where(eq(gitCommitsTable.id, commitId))

    revalidatePath('/dashboard')
    revalidatePath('/repositories')
    revalidatePath(`/commits/${commitId}`)

    return { success: true }
  } catch (error) {
    console.error('Failed to trigger commit analysis:', error)
    return { error: 'Failed to trigger commit analysis' }
  }
}
