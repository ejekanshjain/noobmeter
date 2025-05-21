'use server'

import { db } from '@/db'
import { gitCommitsTable, gitConnectionsTable } from '@/db/schema'
import { getAuthSession } from '@/lib/auth'
import { extractRepositoryPath } from '@/utils/git-connection'
import { createId } from '@paralleldrive/cuid2'
import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const gitConnectionSchema = z.object({
  type: z.enum(['github', 'gitlab']),
  host: z.string().url('Please enter a valid URL').or(z.literal('')),
  project: z.string().min(1, 'Project name is required'),
  token: z.string().min(1, 'Access token is required'),
  customPrompt: z.string().optional().nullable()
})
async function validateGitToken(token: string, type: string, project: string) {
  if (type === 'github') {
    const response = await fetch(`https://api.github.com/repos/${project}`, {
      headers: { Authorization: `token ${token}` }
    })
    return response.ok
  } else if (type === 'gitlab') {
    const response = await fetch(
      `https://gitlab.com/api/v4/projects/${encodeURIComponent(project)}`,
      {
        headers: { 'Private-Token': token }
      }
    )
    return response.ok
  }

  return false
}

export type GitConnectionFormValues = z.infer<typeof gitConnectionSchema>

export async function getGitConnections() {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const connections = await db.query.gitConnectionsTable.findMany({
      where: and(
        eq(gitConnectionsTable.isActive, true),
        eq(gitConnectionsTable.userId, session.user.id)
      ),
      orderBy: [desc(gitConnectionsTable.createdAt)],
      with: {
        commits: {
          limit: 1,
          orderBy: [desc(gitCommitsTable.date)]
        }
      }
    })
    console.log('connections', connections)
    return { connections }
  } catch (error) {
    console.error('Failed to fetch git connections:', error)
    return { error: 'Failed to fetch git connections' }
  }
}

export async function addGitConnection(values: GitConnectionFormValues) {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const validatedData = gitConnectionSchema.parse(values)

    const webhookSecret = createId()

    let host = validatedData.host
    if (!host) {
      host = validatedData.type === 'github' ? 'github.com' : 'gitlab.com'
    }

    if (host.startsWith('http://') || host.startsWith('https://')) {
      try {
        const url = new URL(host)
        host = url.host
      } catch (e) {}
    }

    const project = extractRepositoryPath(validatedData.project)
    const isValid = await validateGitToken(
      validatedData.token,
      validatedData.type,
      project
    )
    if (!isValid) {
      return { error: 'Invalid token or repository access denied' }
    }

    const existingConnection = await db.query.gitConnectionsTable.findFirst({
      where: table =>
        and(
          eq(table.type, validatedData.type),
          eq(table.host, host),
          eq(table.project, project),
          eq(table.userId, session.user.id),
          eq(table.isActive, true)
        )
    })

    if (existingConnection) {
      return { error: 'This repository is already connected' }
    }

    const newConnection = await db
      .insert(gitConnectionsTable)
      .values({
        type: validatedData.type as any,
        host: host,
        project: project,
        token: validatedData.token,
        webhookSecret,
        isActive: true,
        customPrompt: validatedData.customPrompt,
        userId: session.user.id
      })
      .returning()

    revalidatePath('/repositories')
    revalidatePath('/repositories')

    return {
      success: true,
      connection: newConnection[0],
      webhookSecret: webhookSecret
    }
  } catch (error) {
    console.error('Failed to add git connection:', error)
    if (error instanceof z.ZodError) {
      return { error: error.errors[0]?.message }
    }
    return { error: 'Failed to add git connection' }
  }
}

export async function deleteGitConnection(id: string) {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const connection = await db.query.gitConnectionsTable.findFirst({
      where: and(
        eq(gitConnectionsTable.id, id),
        eq(gitConnectionsTable.userId, session.user.id)
      )
    })

    if (!connection) {
      return {
        error: "Repository not found or you don't have permission to delete it"
      }
    }

    await db
      .update(gitConnectionsTable)
      .set({ isActive: false })
      .where(eq(gitConnectionsTable.id, id))

    revalidatePath('/repositories')
    revalidatePath('/repositories')

    return { success: true }
  } catch (error) {
    console.error('Failed to delete git connection:', error)
    return { error: 'Failed to delete git connection' }
  }
}

export async function getGitConnection(id: string) {
  const session = await getAuthSession()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const connection = await db.query.gitConnectionsTable.findFirst({
      where: and(
        eq(gitConnectionsTable.id, id),
        eq(gitConnectionsTable.userId, session.user.id),
        eq(gitConnectionsTable.isActive, true)
      ),
      with: {
        commits: {
          limit: 10
        }
      }
    })

    if (!connection) {
      return { error: 'Repository not found or access denied' }
    }

    return { connection }
  } catch (error) {
    console.error('Failed to fetch git connection:', error)
    return { error: 'Failed to fetch git connection' }
  }
}
