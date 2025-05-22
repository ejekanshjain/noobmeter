import { db } from '@/db'
import {
  gitCommitsTable,
  gitConnectionsTable,
  userOAuthAccountsTable,
  usersTable
} from '@/db/schema'
import { env } from '@/env.mjs'
import { readFile } from 'fs/promises'

export async function GET() {
  if (env.NODE_ENV === 'production') {
    return Response.json(
      {
        message: 'Not allowed in production'
      },
      { status: 403 }
    )
  }

  const obj = JSON.parse(await readFile('dump.json', 'utf-8'))

  await db.transaction(async tx => {
    await tx.insert(usersTable).values(
      obj.users.map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt),
        updatedAt: u.updatedAt ? new Date(u.updatedAt) : null
      }))
    )
    await tx.insert(userOAuthAccountsTable).values(
      obj.userOAuthAccounts.map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt),
        updatedAt: u.updatedAt ? new Date(u.updatedAt) : null
      }))
    )
    await tx.insert(gitConnectionsTable).values(
      obj.gitConnections.map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt),
        updatedAt: u.updatedAt ? new Date(u.updatedAt) : null
      }))
    )
    await tx.insert(gitCommitsTable).values(
      obj.gitCommits.map((u: any) => ({
        ...u,
        date: new Date(u.date),
        createdAt: new Date(u.createdAt),
        updatedAt: u.updatedAt ? new Date(u.updatedAt) : null
      }))
    )
  })

  return Response.json({}, { status: 200 })
}
