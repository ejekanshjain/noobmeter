/*
I want to create a workflow which will run after every git push on any branch, and it will view all the commits and changes and then an ai will do analysis and code quality check and give rating for each user and create a profile for that user and issue a performance improvement plan in my company when the score is not good for the month. Now how to structure this and how to design this system.

I have a self hosted gitlab running. So as of now i want do atleast that whenver something is pushed, i want to get all commits and then call an external service and send all the commit ids to that.

apis in gitlab which i can use to get all commits in a day in all branches and then run a cron job and build profile everyday and aggregate for a month
*/

import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const headers = {
  'PRIVATE-TOKEN': process.env.GITLAB_TOKEN || ''
}

const projectId = encodeURIComponent(process.env.GITLAB_PROJECT_ID || '')

const model = google.languageModel('gemini-2.0-flash-exp')

const baseurl = `https://${
  process.env.GITLAB_HOST || ''
}/api/v4/projects/${projectId}`

async function getBranches() {
  const branches: string[] = []
  let page = 1

  while (true) {
    const response = await fetch(
      `${baseurl}/repository/branches?per_page=100&page=${page}`,
      {
        headers
      }
    )
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format')
    }

    data.forEach(branch => {
      if (branch.name) {
        branches.push(branch.name)
      }
    })

    if (!data.length || data.length < 100) break

    page++
  }

  return branches
}

function getDateRange() {
  const startDate = new Date()
  startDate.setUTCHours(0, 0, 0, 0)
  const endDate = new Date(startDate)
  endDate.setUTCHours(23, 59, 59, 999)

  return {
    startDate,
    endDate
  }
}

async function getCommits(branch: string, startDate: Date, endDate: Date) {
  const commits: {
    id: string
    message: string
    author: string
  }[] = []
  let page = 1

  while (true) {
    const res = await fetch(
      `${baseurl}/repository/commits?ref_name=${encodeURIComponent(
        branch
      )}&since=${encodeURIComponent(
        startDate.toISOString()
      )}&until=${encodeURIComponent(
        endDate.toISOString()
      )}&page=${page}&per_page=100`,
      {
        headers
      }
    )

    if (!res.ok) throw new Error(`Error fetching commits: ${res.status}`)

    const data = await res.json()

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format')
    }

    data.forEach(commit => {
      if (commit.parent_ids && commit.parent_ids.length > 1) return

      if (commit.id && commit.author_email) {
        commits.push({
          id: commit.id,
          message: commit.message,
          author: commit.author_email.toLowerCase()
        })
      }
    })

    if (!data.length || data.length < 100) break

    page++
  }

  return commits
}

async function getCommitDiff(commitId: string) {
  const res = await fetch(`${baseurl}/repository/commits/${commitId}/diff`, {
    headers
  })

  if (!res.ok)
    throw new Error(`Failed to get diff for commit ${commitId}: ${res.status}`)

  const data = await res.json()

  if (!Array.isArray(data)) {
    throw new Error('Invalid diff response format')
  }

  const filtered = data.filter(file => {
    const path = file.new_path || file.old_path || ''
    return !(
      path === 'package-lock.json' ||
      path.endsWith('.min.js') ||
      path.endsWith('.png') ||
      path.endsWith('.jpg') ||
      path.endsWith('.jpeg') ||
      path.endsWith('.webp') ||
      path.endsWith('.zip') ||
      path.endsWith('.ico') ||
      path.endsWith('.txt') ||
      path.endsWith('.md')
    )
  })

  return filtered
}

async function main(startDate: Date, endDate: Date) {
  const branches = await getBranches()

  for (const branch of branches) {
    const commits = await getCommits(branch, startDate, endDate)

    if (!commits.length) continue

    for (const commit of commits) {
      const commitDiffs = await getCommitDiff(commit.id)
      if (!commitDiffs.length) continue

      const { object } = await generateObject({
        model,
        schema: z.object({
          correctness: z.number().min(1).max(10),
          readability: z.number().min(1).max(10),
          bestPractices: z.number().min(1).max(10),
          performance: z.number().min(1).max(10),
          security: z.number().min(1).max(10),
          dryness: z.number().min(1).max(10),
          scopeDiscipline: z.number().min(1).max(10),
          testability: z.number().min(1).max(10),
          impactToNoise: z.number().min(1).max(10),
          overallQuality: z.number().min(1).max(10),
          summary: z.string(),
          suggestion: z.string().optional()
        }),
        messages: [
          {
            role: 'system',
            content: `## 🧠 Code Quality Score Parameters (1-10)

      ### 1. **Code Correctness / Logic Soundness**

      > *Is the logic accurate, bug-free, and well thought out?*

      * 10 = bulletproof logic, edge cases handled
      * 1 = WTF is this spaghetti, infinite fucking loops, shit and noob unoptimized code.

      ---

      ### 2. **Code Readability & Clarity**

      > *Is the code easy to read, cleanly structured, and understandable?*

      * Clear naming, small functions, clear intent
      * Not crammed into a single mega-function
      * Docs or comments where appropriate

      ---

      ### 3. **Best Practices / Idiomatic Code**

      > *Is it written using language/framework best practices?*

      * Using the right APIs, modern syntax
      * No anti-patterns or jank hacks

      ---

      ### 4. **Testability / Reliability**

      > *Is the code easy to test or comes with tests?*

      * Bonus if test coverage is implied by the commit
      * Can this be unit/integration tested without magic?

      ---

      ### 5. **Performance Awareness**

      > *Are there unnecessary loops, DB calls, memory waste, etc.?*

      * Avoids N+1 queries, unneeded complexity
      * Optimized where it matters

      ---

      ### 6. **Security Considerations**

      > *Are there any obvious security risks?*

      * Unsafe input handling?
      * Using outdated crypto?
      * Exposing sensitive info?

      ---

      ### 7. **Change Scope Discipline**

      > *Does this commit do one thing, or everything ever?*

      * 10 = laser-focused changes
      * 1 = “refactor login + add cart + fix tests + 5 random changes”

      ---

      ### 8. **Code Duplication / DRYness**

      > *Is there unnecessary duplication or copy-pasted mess?*

      * Reuses existing utils, helpers, abstractions

      ---

      ### 9. **Impact-to-Noise Ratio**

      > *Did the commit touch 50 files to add 1 feature?*

      * Higher scores = fewer files, higher meaningful change per LOC
      * Low scores = mass formatting, config spam, churn with no value

      ---

      ### 10. **Overall Code Contribution Quality**

      > *Overall subjective score based on value and cleanliness of the commit.*

      * A normalized “gut feel” from the AI combining everything

      ---

      Analyze this commit diff given below and rate it from 1-10 in the following categories:
      - Correctness
      - Readability
      - Best Practices
      - Performance
      - Security
      - DRYness
      - Scope Discipline
      - Testability
      - Impact-to-Noise
      - Overall Quality

      Respond as a JSON with scores only.

      And finally, give a short summary of the commit and its quality in a single line. You can use words like fuck, wtf and curse for noob things and show rage and be angry.
      `
          },
          {
            role: 'user',
            content: `Here's the commit message:-\n ${
              commit.message
            } \n\n\nHere's the commit diffs:-\n\n\n${JSON.stringify(
              commitDiffs
            )}`
          }
        ]
      })

      console.log(object, commit)
    }
  }
}

const { startDate, endDate } = getDateRange()

main(startDate, endDate)
