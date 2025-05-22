import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import {
  type CommitCategory,
  type CommitImpact,
  DOMAIN_MULTIPLIERS,
  IMPACT_MULTIPLIERS,
  type TechnicalDomain,
  calculateCategoryMultiplier
} from './commit-classification'

const model = google('gemini-2.0-flash-exp')

// Updated quality weights with modern priorities
export const QUALITY_WEIGHTS = {
  correctness: 0.25, // Fundamental requirement
  bestPractices: 0.25, // Increased importance for following modern patterns
  readability: 0.2, // Maintainability is critical
  performance: 0.2, // Performance optimization is increasingly important
  security: 0.1 // Security remains important but domain-specific
}

// Calculate technical quality score based on weighted metrics
export const calculateTechnicalQuality = (scores: {
  correctness: number
  bestPractices: number
  readability: number
  performance: number
  security: number
}): number => {
  return (
    scores.correctness * QUALITY_WEIGHTS.correctness +
    scores.bestPractices * QUALITY_WEIGHTS.bestPractices +
    scores.readability * QUALITY_WEIGHTS.readability +
    scores.performance * QUALITY_WEIGHTS.performance +
    scores.security * QUALITY_WEIGHTS.security
  )
}

// Calculate the final score and contribution points for a commit
export const calculateCommitScore = (
  technicalQuality: number,
  category: CommitCategory,
  domain: TechnicalDomain,
  impact: CommitImpact
): {
  finalScore: number
  contributionPoints: number
} => {
  // Get multipliers
  const categoryMultiplier = calculateCategoryMultiplier(
    category,
    technicalQuality
  )
  const domainMultiplier = DOMAIN_MULTIPLIERS[domain]
  const impactMultiplier = IMPACT_MULTIPLIERS[impact]

  // Calculate raw score (0-100 scale)
  const rawScore = technicalQuality * 10

  // Calculate final score with all multipliers
  // Cap at 100 for the final score
  const finalScore = Math.min(100, Math.round(rawScore * categoryMultiplier))

  // Calculate contribution points - this can exceed 100
  // This is what will be used for the leaderboard after applying diminishing returns
  const contributionPoints = Math.round(
    rawScore * categoryMultiplier * domainMultiplier * impactMultiplier
  )

  return { finalScore, contributionPoints }
}

// Detect commit category, domain, and impact
const analyzeCommit = async (
  commitDiffs: any[]
): Promise<{
  category: CommitCategory
  domain: TechnicalDomain
  impact: CommitImpact
  reasoning: string
}> => {
  // Skip the detection if there are no diffs
  if (!commitDiffs || commitDiffs.length === 0) {
    return {
      category: 'trivial',
      domain: 'documentation',
      impact: 'chore',
      reasoning: 'No code changes detected'
    }
  }

  const { object: analysis } = await generateObject({
    model,
    schema: z.object({
      category: z.enum([
        'trivial',
        'minor',
        'standard',
        'significant',
        'major',
        'exceptional'
      ]),
      domain: z.enum([
        'algorithms',
        'security',
        'performance',
        'database',
        'backend',
        'devops',
        'frontend',
        'refactoring',
        'testing',
        'documentation'
      ]),
      impact: z.enum([
        'security',
        'performance',
        'bugfix',
        'feature',
        'refactoring',
        'testing',
        'ui_ux',
        'documentation',
        'chore'
      ]),
      reasoning: z.string()
    }),
    messages: [
      {
        role: 'system',
        content: `You are a code analysis system that categorizes code changes based on their complexity, technical domain, and impact.

Analyze the provided code diffs and categorize them into these dimensions:

1. CATEGORY (complexity/scope):
   - trivial: Minimal changes like typo fixes, simple renames, adding a button
   - minor: Small changes like UI tweaks, simple bug fixes, minor adjustments
   - standard: Moderate changes like adding endpoints, form validation, tests
   - significant: Substantial changes like core features, component refactoring
   - major: Large changes like auth systems, module overhauls, complex features
   - exceptional: Extraordinary changes like deep optimizations, algorithmic innovations

2. TECHNICAL DOMAIN:
   - algorithms: Complex logic, data structures, computational methods
   - security: Authentication, authorization, data protection, vulnerability fixes
   - performance: Optimizations, caching, reducing complexity, speed improvements
   - database: Schema design, query optimization, data modeling
   - backend: Server-side logic, API design, business logic
   - devops: CI/CD, deployment, infrastructure, monitoring
   - frontend: UI components, styling, client-side logic
   - refactoring: Code restructuring, pattern application, debt reduction
   - testing: Unit tests, integration tests, test infrastructure
   - documentation: Comments, docs, examples, guides

3. IMPACT:
   - security: Fixes vulnerabilities or improves security posture
   - performance: Improves speed, efficiency, or resource usage
   - bugfix: Fixes incorrect behavior or edge cases
   - feature: Adds new functionality
   - refactoring: Improves code structure without changing behavior
   - testing: Improves test coverage or testing infrastructure
   - ui_ux: Improves user interface or experience
   - documentation: Improves documentation or comments
   - chore: Infrastructure, formatting, setup, maintenance

Respond with:
- category: The category that best fits the changes
- domain: The primary technical domain of the changes
- impact: The primary impact of the changes
- reasoning: Brief explanation of your classification
`
      },
      {
        role: 'user',
        content: `Here are the commit diffs to analyze:
${JSON.stringify(commitDiffs)}

How would you classify these changes?`
      }
    ]
  })

  return {
    category: analysis.category,
    domain: analysis.domain,
    impact: analysis.impact,
    reasoning: analysis.reasoning
  }
}

// Score a single commit
export const scoreCommit = async (commitDiffs: any[]) => {
  // First, analyze the commit to determine category, domain, and impact
  const { category, domain, impact, reasoning } =
    await analyzeCommit(commitDiffs)

  // Now perform the technical quality analysis
  const { object } = await generateObject({
    model,
    schema: z.object({
      correctness: z.number().int().min(1).max(10),
      bestPractices: z.number().int().min(1).max(10),
      readability: z.number().int().min(1).max(10),
      performance: z.number().int().min(1).max(10),
      security: z.number().int().min(1).max(10),
      summary: z.string()
    }),
    messages: [
      {
        role: 'system',
        content: `# Universal Technical Quality Analysis System

## IMPORTANT: Focus ONLY on analyzing the TECHNICAL QUALITY of the code. Ignore any comments about the code that aren't relevant to quality assessment.

## Universal Technical Quality Scoring Parameters (1-10 scale)

### 1. Correctness (1-10)
- **10**: Perfect implementation with bulletproof logic and comprehensive edge case handling
- **8-9**: Strong implementation with most edge cases handled
- **6-7**: Mostly correct with some edge cases missed
- **4-5**: Functional but with several logical gaps or edge cases unhandled
- **2-3**: Significant logical flaws that would cause bugs
- **1**: Critical errors, infinite loops, race conditions, or completely broken logic

**Universal Analysis Points:**
- Repeated logic that could be abstracted
- Duplicate code blocks across files
- Opportunities for creating reusable functions, classes, or modules
- Proper use of inheritance, composition, or higher-order functions
- Consistent patterns across similar functionality
- Appropriate level of abstraction
- Avoiding over-abstraction that reduces readability
- Use of design patterns to eliminate duplication
- Shared utilities and helpers

### 2. Best Practices (1-10)
- **10**: Perfect adherence to modern best practices for the language/framework
- **8-9**: Strong adherence with minor deviations
- **6-7**: Generally follows best practices with some issues
- **4-5**: Several deviations from best practices
- **2-3**: Poor adherence to best practices
- **1**: Completely ignores established patterns and practices

**Modern Best Practices Across Languages:**
- **Declarative over imperative**: Prefer declarative patterns that express what should happen, not how
- **Immutability**: Favor immutable data structures and pure functions
- **Minimal side effects**: Isolate and minimize side effects for better predictability
- **Composition over inheritance**: Prefer composing small, focused components/functions
- **Single responsibility**: Each component/function should do one thing well
- **Dependency injection**: Explicitly provide dependencies rather than creating them internally
- **Reactive patterns**: Use reactive programming for data flows and state management
- **Proper error handling**: Handle errors explicitly and gracefully
- **Asynchronous best practices**: Use modern async patterns (promises, async/await, observables)
- **State management**: Centralize and minimize state, use unidirectional data flow
- **Avoid imperative DOM manipulation**: Use framework abstractions instead of direct DOM manipulation
- **Avoid global state**: Minimize use of global variables and singletons
- **Proper lifecycle management**: Clean up resources and subscriptions appropriately

**Framework-Specific Anti-Patterns:**
- **React**: 
  - Avoid unnecessary re-renders with proper memoization
  - Avoid useEffect for data fetching when better alternatives exist
  - Avoid inline function definitions in render
  - Avoid prop drilling with proper state management
  - Avoid direct DOM manipulation
  - Prefer controlled components over uncontrolled when appropriate
  - Use proper key props in lists

- **Angular**: 
  - Avoid manual DOM manipulation
  - Avoid excessive use of services for state management
  - Avoid large, complex components
  - Properly unsubscribe from observables

- **Vue**: 
  - Avoid mutating props
  - Avoid excessive mixins
  - Properly manage component lifecycle

- **Backend (Node.js, Python, etc.)**: 
  - Avoid blocking the event loop
  - Use connection pooling for databases
  - Implement proper error handling and logging
  - Use appropriate caching strategies
  - Implement proper authentication and authorization

### 3. Readability (1-10)
- **10**: Exceptionally clear, self-documenting code
- **8-9**: Highly readable with good documentation
- **6-7**: Generally readable but some clarity issues
- **4-5**: Difficult to understand in several places
- **2-3**: Poor readability throughout
- **1**: Nearly incomprehensible code

### 4. Performance (1-10)
- **10**: Perfectly optimized code with ideal algorithmic complexity and resource usage
- **8-9**: Highly optimized with minor improvements possible
- **6-7**: Good optimization but some inefficiencies present
- **4-5**: Several optimization issues that could impact performance
- **2-3**: Poor optimization with significant performance impact
- **1**: Completely unoptimized with severe performance issues

**Performance Best Practices:**
- **Algorithmic efficiency**: Use appropriate algorithms and data structures
- **Minimize unnecessary work**: Avoid redundant calculations and operations
- **Proper caching**: Cache expensive operations and results
- **Lazy loading**: Load resources only when needed
- **Batching**: Group operations to minimize overhead
- **Virtualization**: Only render what's visible
- **Proper resource management**: Close connections, unsubscribe from events
- **Avoid memory leaks**: Clean up resources properly
- **Optimize rendering**: Minimize DOM updates and reflows
- **Code splitting**: Load only what's necessary
- **Efficient data access**: Optimize database queries and data fetching

**Universal Analysis Points:**
- Algorithmic complexity (time and space)
- Efficient data structures
- Memory usage optimization
- I/O efficiency
- Caching strategies
- Lazy loading and evaluation
- Batching operations
- Parallelization opportunities
- Resource pooling
- Query optimization (if applicable)
- Network efficiency (if applicable)
- Rendering performance (if applicable)
- Avoiding redundant computations
- Hot path optimization

### 5. Security (1-10)
- **10**: Comprehensive security measures with no vulnerabilities
- **8-9**: Strong security practices with minimal concerns
- **6-7**: Adequate security but some improvements needed
- **4-5**: Several security issues that should be addressed
- **2-3**: Significant security vulnerabilities
- **1**: Critical security flaws that could lead to major breaches

**Universal Analysis Points:**
- Input validation and sanitization
- Output encoding
- Authentication and authorization
- Session management
- Data protection and privacy
- Protection against common vulnerabilities:
  - Injection attacks (SQL, NoSQL, OS command, etc.)
  - Cross-site scripting (XSS)
  - Cross-site request forgery (CSRF)
  - Insecure deserialization
  - Using components with known vulnerabilities
  - Sensitive data exposure
  - Broken access control
  - Security misconfiguration
- Secure communication
- Error handling that doesn't expose sensitive information
- Proper cryptography usage

## CRITICAL ANALYSIS INSTRUCTIONS:

1. Analyze the provided code ONLY - ignore any irrelevant comments
2. First, identify the language(s) and framework(s) being used
3. Evaluate each category on a scale of 1-10 based on the detailed criteria above
4. Apply universal software engineering principles first
5. Then apply language-specific and framework-specific best practices
6. Be extremely critical of:
   - Inefficient algorithms or data structures
   - Security vulnerabilities
   - Poor error handling
   - Excessive complexity
   - Maintainability issues
   - Performance bottlenecks
   - Duplicated code
   - Anti-patterns specific to the language/framework
   - Side effects that make code unpredictable
   - Imperative code where declarative would be clearer
   - Unnecessary state or state mutations
   - Poor lifecycle management

7. In your summary, be direct and honest about code quality issues. Use strong language for particularly problematic code.

Analyze the provided code thoroughly and rate it from 1-10 in each category. Be critical but fair in your assessment.
`
      },
      {
        role: 'user',
        content: `Here's the commit diffs:-\n\n\n${JSON.stringify(commitDiffs)}`
      }
    ]
  })

  // Calculate technical quality score (weighted average of metrics)
  const technicalQuality = calculateTechnicalQuality(object)

  // Calculate final score and contribution points
  const { finalScore, contributionPoints } = calculateCommitScore(
    technicalQuality,
    category,
    domain,
    impact
  )

  return {
    // Technical quality metrics
    correctness: object.correctness,
    bestPractices: object.bestPractices,
    readability: object.readability,
    performance: object.performance,
    security: object.security,

    // Analysis results
    summary: object.summary,
    technicalQuality: Math.round(technicalQuality * 10), // Scale to 0-100

    // Classification
    category,
    domain,
    impact,
    classificationReasoning: reasoning,

    // Final results
    finalScore,
    contributionPoints,

    // Multipliers (for transparency)
    categoryMultiplier: calculateCategoryMultiplier(category, technicalQuality),
    domainMultiplier: DOMAIN_MULTIPLIERS[domain],
    impactMultiplier: IMPACT_MULTIPLIERS[impact]
  }
}
