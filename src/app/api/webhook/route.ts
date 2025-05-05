import { db } from '@/db'
import { gitCommitsTable, gitConnectionsTable } from '@/db/schema'
import { parseRawBody } from '@/lib/parse-raw-body'
import { verifyGitHubSignature } from '@/lib/verify-github-signature'
import { and, eq } from 'drizzle-orm'

const attachConnectionIdToCommits = (commits: any[], connectionId: string) => {
  for (const commit of commits) {
    commit.gitConnectionId = connectionId
  }
  return commits
}

const findConnection = async (
  host: string,
  project: string,
  type: 'github' | 'gitlab'
) => {
  const foundConnection = await db.query.gitConnectionsTable.findFirst({
    where: and(
      eq(gitConnectionsTable.host, host),
      eq(gitConnectionsTable.project, project),
      eq(gitConnectionsTable.type, type),
      eq(gitConnectionsTable.isActive, true)
    ),
    columns: {
      id: true,
      secret: true
    }
  })

  return foundConnection
}

export async function POST(req: Request) {
  if (!req.body) return Response.json({ message: 'No body' }, { status: 400 })

  const rawBody = await parseRawBody(req.body)
  const body = JSON.parse(rawBody.toString())

  const githubEvent = req.headers.get('x-github-event')
  const githubSignature = req.headers.get('x-hub-signature-256')
  const gitlabEvent = req.headers.get('x-gitlab-event')
  const gitlabToken = req.headers.get('x-gitlab-token')

  let commits: any[] = []

  if (githubEvent && githubSignature) {
    if (
      body.repository &&
      body.repository.full_name &&
      body.repository.html_url &&
      body.commits &&
      Array.isArray(body.commits) &&
      body.commits.length
    ) {
      const project = body.repository.full_name
      const projectUrl = new URL(body.repository.html_url)
      const host = projectUrl.host

      const foundConnection = await findConnection(host, project, 'github')

      if (
        foundConnection &&
        verifyGitHubSignature(rawBody, githubSignature, foundConnection.secret)
      ) {
        commits = attachConnectionIdToCommits(body.commits, foundConnection.id)
      }
    }
  } else if (gitlabEvent && gitlabToken) {
    if (
      body.object_kind === 'push' &&
      body.event_name === 'push' &&
      body.project &&
      body.project.web_url &&
      body.commits &&
      Array.isArray(body.commits) &&
      body.commits.length
    ) {
      const project = body.project.path_with_namespace
      const projectUrl = new URL(body.project.web_url)
      const host = projectUrl.host

      const foundConnection = await findConnection(host, project, 'gitlab')

      if (foundConnection && gitlabToken === foundConnection.secret) {
        commits = attachConnectionIdToCommits(body.commits, foundConnection.id)
      }
    }
  }

  if (commits.length)
    await db
      .insert(gitCommitsTable)
      .values(
        commits.map((commit: any) => ({
          sha: commit.id,
          url: commit.url,
          message: commit.message.trim(),
          date: new Date(commit.timestamp),
          authorEmail: commit.author.email,
          gitConnectionId: commit.gitConnectionId
        }))
      )
      .onConflictDoNothing()

  return Response.json(
    {
      message: 'Webhook received successfully'
    },
    {
      status: 200
    }
  )
}
