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
          ...score,
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
  const toProcess = await db
    .update(gitCommitsTable)
    .set({
      queueStatus: 'processing',
      updatedAt: sql`now()`
    })
    // .where(eq(gitCommitsTable.queueStatus, 'pending'))
    .where(eq(gitCommitsTable.authorEmail, 'yjhala58@gmail.com'))
    .returning({
      id: gitCommitsTable.id
    })

  await processInternal(toProcess)

  // const toProcessErrors = await db
  //   .update(gitCommitsTable)
  //   .set({
  //     errorMessage: null,
  //     queueStatus: 'processing',
  //     updatedAt: sql`now()`
  //   })
  //   .where(eq(gitCommitsTable.queueStatus, 'error'))
  //   .returning({
  //     id: gitCommitsTable.id
  //   })

  // await processInternal(toProcessErrors)

  return Response.json({ message: 'Processed' }, { status: 200 })
}
