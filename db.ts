import { randomUUID } from 'crypto'
import { readFile, writeFile } from 'fs/promises'

const readJsonFile = async (path: string) => {
  try {
    const data = await readFile(path, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    return []
  }
}

const writeJsonFile = async (path: string, data: any) => {
  try {
    await writeFile(path, JSON.stringify(data), 'utf-8')
  } catch (err) {
    console.error('Error writing file', err)
  }
}

type Author = {
  id: string
  email: string
  project: string
}

const authors: Author[] = []
const authorsData = await readJsonFile('authors.json')
for (const author of authorsData) {
  authors.push(author)
}

export const getAuthors = () => {
  return authors
}

export const getAuthorById = async (id: string) => {
  return authors.find(author => author.id === id)
}

export const getAuthorByEmail = async (email: string) => {
  return authors.find(author => author.email === email)
}

export const createAuthor = async (author: Omit<Author, 'id'>) => {
  const existingAuthor = await getAuthorByEmail(author.email)

  if (existingAuthor) {
    return existingAuthor
  }

  const newAuthor = {
    id: randomUUID(),
    ...author
  }

  authors.push(newAuthor)

  await writeJsonFile('authors.json', authors)

  return newAuthor
}

type CommitScore = {
  id: string
  authorId: string
  project: string
  commitId: string
  branch: string
  date: string
  commitMessage: string

  correctness: number
  readability: number
  bestPractices: number
  performance: number
  security: number
  dryness: number
  scopeDiscipline: number
  testability: number
  impactToNoise: number
  overallQuality: number
  summary: string
}

const commitScores: CommitScore[] = []
const commitData = await readJsonFile('commitScores.json')
for (const commitScore of commitData) {
  commitScores.push(commitScore)
}

export const getCommitScores = () => {
  return commitScores
}

export const getCommitScoreByCommitId = async (commitId: string) => {
  return commitScores.find(commitScore => commitScore.commitId === commitId)
}

export const getCommitScoresByAuthorId = async (authorId: string) => {
  return commitScores.filter(commitScore => commitScore.authorId === authorId)
}

export const createCommitScore = async (
  commitScore: Omit<CommitScore, 'id'>
) => {
  const existingCommitScore = await getCommitScoreByCommitId(
    commitScore.commitId
  )

  if (existingCommitScore) {
    return existingCommitScore
  }

  const newCommitScore = {
    id: randomUUID(),
    ...commitScore
  }

  commitScores.push(newCommitScore)

  await writeJsonFile('commitScores.json', commitScores)

  return newCommitScore
}
