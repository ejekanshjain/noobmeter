import { db } from '@/db'
import { gitCommitsTable } from '@/db/schema'
import { getGithubCommitDiffs } from '@/lib/github'
import { getGitlabCommitDiffs } from '@/lib/gitlab'
import { scoreCommit } from '@/lib/score-commit'
import { eq, sql } from 'drizzle-orm'

const processInternal = async (toProcess: { id: string }[]) => {
  let count = toProcess.length
  for (const { id: gitCommitId } of toProcess) {
    console.log(`Processing commit ${count--}/${toProcess.length}`)
    try {
      const gitCommit = await db.query.gitCommitsTable.findFirst({
        where: eq(gitCommitsTable.id, gitCommitId),
        columns: {
          id: true,
          sha: true,
          message: true
        },
        with: {
          gitConnection: {
            columns: {
              id: true,
              type: true,
              host: true,
              project: true,
              token: true,
              customPrompt: true
            }
          }
        }
      })

      if (!gitCommit) continue

      let commitDiffs: any[] = []

      if (gitCommit.gitConnection.type === 'github') {
        commitDiffs = await getGithubCommitDiffs(
          gitCommit.gitConnection.host,
          gitCommit.gitConnection.project,
          gitCommit.sha,
          gitCommit.gitConnection.token
        )
      } else if (gitCommit.gitConnection.type === 'gitlab') {
        commitDiffs = await getGitlabCommitDiffs(
          gitCommit.gitConnection.host,
          gitCommit.gitConnection.project,
          gitCommit.sha,
          gitCommit.gitConnection.token
        )
      }

      if (!commitDiffs.length) {
        await db
          .delete(gitCommitsTable)
          .where(eq(gitCommitsTable.id, gitCommitId))
        continue
      }
      const score = await scoreCommit(commitDiffs)
      console.log('AI Score Response:', score)
      await db
        .update(gitCommitsTable)
        .set({
          correctness: score.correctness,
          bestPractices: score.bestPractices,
          readability: score.readability,
          performance: score.performance,
          security: score.security,
          technicalQuality: score.technicalQuality,
          category: score.category,
          domain: score.domain,
          impact: score.impact,
          classificationReasoning: score.classificationReasoning,
          categoryMultiplier: score.categoryMultiplier,
          domainMultiplier: score.domainMultiplier,
          impactMultiplier: score.impactMultiplier,
          summary: score.summary,
          finalScore: score.finalScore,
          contributionPoints: score.contributionPoints,
          queueStatus: 'processed',
          updatedAt: sql`now()`
        })
        .where(eq(gitCommitsTable.id, gitCommitId))
    } catch (err) {
      console.error(`Error processing commit ${gitCommitId}:`, err)
      await db
        .update(gitCommitsTable)
        .set({
          queueStatus: 'error',
          errorMessage: JSON.stringify(err),
          updatedAt: sql`now()`
        })
        .where(eq(gitCommitsTable.id, gitCommitId))
    }
  }
}

export async function GET() {
  const [commitToProcess] = await db
    .select({ id: gitCommitsTable.id })
    .from(gitCommitsTable)
    .where(eq(gitCommitsTable.sha, 'c51c191fd163b0ad9ac9c44bebbb19980701c0f3'))
    .limit(1)

  if (commitToProcess) {
    await db
      .update(gitCommitsTable)
      .set({
        queueStatus: 'processing',
        updatedAt: sql`now()`
      })
      .where(eq(gitCommitsTable.id, commitToProcess.id))

    await processInternal([commitToProcess])
    return Response.json(
      {
        message: 'Processed pending commit',
        processedCount: 1
      },
      { status: 200 }
    )
  }

  // Handle error commits
  const [errorToProcess] = await db
    .select({ id: gitCommitsTable.id })
    .from(gitCommitsTable)
    .where(eq(gitCommitsTable.queueStatus, 'error'))
    .limit(1)

  if (errorToProcess) {
    await db
      .update(gitCommitsTable)
      .set({
        queueStatus: 'processing',
        updatedAt: sql`now()`,
        errorMessage: null
      })
      .where(eq(gitCommitsTable.id, errorToProcess.id))

    await processInternal([errorToProcess])
    return Response.json(
      {
        message: 'Processed error commit',
        processedCount: 1
      },
      { status: 200 }
    )
  }

  return Response.json(
    {
      message: 'No commits to process',
      processedCount: 0
    },
    { status: 200 }
  )
}
