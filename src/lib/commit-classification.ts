// Comprehensive commit classification and scoring system

// Define all the necessary types
export type CommitCategory =
  | 'trivial'
  | 'minor'
  | 'standard'
  | 'significant'
  | 'major'
  | 'exceptional'

export type TechnicalDomain =
  | 'algorithms'
  | 'security'
  | 'performance'
  | 'database'
  | 'backend'
  | 'devops'
  | 'frontend'
  | 'refactoring'
  | 'testing'
  | 'documentation'

export type CommitImpact =
  | 'security'
  | 'performance'
  | 'bugfix'
  | 'feature'
  | 'refactoring'
  | 'testing'
  | 'ui_ux'
  | 'documentation'
  | 'chore'

// Multipliers for each category - [min, max] range
export const CATEGORY_MULTIPLIERS: Record<CommitCategory, [number, number]> = {
  trivial: [0.05, 0.15], // e.g., add button, fix typo, rename
  minor: [0.15, 0.4], // e.g., small UI flow change, adjust styling
  standard: [0.4, 0.9], // e.g., add new endpoint, add tests, form validation
  significant: [0.9, 1.5], // e.g., implement core feature, refactor component tree
  major: [1.5, 2.3], // e.g., introduce auth system, overhaul module
  exceptional: [2.3, 3.0] // e.g., deep optimization, algorithmic innovation
}

// Multipliers for technical domains
export const DOMAIN_MULTIPLIERS: Record<TechnicalDomain, number> = {
  algorithms: 1.4,
  security: 1.3,
  performance: 1.25,
  database: 1.2,
  backend: 1.15,
  devops: 1.1,
  frontend: 0.85, // ⚠️ Reduced — UI is often simpler
  refactoring: 1.0, // May span domains, so kept neutral
  testing: 0.9,
  documentation: 0.7
}

// Multipliers for commit impact types
export const IMPACT_MULTIPLIERS: Record<CommitImpact, number> = {
  security: 1.3,
  performance: 1.25,
  bugfix: 1.15,
  feature: 1.0,
  refactoring: 0.95,
  testing: 0.85,
  ui_ux: 0.75,
  documentation: 0.7,
  chore: 0.5 // Infra, formatting, setup
}

// Maximum contribution points per category
export const CATEGORY_CAPS: Record<CommitCategory, number> = {
  trivial: 30, // No matter how many trivial commits, max 30 points
  minor: 100, // Minor commits capped at 100 points
  standard: 300, // Standard commits capped at 300 points
  significant: 600, // Significant commits have a higher cap
  major: 1000, // Major commits have a high cap
  exceptional: 2000 // Exceptional work has the highest cap
}

// Diminishing returns factor for each additional commit in the same category
export const DIMINISHING_FACTORS: Record<CommitCategory, number> = {
  trivial: 0.5, // Each additional trivial commit counts 50% less (severe diminishing)
  minor: 0.7, // Each additional minor commit counts 30% less
  standard: 0.85, // Standard commits diminish moderately
  significant: 0.92, // Significant commits diminish slowly
  major: 0.95, // Major commits barely diminish
  exceptional: 0.98 // Exceptional commits diminish very little
}

// Technical quality weights - how much each aspect contributes to the quality score
export const QUALITY_WEIGHTS = {
  correctness: 0.25, // Highest weight - code must work correctly
  bestPractices: 0.2, // Following best practices is critical
  readability: 0.15, // Code should be readable and maintainable
  performance: 0.15, // Performance matters
  security: 0.15 // Security is important
}

/**
 * Calculate a complexity factor based on the work complexity score and commit category
 */
export function calculateCategoryMultiplier(
  category: CommitCategory,
  qualityScore: number
): number {
  const [min, max] = CATEGORY_MULTIPLIERS[category]

  // Higher quality gets closer to the max multiplier for the category
  // This ensures that even trivial work needs to be high quality to get its full potential
  const qualityFactor = qualityScore / 10 // normalize to 0-1

  return min + (max - min) * qualityFactor
}

/**
 * Apply diminishing returns to a list of contribution points
 */
export function applyDiminishingReturns(
  category: CommitCategory,
  points: number[]
): number {
  // Sort points in descending order to process highest value commits first
  const sortedPoints = [...points].sort((a, b) => b - a)

  let totalPoints = 0
  let factor = 1.0

  for (const point of sortedPoints) {
    totalPoints += point * factor
    factor *= DIMINISHING_FACTORS[category] // Reduce factor for next commit
  }

  // Apply category cap
  return Math.min(totalPoints, CATEGORY_CAPS[category])
}

/**
 * Calculate logarithmic adjustment factor based on commit distribution
 * This rewards users who make significant/major/exceptional commits
 * and penalizes users who only make trivial/minor commits
 */
export function calculateLogarithmicAdjustment(
  commitCounts: Record<CommitCategory, number>
): number {
  const totalCommits = Object.values(commitCounts).reduce(
    (sum, count) => sum + count,
    0
  )
  if (totalCommits === 0) return 1.0

  // Calculate weighted average of commit categories
  const weightedSum =
    commitCounts.trivial * 0.1 +
    commitCounts.minor * 0.3 +
    commitCounts.standard * 1.0 +
    commitCounts.significant * 2.0 +
    commitCounts.major * 3.0 +
    commitCounts.exceptional * 5.0

  const weightedAvg = weightedSum / totalCommits

  // Apply logarithmic adjustment
  // This gives diminishing returns for trivial/minor commits
  // and increasing returns for significant/major/exceptional commits
  if (weightedAvg < 1.0) {
    // Penalize users who mostly make trivial/minor commits
    return 0.7 + 0.3 * Math.log10(1 + weightedAvg)
  } else {
    // Reward users who make significant/major/exceptional commits
    return 1.0 + 0.2 * Math.log10(weightedAvg)
  }
}
