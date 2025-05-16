'use server'

import { db } from '@/db'
import { gitCommitsTable, gitConnectionsTable } from '@/db/schema'
import { getAuthSession } from '@/lib/auth'
import { and, avg, count, desc, eq, max, min, sql } from 'drizzle-orm'

const calculateFinalScore = (scores: Record<string, any>): number => {
  const qualityMetrics = [
    scores.correctness || 0,
    scores.readability || 0,
    scores.bestPractices || 0,
    scores.performance || 0,
    scores.security || 0,
    scores.dryness || 0,
    scores.scopeDiscipline || 0,
    scores.testability || 0,
    scores.impactToNoise || 0
  ]
  const avgQuality =
    qualityMetrics.length > 0
      ? qualityMetrics.reduce((sum, score) => sum + score, 0) /
        qualityMetrics.length
      : 0

  const workWeight = 0.4
  const qualityWeight = 0.6

  const scaledWorkComplexity =
    Math.pow((scores.workComplexity || 0) / 10, 1.5) * 10

  const rawScore =
    (avgQuality * qualityWeight + scaledWorkComplexity * workWeight) * 10

  return Math.max(1, Math.min(100, Math.round(rawScore)))
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

    // Get metrics for this repository
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

    // Calculate the final score using our formula
    const metrics = metricsResult[0] || {
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

    // Calculate the final score using our formula if we have data
    if (metrics.totalCommits > 0) {
      metrics.avgFinalScore = calculateFinalScore({
        correctness: metrics.avgCorrectness,
        readability: metrics.avgReadability,
        bestPractices: metrics.avgBestPractices,
        performance: metrics.avgPerformance,
        security: metrics.avgSecurity,
        dryness: metrics.avgDryness,
        scopeDiscipline: metrics.avgScopeDiscipline,
        testability: metrics.avgTestability,
        impactToNoise: metrics.avgImpactToNoise,
        workComplexity: metrics.avgWorkComplexity
      })
    }

    // Get commit metrics by date (last 30 days)
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
        bestScore: max(gitCommitsTable.finalScore),
        worstScore: min(gitCommitsTable.finalScore)
      })
      .from(gitCommitsTable)
      .where(
        and(
          eq(gitCommitsTable.gitConnectionId, repositoryId),
          eq(gitCommitsTable.queueStatus, 'processed')
        )
      )
      .groupBy(gitCommitsTable.authorEmail)
      .orderBy(desc(count()))

    const leaderboard = leaderboardData.map(entry => {
      const metrics = {
        correctness: entry.avgCorrectness || 0,
        readability: entry.avgReadability || 0,
        bestPractices: entry.avgBestPractices || 0,
        performance: entry.avgPerformance || 0,
        security: entry.avgSecurity || 0,
        dryness: entry.avgDryness || 0,
        scopeDiscipline: entry.avgScopeDiscipline || 0,
        testability: entry.avgTestability || 0,
        impactToNoise: entry.avgImpactToNoise || 0,
        workComplexity: entry.avgWorkComplexity || 0
      }

      const avgScore = calculateFinalScore(metrics)
      return {
        authorEmail: entry.authorEmail,
        commitCount: entry.commitCount,
        avgScore,
        bestScore: entry.bestScore || 0,
        worstScore: entry.worstScore || 0,
        authorName: entry.authorEmail
          .split('@')[0]
          ?.replace(/[.+]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase()),
        avatarUrl: `https://www.gravatar.com/avatar/${Buffer.from(entry.authorEmail.trim().toLowerCase()).toString('hex')}?d=identicon`
      }
    })

    leaderboard.sort((a, b) => a.avgScore - b.avgScore)

    return { leaderboard }
  } catch (error) {
    console.error('Failed to fetch repository leaderboard:', error)
    return { error: 'Failed to fetch repository leaderboard' }
  }
}
