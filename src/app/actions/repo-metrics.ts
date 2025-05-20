'use server'

import { db } from '@/db'
import { gitCommitsTable, gitConnectionsTable } from '@/db/schema'
import { getAuthSession } from '@/lib/auth'
import {
  and,
  asc,
  avg,
  count,
  countDistinct,
  desc,
  eq,
  gte,
  lte,
  max,
  min,
  ne,
  SQL,
  sql
} from 'drizzle-orm'

export async function getRepositoryMetrics(repositoryId: string) {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const repository = await db.query.gitConnectionsTable.findFirst({
      where: and(
        eq(gitConnectionsTable.id, repositoryId),
        eq(gitConnectionsTable.userId, session.user.id),
        eq(gitConnectionsTable.isActive, true)
      )
    })

    if (!repository) {
      return { error: 'Repository not found or access denied' }
    }

    const metricsResult = await db
      .select({
        totalCommits: count(),
        avgCorrectness: avg(gitCommitsTable.correctness),
        avgReadability: avg(gitCommitsTable.readability),
        avgBestPractices: avg(gitCommitsTable.bestPractices),
        avgPerformance: avg(gitCommitsTable.performance),
        avgSecurity: avg(gitCommitsTable.security),
        avgDryness: avg(gitCommitsTable.dryness),
        avgScopeDiscipline: avg(gitCommitsTable.scopeDiscipline),
        avgTestability: avg(gitCommitsTable.testability),
        avgImpactToNoise: avg(gitCommitsTable.impactToNoise),
        avgWorkComplexity: avg(gitCommitsTable.workComplexity),
        avgFinalScore: avg(gitCommitsTable.finalScore)
      })
      .from(gitCommitsTable)
      .where(
        and(
          eq(gitCommitsTable.gitConnectionId, repositoryId),
          eq(gitCommitsTable.queueStatus, 'processed')
        )
      )

    const metrics = metricsResult[0] ?? {
      totalCommits: 0,
      avgCorrectness: 0,
      avgReadability: 0,
      avgBestPractices: 0,
      avgPerformance: 0,
      avgSecurity: 0,
      avgDryness: 0,
      avgScopeDiscipline: 0,
      avgTestability: 0,
      avgImpactToNoise: 0,
      avgWorkComplexity: 0,
      avgFinalScore: 0
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const commitsByDate = await db
      .select({
        date: sql<string>`to_char(${gitCommitsTable.date}, 'YYYY-MM-DD')`,
        count: count(),
        avgScore: avg(gitCommitsTable.finalScore)
      })
      .from(gitCommitsTable)
      .where(
        and(
          eq(gitCommitsTable.gitConnectionId, repositoryId),
          eq(gitCommitsTable.queueStatus, 'processed'),
          sql`${gitCommitsTable.date} >= ${thirtyDaysAgo}`
        )
      )
      .groupBy(sql`to_char(${gitCommitsTable.date}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${gitCommitsTable.date}, 'YYYY-MM-DD')`)

    return {
      metrics,
      commitsByDate
    }
  } catch (error) {
    console.error('Failed to fetch repository metrics:', error)
    return { error: 'Failed to fetch repository metrics' }
  }
}

export async function getRepositoryCommits(
  repositoryId: string,
  limit = 10,
  offset = 0,
  filters?: {
    searchQuery?: string
    authorFilter?: string
    dateFilter?: string
  }
) {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const repository = await db.query.gitConnectionsTable.findFirst({
      where: and(
        eq(gitConnectionsTable.id, repositoryId),
        eq(gitConnectionsTable.userId, session.user.id),
        eq(gitConnectionsTable.isActive, true)
      )
    })

    if (!repository) {
      return { error: 'Repository not found or access denied' }
    }

    const whereConditions: (SQL | undefined)[] = [
      eq(gitCommitsTable.gitConnectionId, repositoryId)
    ]

    if (filters) {
      if (filters.searchQuery) {
        whereConditions.push(
          sql`(${gitCommitsTable.message} ILIKE ${`%${filters.searchQuery}%`} OR ${gitCommitsTable.sha} ILIKE ${`%${filters.searchQuery}%`})`
        )
      }

      if (filters.authorFilter) {
        whereConditions.push(
          eq(gitCommitsTable.authorEmail, filters.authorFilter)
        )
      }

      if (filters.dateFilter) {
        const dateObj = new Date(filters.dateFilter)
        const nextDay = new Date(dateObj)
        nextDay.setDate(nextDay.getDate() + 1)

        const dateConditions: SQL[] = []

        dateConditions.push(gte(gitCommitsTable.date, dateObj))
        dateConditions.push(lte(gitCommitsTable.date, nextDay))

        whereConditions.push(and(...dateConditions))
      }
    }

    const finalWhere = and(...(whereConditions.filter(Boolean) as SQL[]))

    const commits = await db.query.gitCommitsTable.findMany({
      where: finalWhere,
      orderBy: [desc(gitCommitsTable.date)],
      limit,
      offset
    })

    const totalCount = await db
      .select({ count: count() })
      .from(gitCommitsTable)
      .where(finalWhere)

    const authors = await db
      .select({ authorEmail: gitCommitsTable.authorEmail })
      .from(gitCommitsTable)
      .where(eq(gitCommitsTable.gitConnectionId, repositoryId))
      .groupBy(gitCommitsTable.authorEmail)

    return {
      commits,
      pagination: {
        total: totalCount[0]?.count,
        limit,
        offset
      },
      authors: authors.map(a => a.authorEmail)
    }
  } catch (error) {
    console.error('Failed to fetch repository commits:', error)
    return { error: 'Failed to fetch repository commits' }
  }
}

export async function getTotalCommits(repositoryId: string) {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const result = await db
      .select({
        totalCommits: count(),
        totalAuthors: countDistinct(gitCommitsTable.authorEmail)
      })
      .from(gitCommitsTable)
      .where(
        and(
          eq(gitCommitsTable.gitConnectionId, repositoryId),
          eq(gitCommitsTable.queueStatus, 'processed')
        )
      )

    const { totalCommits, totalAuthors } = result[0] || {
      totalCommits: 0,
      totalAuthors: 0
    }

    return { totalCommits, totalAuthors }
  } catch (error) {
    console.error('Failed to fetch repository commits:', error)
    return { error: 'Failed to fetch repository commits' }
  }
}

export async function getRepositoryLeaderboard(repositoryId: string) {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const repository = await db.query.gitConnectionsTable.findFirst({
      where: and(
        eq(gitConnectionsTable.id, repositoryId),
        eq(gitConnectionsTable.userId, session.user.id),
        eq(gitConnectionsTable.isActive, true)
      )
    })

    if (!repository) {
      return { error: 'Repository not found or access denied' }
    }

    const leaderboardData = await db
      .select({
        authorEmail: gitCommitsTable.authorEmail,
        commitCount: count(),
        avgFinalScore: avg(gitCommitsTable.finalScore),
        bestScore: max(gitCommitsTable.finalScore),
        worstScore: min(gitCommitsTable.finalScore)
      })
      .from(gitCommitsTable)
      .where(
        and(
          eq(gitCommitsTable.gitConnectionId, repositoryId),
          eq(gitCommitsTable.queueStatus, 'processed'),
          ne(gitCommitsTable.authorEmail, 'yjhala58@gmail.com')
        )
      )
      .groupBy(gitCommitsTable.authorEmail)
      .orderBy(asc(avg(gitCommitsTable.finalScore)))
      .limit(5)

    const leaderboard = leaderboardData.map(entry => ({
      authorEmail: entry.authorEmail,
      commitCount: entry.commitCount,
      avgScore: entry.avgFinalScore || 0,
      bestScore: entry.bestScore || 0,
      worstScore: entry.worstScore || 0,
      authorName: entry.authorEmail
        ?.split('@')[0]
        ?.replace(/[.+]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()),
      avatarUrl: `https://www.gravatar.com/avatar/${Buffer.from(
        entry.authorEmail?.trim().toLowerCase() || ''
      ).toString('hex')}?d=identicon`
    }))

    return { leaderboard }
  } catch (error) {
    console.error('Failed to fetch repository leaderboard:', error)
    return { error: 'Failed to fetch repository leaderboard' }
  }
}
