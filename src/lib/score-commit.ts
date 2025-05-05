import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const model = google('gemini-2.0-flash-exp')

export const scoreCommit = async (
  commitMessage: string,
  commitDiffs: any[]
) => {
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
          commitMessage
        } \n\n\nHere's the commit diffs:-\n\n\n${JSON.stringify(commitDiffs)}`
      }
    ]
  })

  return object
}
