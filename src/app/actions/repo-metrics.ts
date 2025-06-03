'use server'

import { db } from '@/db'
import { gitCommitsTable, gitConnectionsTable } from '@/db/schema'
import { getAuthSession } from '@/lib/auth'
import {
  calculateUserScore,
  getPaginatedAuthors,
  getRepositoryLeaderboard
} from '@/lib/user-scoring'
import { and, avg, count, countDistinct, desc, eq, gte, sql } from 'drizzle-orm'

export async function getTotalCommits(repositoryId: string) {
  try {
    const result = await db
      .select({
        totalCommits: count(),
        totalAuthors: count(gitCommitsTable.authorEmail)
      })
      .from(gitCommitsTable)
      .where(
        and(
          eq(gitCommitsTable.gitConnectionId, repositoryId),
          eq(gitCommitsTable.queueStatus, 'processed')
        )
      )

    return result[0]
  } catch (error) {
    console.error('Failed to get total commits:', error)
    return { totalCommits: 0, totalAuthors: 0 }
  }
}

export async function getRepositoryLeaderboardAction(repositoryId: string) {
  try {
    const leaderboard = await getRepositoryLeaderboard(repositoryId)

    return {
      leaderboard: leaderboard.map((entry, index) => ({
        authorEmail: entry.authorEmail,
        avgScore: entry.weightedScore,
        rank: index + 1,
        commitCount: entry.totalCommits,
        bestScore: entry.bestScore,
        worstScore: entry.worstScore,
        commitsByCategory: entry.commitsByCategory,
        commitsByDomain: entry.commitsByDomain,
        commitsByImpact: entry.commitsByImpact,
        contributionPoints: entry.contributionPoints,
        categoryPoints: entry.categoryPoints,
        averageQualityMetrics: entry.averageQualityMetrics,
        logarithmicAdjustment: entry.logarithmicAdjustment
      }))
    }
  } catch (error) {
    console.error('Failed to get repository leaderboard:', error)
    return { error: 'Failed to get repository leaderboard', leaderboard: [] }
  }
}

export async function getAuthorStats(
  authorEmail: string,
  repositoryId?: string
) {
  try {
    const stats = await calculateUserScore(authorEmail, repositoryId)

    return {
      authorEmail: stats.authorEmail,
      avgScore: stats.weightedScore,
      totalCommits: stats.totalCommits,
      commitsByCategory: stats.commitsByCategory,
      commitsByDomain: stats.commitsByDomain,
      commitsByImpact: stats.commitsByImpact,
      contributionPoints: stats.contributionPoints,
      categoryPoints: stats.categoryPoints,
      bestScore: stats.bestScore,
      worstScore: stats.worstScore,
      averageQualityMetrics: stats.averageQualityMetrics,
      logarithmicAdjustment: stats.logarithmicAdjustment
    }
  } catch (error) {
    console.error('Failed to get author stats:', error)
    return { error: 'Failed to get author stats' }
  }
}

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

    // Get basic metrics using the correct schema fields
    const metricsResult = await db
      .select({
        totalCommits: count(),
        avgCorrectness: avg(gitCommitsTable.correctness),
        avgBestPractices: avg(gitCommitsTable.bestPractices),
        avgReadability: avg(gitCommitsTable.readability),
        avgPerformance: avg(gitCommitsTable.performance),
        avgSecurity: avg(gitCommitsTable.security),
        avgTechnicalQuality: avg(gitCommitsTable.technicalQuality),
        avgFinalScore: avg(gitCommitsTable.finalScore),
        avgContributionPoints: avg(gitCommitsTable.contributionPoints)
      })
      .from(gitCommitsTable)
      .where(
        and(
          eq(gitCommitsTable.gitConnectionId, repositoryId),
          eq(gitCommitsTable.queueStatus, 'processed')
        )
      )

    const totalAuthorsResult = await db
      .select({ totalAuthors: countDistinct(gitCommitsTable.authorEmail) })
      .from(gitCommitsTable)
      .where(
        and(
          eq(gitCommitsTable.gitConnectionId, repositoryId),
          eq(gitCommitsTable.queueStatus, 'processed')
        )
      )

    const totalAuthors = totalAuthorsResult[0]?.totalAuthors || 0

    // Get category distribution
    const categoryDistribution = await db
      .select({
        category: gitCommitsTable.category,
        count: count(),
        avgScore: avg(gitCommitsTable.finalScore)
      })
      .from(gitCommitsTable)
      .where(
        and(
          eq(gitCommitsTable.gitConnectionId, repositoryId),
          eq(gitCommitsTable.queueStatus, 'processed')
        )
      )
      .groupBy(gitCommitsTable.category)

    // Get domain distribution
    const domainDistribution = await db
      .select({
        domain: gitCommitsTable.domain,
        count: count(),
        avgScore: avg(gitCommitsTable.finalScore)
      })
      .from(gitCommitsTable)
      .where(
        and(
          eq(gitCommitsTable.gitConnectionId, repositoryId),
          eq(gitCommitsTable.queueStatus, 'processed')
        )
      )
      .groupBy(gitCommitsTable.domain)

    // Get impact distribution
    const impactDistribution = await db
      .select({
        impact: gitCommitsTable.impact,
        count: count(),
        avgScore: avg(gitCommitsTable.finalScore)
      })
      .from(gitCommitsTable)
      .where(
        and(
          eq(gitCommitsTable.gitConnectionId, repositoryId),
          eq(gitCommitsTable.queueStatus, 'processed')
        )
      )
      .groupBy(gitCommitsTable.impact)

    const metrics = {
      totalCommits: metricsResult[0]?.totalCommits || 0,
      avgCorrectness: Number(metricsResult[0]?.avgCorrectness || 0),
      avgBestPractices: Number(metricsResult[0]?.avgBestPractices || 0),
      avgReadability: Number(metricsResult[0]?.avgReadability || 0),
      avgPerformance: Number(metricsResult[0]?.avgPerformance || 0),
      avgSecurity: Number(metricsResult[0]?.avgSecurity || 0),
      avgTechnicalQuality: Number(metricsResult[0]?.avgTechnicalQuality || 0),
      avgFinalScore: Number(metricsResult[0]?.avgFinalScore || 0),
      avgContributionPoints: Number(
        metricsResult[0]?.avgContributionPoints || 0
      ),
      totalAuthors,
      categoryDistribution: categoryDistribution.map(item => ({
        category: item.category,
        count: item.count,
        avgScore: Number(item.avgScore || 0)
      })),
      domainDistribution: domainDistribution.map(item => ({
        domain: item.domain,
        count: item.count,
        avgScore: Number(item.avgScore || 0)
      })),
      impactDistribution: impactDistribution.map(item => ({
        impact: item.impact,
        count: item.count,
        avgScore: Number(item.avgScore || 0)
      }))
    }

    // Get commits by date for the last 30 days
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
          gte(gitCommitsTable.date, thirtyDaysAgo)
        )
      )
      .groupBy(sql`to_char(${gitCommitsTable.date}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${gitCommitsTable.date}, 'YYYY-MM-DD')`)

    return {
      metrics,
      commitsByDate: commitsByDate.map(item => ({
        date: item.date,
        count: item.count,
        avgScore: Number(item.avgScore || 0)
      }))
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
    categoryFilter?: string
    domainFilter?: string
    impactFilter?: string
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

    const whereConditions = [
      eq(gitCommitsTable.gitConnectionId, repositoryId),
      eq(gitCommitsTable.queueStatus, 'processed')
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

      if (filters.categoryFilter) {
        whereConditions.push(
          eq(gitCommitsTable.category, filters.categoryFilter as any)
        )
      }

      if (filters.domainFilter) {
        whereConditions.push(
          eq(gitCommitsTable.domain, filters.domainFilter as any)
        )
      }

      if (filters.impactFilter) {
        whereConditions.push(
          eq(gitCommitsTable.impact, filters.impactFilter as any)
        )
      }

      if (filters.dateFilter) {
        const dateObj = new Date(filters.dateFilter)
        const nextDay = new Date(dateObj)
        nextDay.setDate(nextDay.getDate() + 1)
        whereConditions.push(gte(gitCommitsTable.date, dateObj))
        whereConditions.push(sql`${gitCommitsTable.date} < ${nextDay}`)
      }
    }

    const finalWhere = and(...whereConditions)

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
        total: totalCount[0]?.count || 0,
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

// Export the getPaginatedAuthors function
export { getPaginatedAuthors }
