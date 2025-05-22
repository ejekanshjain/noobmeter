// Type definitions for the scoring system

export type CommitCategory =
  | 'trivial'
  | 'minor'
  | 'standard'
  | 'significant'
  | 'major'
  | 'exceptional'

export type TechnicalDomain =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'security'
  | 'performance'
  | 'testing'
  | 'documentation'
  | 'refactoring'
  | 'algorithms'

export type CommitImpact =
  | 'feature'
  | 'bugfix'
  | 'refactoring'
  | 'performance'
  | 'security'
  | 'testing'
  | 'documentation'

export interface CommitAnalysis {
  // Technical metrics
  correctness: number
  algorithmicEfficiency: number
  codeStructure: number
  errorHandling: number
  securityPractices: number
  testCoverage: number
  performanceOptimization: number
  scalabilityConsiderations: number

  // Quality metrics
  readability: number
  maintainability: number
  dryness: number
  bestPractices: number
  documentation: number

  // Complexity metrics
  cyclomaticComplexity: number
  cognitiveComplexity: number

  // Classification
  category: CommitCategory
  technicalDomain: TechnicalDomain
  impactType: CommitImpact

  // Multipliers
  complexityMultiplier: number
  impactMultiplier: number
  innovationMultiplier: number

  // Aggregate scores
  technicalScore: number
  qualityScore: number
  complexityScore: number

  // Final results
  finalScore: number
  contributionPoints: number

  // Analysis and summary
  analysis: {
    technicalAnalysis: string
    qualityAnalysis: string
    complexityAnalysis: string
    innovationLevel: number
  }
  summary: string
}

export interface UserTechnicalProfile {
  userId: string
  authorEmail: string

  // Commit counts by category
  trivialCommits: number
  minorCommits: number
  standardCommits: number
  significantCommits: number
  majorCommits: number
  exceptionalCommits: number

  // Domain expertise
  frontendExpertise: number
  backendExpertise: number
  databaseExpertise: number
  devopsExpertise: number
  securityExpertise: number
  performanceExpertise: number

  // Technical skill metrics
  algorithmSkill: number
  architectureSkill: number
  testingSkill: number
  securitySkill: number

  // Quality metrics
  codeQuality: number
  bestPracticesAdherence: number

  // Aggregate scores
  averageTechnicalScore: number
  averageQualityScore: number
  averageComplexityScore: number

  // Weighted metrics
  weightedScore: number
  totalContributionPoints: number

  // Technical versatility
  technicalVersatility: number
}
