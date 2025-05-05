import { getRawBody } from '@/lib/parse-raw-body'
import { verifyGitHubSignature } from '@/lib/verify-github-signature'

export async function POST(req: Request) {
  if (!req.body) return Response.json({ message: 'No body' }, { status: 400 })

  const rawBody = await getRawBody(req.body)
  const body = JSON.parse(rawBody.toString())

  const githubEvent = req.headers.get('x-github-event')
  const githubSignature = req.headers.get('x-hub-signature-256')
  const gitlabEvent = req.headers.get('x-gitlab-event')
  const gitlabToken = req.headers.get('x-gitlab-token')

  if (gitlabEvent && gitlabToken) {
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

      const commits = body.commits.map((commit: any) => ({
        id: commit.id,
        url: commit.url,
        message: commit.message.trim(),
        date: new Date(commit.timestamp).toISOString(),
        authorEmail: commit.author.email
      }))

      console.log({
        host,
        project,
        commits
      })

      const tokenToVerify = gitlabToken
      console.log('Verified:', tokenToVerify === 'development')
    }
  } else if (githubEvent && githubSignature) {
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

      const commits = body.commits.map((commit: any) => ({
        id: commit.id,
        url: commit.url,
        message: commit.message.trim(),
        date: new Date(commit.timestamp).toISOString(),
        authorEmail: commit.author.email
      }))

      console.log({
        host,
        project,
        commits
      })

      const verified = verifyGitHubSignature(
        rawBody,
        githubSignature,
        'development'
      )
      console.log('Verified:', verified)
    }
  }

  return Response.json(
    {
      message: 'Webhook received successfully'
    },
    {
      status: 200
    }
  )
}
