'use server'

import { db } from '@/db'
import { gitCommitsTable, gitConnectionsTable } from '@/db/schema'
import { getAuthSession } from '@/lib/auth'
import { calculateUserScore } from '@/lib/user-scoring'
import { and, count, eq, sql } from 'drizzle-orm'

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
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Verify repository access
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
        avgScore: sql<number>`AVG(${gitCommitsTable.finalScore})`,
        commitCount: count(),
        bestScore: sql<number>`MAX(${gitCommitsTable.finalScore})`,
        worstScore: sql<number>`MIN(${gitCommitsTable.finalScore})`
      })
      .from(gitCommitsTable)
      .where(whereClause)
      .groupBy(gitCommitsTable.authorEmail)
      .orderBy(sql`AVG(${gitCommitsTable.finalScore}) ASC`) // Order by lowest score first (worst performers first)
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    const authors = authorsResult.map(author => ({
      authorEmail: author.authorEmail,
      avgScore: Math.round(author.avgScore || 0),
      commitCount: author.commitCount,
      bestScore: Math.round(author.bestScore || 0),
      worstScore: Math.round(author.worstScore || 0)
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

export async function getAuthorDetailedStats(
  authorEmail: string,
  repositoryId: string
) {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Verify repository access
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

    // Get comprehensive user stats
    const stats = await calculateUserScore(authorEmail, repositoryId)

    // Get recent commits for this author
    const recentCommits = await db.query.gitCommitsTable.findMany({
      where: and(
        eq(gitCommitsTable.gitConnectionId, repositoryId),
        eq(gitCommitsTable.authorEmail, authorEmail),
        eq(gitCommitsTable.queueStatus, 'processed')
      ),
      orderBy: [sql`${gitCommitsTable.date} DESC`],
      limit: 10,
      columns: {
        id: true,
        sha: true,
        message: true,
        date: true,
        finalScore: true,
        category: true,
        domain: true,
        impact: true,
        summary: true
      }
    })

    return {
      ...stats,
      recentCommits
    }
  } catch (error) {
    console.error('Failed to get author detailed stats:', error)
    return { error: 'Failed to get author stats' }
  }
}

export async function getAuthorCommitHistory(
  authorEmail: string,
  repositoryId: string,
  limit = 20,
  offset = 0
) {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Verify repository access
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

    const commits = await db.query.gitCommitsTable.findMany({
      where: and(
        eq(gitCommitsTable.gitConnectionId, repositoryId),
        eq(gitCommitsTable.authorEmail, authorEmail),
        eq(gitCommitsTable.queueStatus, 'processed')
      ),
      orderBy: [sql`${gitCommitsTable.date} DESC`],
      limit,
      offset
    })

    const totalCount = await db
      .select({ count: count() })
      .from(gitCommitsTable)
      .where(
        and(
          eq(gitCommitsTable.gitConnectionId, repositoryId),
          eq(gitCommitsTable.authorEmail, authorEmail),
          eq(gitCommitsTable.queueStatus, 'processed')
        )
      )

    return {
      commits,
      pagination: {
        total: totalCount[0]?.count || 0,
        limit,
        offset
      }
    }
  } catch (error) {
    console.error('Failed to get author commit history:', error)
    return { error: 'Failed to get commit history' }
  }
}
