import { db } from '@/db'
import { env } from '@/env.mjs'
import { writeFile } from 'fs/promises'

export async function GET() {
  if (env.NODE_ENV === 'production') {
    return Response.json(
      {
        message: 'Not allowed in production'
      },
      { status: 403 }
    )
  }

  const obj: any = {}

  obj.users = await db.query.usersTable.findMany({})
  obj.userOAuthAccounts = await db.query.userOAuthAccountsTable.findMany({})
  obj.gitConnections = await db.query.gitConnectionsTable.findMany({})
  obj.gitCommits = await db.query.gitCommitsTable.findMany({})

  await writeFile('dump.json', JSON.stringify(obj))

  return Response.json({}, { status: 200 })
}
