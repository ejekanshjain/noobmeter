import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const model = google('gemini-2.0-flash-exp')

const calculateFinalScore = (scores: Record<string, any>): number => {
  const qualityMetrics = [
    scores.correctness,
    scores.readability,
    scores.bestPractices,
    scores.performance,
    scores.security,
    scores.dryness,
    scores.scopeDiscipline,
    scores.testability,
    scores.impactToNoise
  ]

  const avgQuality =
    qualityMetrics.reduce((sum, score) => sum + score, 0) /
    qualityMetrics.length

  const workWeight = 0.4
  const qualityWeight = 0.6

  const scaledWorkComplexity = Math.pow(scores.workComplexity / 10, 1.5) * 10

  const rawScore =
    (avgQuality * qualityWeight + scaledWorkComplexity * workWeight) * 10

  return Math.max(1, Math.min(100, Math.round(rawScore)))
}

export const scoreCommit = async (
  commitMessage: string,
  commitDiffs: any[]
) => {
  const { object } = await generateObject({
    model,
    schema: z.object({
      correctness: z.number().int().min(1).max(10),
      readability: z.number().int().min(1).max(10),
      bestPractices: z.number().int().min(1).max(10),
      performance: z.number().int().min(1).max(10),
      security: z.number().int().min(1).max(10),
      dryness: z.number().int().min(1).max(10),
      scopeDiscipline: z.number().int().min(1).max(10),
      testability: z.number().int().min(1).max(10),
      impactToNoise: z.number().int().min(1).max(10),
      workComplexity: z.number().int().min(1).max(10),
      summary: z.string()
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

      ### 10. **Work Complexity / Effort**

      > *How substantial is the work done in this commit?*

      * 10 = implementing complex feature, architecting new system, solving hard problems
      * 5 = moderate changes like adding new components or refactoring medium-sized functions
      * 1 = trivial changes like removing console.logs, fixing typos, or updating comments

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
      - Work Complexity

      Respond as a JSON with scores only.

      And finally, give a short summary of the commit and its quality in a single line. You can use words like fuck, wtf, noob and curse for noob things and show rage and be angry.
      `
      },
      {
        role: 'user',
        content: `Here's the commit message:-\n ${
          commitMessage
        } \n\n\nHere's the commit diffs:-\n\n\n${JSON.stringify(commitDiffs)}`
      }
    ]
  })

  return { ...object, finalScore: calculateFinalScore(object) }
}
