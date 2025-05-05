import { db } from '@/db'
import { gitCommitsTable } from '@/db/schema'
import { getGitlabCommitDiff } from '@/lib/gitlab'
import { scoreCommit } from '@/lib/score-commit'
import { eq } from 'drizzle-orm'

export async function GET() {
  const toProcess = await db
    .update(gitCommitsTable)
    .set({
      queueStatus: 'processing'
    })
    .where(eq(gitCommitsTable.queueStatus, 'pending'))
    .returning({
      id: gitCommitsTable.id
    })

  for (const { id: gitCommitId } of toProcess) {
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
            token: true
          }
        }
      }
    })

    if (!gitCommit) continue

    if (gitCommit.gitConnection.type === 'github') {
    } else if (gitCommit.gitConnection.type === 'gitlab') {
      const commitDiffs = await getGitlabCommitDiff(
        gitCommit.gitConnection.host,
        gitCommit.gitConnection.project,
        gitCommit.sha,
        gitCommit.gitConnection.token
      )

      const score = await scoreCommit(gitCommit.message, commitDiffs)

      await db
        .update(gitCommitsTable)
        .set({
          ...score,
          queueStatus: 'processed'
        })
        .where(eq(gitCommitsTable.id, gitCommitId))
    }
  }

  return Response.json({ message: 'Processed' }, { status: 200 })
}
