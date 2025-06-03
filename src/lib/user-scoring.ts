'use server'

import { db } from '@/db'
import { gitCommitsTable } from '@/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import {
  applyDiminishingReturns,
  calculateLogarithmicAdjustment,
  type CommitCategory
} from './commit-classification'

export interface UserScoreSummary {
  authorEmail: string
  rawScore: number
  weightedScore: number
  totalCommits: number
  commitsByCategory: Record<CommitCategory, number>
  commitsByDomain: Record<string, number>
  commitsByImpact: Record<string, number>
  contributionPoints: number
  categoryPoints: Record<CommitCategory, number>
  bestScore: number
  worstScore: number
  logarithmicAdjustment: number
  averageQualityMetrics: {
    correctness: number
    bestPractices: number
    readability: number
    performance: number
    security: number
    technicalQuality: number
  }
}

/**
 * Calculate a user's comprehensive score based on their commit history
 */
export async function calculateUserScore(
  authorEmail: string,
  gitConnectionId?: string
): Promise<UserScoreSummary> {
  // Query to get all processed commits for this user
  const query = gitConnectionId
    ? and(
        eq(gitCommitsTable.authorEmail, authorEmail),
        eq(gitCommitsTable.gitConnectionId, gitConnectionId),
        eq(gitCommitsTable.queueStatus, 'processed')
      )
    : and(
        eq(gitCommitsTable.authorEmail, authorEmail),
        eq(gitCommitsTable.queueStatus, 'processed')
      )

  const commits = await db
    .select({
      id: gitCommitsTable.id,
      finalScore: gitCommitsTable.finalScore,
      category: gitCommitsTable.category,
      domain: gitCommitsTable.domain,
      impact: gitCommitsTable.impact,
      contributionPoints: gitCommitsTable.contributionPoints,
      correctness: gitCommitsTable.correctness,
      bestPractices: gitCommitsTable.bestPractices,
      readability: gitCommitsTable.readability,
      performance: gitCommitsTable.performance,
      security: gitCommitsTable.security,
      technicalQuality: gitCommitsTable.technicalQuality
    })
    .from(gitCommitsTable)
    .where(query)

  if (!commits.length) {
    return {
      authorEmail,
      rawScore: 0,
      weightedScore: 0,
      totalCommits: 0,
      commitsByCategory: {
        trivial: 0,
        minor: 0,
        standard: 0,
        significant: 0,
        major: 0,
        exceptional: 0
      },
      commitsByDomain: {},
      commitsByImpact: {},
      contributionPoints: 0,
      categoryPoints: {
        trivial: 0,
        minor: 0,
        standard: 0,
        significant: 0,
        major: 0,
        exceptional: 0
      },
      bestScore: 0,
      worstScore: 0,
      logarithmicAdjustment: 1.0,
      averageQualityMetrics: {
        correctness: 0,
        bestPractices: 0,
        readability: 0,
        performance: 0,
        security: 0,
        technicalQuality: 0
      }
    }
  }

  // Group commits by category
  const commitsByCategory: Record<CommitCategory, number> = {
    trivial: 0,
    minor: 0,
    standard: 0,
    significant: 0,
    major: 0,
    exceptional: 0
  }

  // Group commits by domain and impact
  const commitsByDomain: Record<string, number> = {}
  const commitsByImpact: Record<string, number> = {}

  // Group contribution points by category
  const pointsByCategory: Record<CommitCategory, number[]> = {
    trivial: [],
    minor: [],
    standard: [],
    significant: [],
    major: [],
    exceptional: []
  }

  // Calculate raw score and collect data for weighted score
  let totalScore = 0
  let bestScore = 0
  let worstScore = 100

  // Quality metrics totals for averaging
  let totalCorrectness = 0
  let totalBestPractices = 0
  let totalReadability = 0
  let totalPerformance = 0
  let totalSecurity = 0
  let totalTechnicalQuality = 0

  commits.forEach(commit => {
    const category = (commit.category || 'standard') as CommitCategory
    const domain = commit.domain || 'unknown'
    const impact = commit.impact || 'unknown'
    const score = commit.finalScore || 0
    const points = commit.contributionPoints || 0

    // Update category counts
    commitsByCategory[category]++

    // Update domain counts
    commitsByDomain[domain] = (commitsByDomain[domain] || 0) + 1

    // Update impact counts
    commitsByImpact[impact] = (commitsByImpact[impact] || 0) + 1

    // Add points to the appropriate category
    pointsByCategory[category].push(points)

    // Update total and min/max scores
    totalScore += score
    bestScore = Math.max(bestScore, score)
    worstScore = Math.min(worstScore, score)

    // Add to quality metrics totals
    totalCorrectness += commit.correctness || 0
    totalBestPractices += commit.bestPractices || 0
    totalReadability += commit.readability || 0
    totalPerformance += commit.performance || 0
    totalSecurity += commit.security || 0
    totalTechnicalQuality += commit.technicalQuality || 0
  })

  // Calculate raw average score
  const rawScore = Math.round(totalScore / commits.length)

  // Calculate average quality metrics
  const averageQualityMetrics = {
    correctness: Math.round(totalCorrectness / commits.length),
    bestPractices: Math.round(totalBestPractices / commits.length),
    readability: Math.round(totalReadability / commits.length),
    performance: Math.round(totalPerformance / commits.length),
    security: Math.round(totalSecurity / commits.length),
    technicalQuality: Math.round(totalTechnicalQuality / commits.length)
  }

  // Apply diminishing returns to each category
  const categoryPoints: Record<CommitCategory, number> = {
    trivial: applyDiminishingReturns('trivial', pointsByCategory.trivial),
    minor: applyDiminishingReturns('minor', pointsByCategory.minor),
    standard: applyDiminishingReturns('standard', pointsByCategory.standard),
    significant: applyDiminishingReturns(
      'significant',
      pointsByCategory.significant
    ),
    major: applyDiminishingReturns('major', pointsByCategory.major),
    exceptional: applyDiminishingReturns(
      'exceptional',
      pointsByCategory.exceptional
    )
  }

  // Calculate total contribution points
  const totalContributionPoints = Object.values(categoryPoints).reduce(
    (sum, points) => sum + points,
    0
  )

  // Calculate logarithmic adjustment based on commit distribution
  const logarithmicAdjustment =
    calculateLogarithmicAdjustment(commitsByCategory)

  // Calculate weighted score with logarithmic adjustment
  // This ensures users who make significant/major/exceptional commits get higher scores
  // than users who only make trivial/minor commits, even if they have similar raw scores
  const weightedScore = Math.min(
    100,
    Math.round(rawScore * logarithmicAdjustment)
  )

  return {
    authorEmail,
    rawScore,
    weightedScore,
    totalCommits: commits.length,
    commitsByCategory,
    commitsByDomain,
    commitsByImpact,
    contributionPoints: totalContributionPoints,
    categoryPoints,
    bestScore,
    worstScore,
    logarithmicAdjustment,
    averageQualityMetrics
  }
}

/**
 * Get leaderboard data for a repository
 */
export async function getRepositoryLeaderboard(
  gitConnectionId: string,
  limit = 50
) {
  // Get unique authors for this repository
  const authors = await db
    .select({
      authorEmail: gitCommitsTable.authorEmail
    })
    .from(gitCommitsTable)
    .where(
      and(
        eq(gitCommitsTable.gitConnectionId, gitConnectionId),
        eq(gitCommitsTable.queueStatus, 'processed')
      )
    )
    .groupBy(gitCommitsTable.authorEmail)
    .limit(limit)

  // Calculate scores for each author
  const leaderboard = await Promise.all(
    authors.map(async author => {
      const score = await calculateUserScore(
        author.authorEmail,
        gitConnectionId
      )
      return score
    })
  )

  // Sort by weighted score (descending)
  return leaderboard.sort((a, b) => b.weightedScore - a.weightedScore)
}

/**
 * Get paginated authors for a repository
 */
export async function getPaginatedAuthors({
  repositoryId,
  page = 1,
  pageSize = 10,
  search = ''
}: {
  repositoryId: string
  page: number
  pageSize: number
  search?: string
}) {
  try {
    // Build the base query
    let whereClause = and(
      eq(gitCommitsTable.gitConnectionId, repositoryId),
      eq(gitCommitsTable.queueStatus, 'processed')
    )

    // Add search filter if provided
    if (search) {
      whereClause = and(
        whereClause,
        sql`${gitCommitsTable.authorEmail} ILIKE ${`%${search}%`}`
      )
    }

    // Get total count
    const totalResult = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${gitCommitsTable.authorEmail})`
      })
      .from(gitCommitsTable)
      .where(whereClause)

    const totalAuthors = totalResult[0]?.count || 0

    // Get paginated authors with their average scores
    const authorsResult = await db
      .select({
        authorEmail: gitCommitsTable.authorEmail,
        avgScore: sql<number>`AVG(${gitCommitsTable.finalScore})`
      })
      .from(gitCommitsTable)
      .where(whereClause)
      .groupBy(gitCommitsTable.authorEmail)
      .orderBy(sql`AVG(${gitCommitsTable.finalScore}) ASC`) // Order by lowest score first (worst performers first)
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    const authors = authorsResult.map(author => ({
      authorEmail: author.authorEmail,
      avgScore: Math.round(author.avgScore || 0)
    }))

    return {
      authors,
      totalAuthors,
      currentPage: page,
      totalPages: Math.ceil(totalAuthors / pageSize)
    }
  } catch (error) {
    console.error('Failed to get paginated authors:', error)
    return {
      error: 'Failed to get authors',
      authors: [],
      totalAuthors: 0,
      currentPage: page,
      totalPages: 0
    }
  }
}
