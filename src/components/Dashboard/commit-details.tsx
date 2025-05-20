'use client'

import { triggerCommitAnalysis } from '@/app/actions/commits'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import {
  AlertCircle,
  Clock,
  FileCode,
  GitBranch,
  GitCommit,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import {
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

interface CommitDetailsProps {
  commit: any
}

export function CommitDetails({ commit }: CommitDetailsProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (isRetrying) return

    setIsRetrying(true)
    try {
      await triggerCommitAnalysis(commit.id)
    } catch (error) {
      console.error('Failed to retry commit analysis:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  // Format date
  const formattedDate = commit.date
    ? format(new Date(commit.date), "PPP 'at' p")
    : 'Unknown date'

  // Get status badge
  const getStatusBadge = () => {
    switch (commit.queueStatus) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-300"
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case 'processing':
        return (
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-300"
          >
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        )
      case 'error':
        return (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900 dark:text-red-300"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        )
      case 'processed':
        return (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-300"
          >
            Analyzed
          </Badge>
        )
      default:
        return null
    }
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400'
    if (score >= 6) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 4) return 'text-amber-600 dark:text-amber-400'
    if (score >= 2) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Get final score color
  const getFinalScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 40) return 'text-amber-600 dark:text-amber-400'
    if (score >= 20) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Add a safety check for the commit object at the beginning of the component:
  if (!commit) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-medium">Commit Not Found</p>
        <p className="text-muted-foreground">
          The requested commit could not be loaded
        </p>
      </div>
    )
  }

  // Replace the radarData calculation with this safer version:
  // Format metrics data for radar chart
  const radarData = [
    { name: 'Correctness', value: commit?.correctness || 0, fullMark: 10 },
    { name: 'Readability', value: commit?.readability || 0, fullMark: 10 },
    { name: 'Best Practices', value: commit?.bestPractices || 0, fullMark: 10 },
    { name: 'Performance', value: commit?.performance || 0, fullMark: 10 },
    { name: 'Security', value: commit?.security || 0, fullMark: 10 },
    { name: 'DRYness', value: commit?.dryness || 0, fullMark: 10 },
    {
      name: 'Scope Discipline',
      value: commit?.scopeDiscipline || 0,
      fullMark: 10
    },
    { name: 'Testability', value: commit?.testability || 0, fullMark: 10 },
    { name: 'Impact-to-Noise', value: commit?.impactToNoise || 0, fullMark: 10 }
  ]

  // Replace the qualityMetrics calculation with this safer version:
  // Calculate quality average
  const qualityMetrics = [
    commit?.correctness || 0,
    commit?.readability || 0,
    commit?.bestPractices || 0,
    commit?.performance || 0,
    commit?.security || 0,
    commit?.dryness || 0,
    commit?.scopeDiscipline || 0,
    commit?.testability || 0,
    commit?.impactToNoise || 0
  ]

  // Calculate quality average
  const avgQuality =
    qualityMetrics.reduce((a, b) => a + b, 0) / qualityMetrics.length

  // Calculate scaled work complexity
  const workComplexity = commit.workComplexity || 0
  const scaledWorkComplexity = Math.pow(workComplexity / 10, 1.5) * 10

  // Calculate weighted components
  const workWeight = 0.4
  const qualityWeight = 0.6
  const qualityComponent = avgQuality * qualityWeight * 10
  const workComponent = scaledWorkComplexity * workWeight * 10

  // Pie chart data for score breakdown
  const pieData = [
    { name: 'Quality', value: qualityComponent, color: '#06b6d4' },
    { name: 'Work Complexity', value: workComponent, color: '#8b5cf6' }
  ]

  // Radial chart colors
  const COLORS = [
    '#06b6d4', // cyan-500
    '#0ea5e9', // sky-500
    '#3b82f6', // blue-500
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#a855f7', // purple-500
    '#d946ef', // fuchsia-500
    '#ec4899', // pink-500
    '#f43f5e' // rose-500
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <GitCommit className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
            <h1 className="text-2xl font-medium">
              Commit {commit.sha.substring(0, 7)}
            </h1>
            {getStatusBadge()}
          </div>
          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
            <span>{commit.authorEmail}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {commit.queueStatus === 'error' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              <RefreshCw
                className={`mr-1 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`}
              />
              Retry Analysis
            </Button>
          )}

          <Link href={commit.url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <GitBranch className="mr-1 h-4 w-4" />
              View on {commit.gitConnection.type}
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-border border dark:bg-black">
        <CardContent className="pt-6">
          <div className="flex flex-col items-start gap-6 md:flex-row">
            <div className="flex-1">
              <h2 className="mb-2 text-xl font-medium">Commit Message</h2>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                {commit.message}
              </div>
            </div>

            {commit.queueStatus === 'processed' && (
              <div className="flex flex-col items-center">
                <div className="text-muted-foreground mb-2 text-sm">
                  Noob Score
                </div>

                <div
                  className={`mt-2 text-3xl font-bold ${getFinalScoreColor(commit.finalScore)}`}
                >
                  {commit.finalScore}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {commit.queueStatus === 'processed' ? (
        <Tabs defaultValue="metrics" className="space-y-4">
          <TabsList className="bg-muted border-border border p-1">
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Quality Metrics
            </TabsTrigger>
            <TabsTrigger
              value="calculation"
              className="flex items-center gap-2"
            >
              <GitCommit className="h-4 w-4" />
              Score Calculation
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              AI Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-border border dark:bg-black">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Quality Metrics
                  </CardTitle>
                  <CardDescription>
                    Analysis of code quality dimensions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        data={radarData}
                      >
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis
                          dataKey="name"
                          tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 10]}
                          tick={{ fill: 'var(--foreground)' }}
                        />
                        <Radar
                          name="Score"
                          dataKey="value"
                          stroke="rgba(0, 210, 255, 0.8)"
                          fill="rgba(0, 210, 255, 0.3)"
                          fillOpacity={0.6}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--background)',
                            borderColor: 'var(--border)',
                            borderRadius: '0.5rem',
                            color: 'var(--foreground)'
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Code Quality */}
                <Card className="border-border border dark:bg-black">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Code Quality
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <MetricItem
                      name="Correctness"
                      value={commit.correctness || 0}
                      color={COLORS[0] || '06b6d4'}
                      description="Logic accuracy and bug-free code"
                    />
                    <MetricItem
                      name="Readability"
                      value={commit.readability || 0}
                      color={COLORS[1] || '06b6d4'}
                      description="Clean structure and understandability"
                    />
                    <MetricItem
                      name="Best Practices"
                      value={commit.bestPractices || 0}
                      color={COLORS[2] || '06b6d4'}
                      description="Following language/framework standards"
                    />
                  </CardContent>
                </Card>

                {/* Engineering */}
                <Card className="border-border border dark:bg-black">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Engineering
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <MetricItem
                      name="Performance"
                      value={commit.performance || 0}
                      color={COLORS[3] || '06b6d4'}
                      description="Efficiency and optimization"
                    />
                    <MetricItem
                      name="Security"
                      value={commit.security || 0}
                      color={COLORS[4] || '06b6d4'}
                      description="Protection against vulnerabilities"
                    />
                    <MetricItem
                      name="Testability"
                      value={commit.testability || 0}
                      color={COLORS[5] || '06b6d4'}
                      description="Ease of testing and validation"
                    />
                  </CardContent>
                </Card>

                {/* Structure */}
                <Card className="border-border border dark:bg-black">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <MetricItem
                      name="DRYness"
                      value={commit.dryness || 0}
                      color={COLORS[6] || '06b6d4'}
                      description="Avoiding code duplication"
                    />
                    <MetricItem
                      name="Scope Discipline"
                      value={commit.scopeDiscipline || 0}
                      color={COLORS[7] || '06b6d4'}
                      description="Focused, single-purpose changes"
                    />
                    <MetricItem
                      name="Impact-to-Noise"
                      value={commit.impactToNoise || 0}
                      color={COLORS[8] || '06b6d4'}
                      description="Meaningful changes per line of code"
                    />
                  </CardContent>
                </Card>

                {/* Work Complexity */}
                <Card className="border-border border dark:bg-black">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Work Complexity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm">Complexity</div>
                      <div
                        className={`font-bold ${getScoreColor(commit.workComplexity || 0)}`}
                      >
                        {commit.workComplexity || 0}/10
                      </div>
                    </div>
                    <div className="bg-muted h-4 overflow-hidden rounded-full">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                        style={{
                          width: `${(commit.workComplexity || 0) * 10}%`
                        }}
                      />
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs">
                      How substantial is the work done in this commit? Higher
                      scores indicate more complex features or architectural
                      changes.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calculation" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-border border dark:bg-black">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Score Breakdown
                  </CardTitle>
                  <CardDescription>
                    How the final score is calculated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={value => [
                            `${Number(value).toFixed(1)} points`,
                            null
                          ]}
                          contentStyle={{
                            backgroundColor: 'var(--background)',
                            borderColor: 'var(--border)',
                            borderRadius: '0.5rem',
                            color: 'var(--foreground)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border border dark:bg-black">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Calculation Formula
                  </CardTitle>
                  <CardDescription>
                    The exact formula used to calculate the final score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 font-medium">1. Quality Average</h3>
                      <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                        avgQuality = (correctness + readability + bestPractices
                        + performance + security + dryness + scopeDiscipline +
                        testability + impactToNoise) / 9
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Result:
                        </span>
                        <span className="font-medium">
                          {avgQuality.toFixed(2)} / 10
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 font-medium">
                        2. Scaled Work Complexity
                      </h3>
                      <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                        scaledWorkComplexity = Math.pow(workComplexity / 10,
                        1.5) * 10
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Result:
                        </span>
                        <span className="font-medium">
                          {scaledWorkComplexity.toFixed(2)} / 10
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 font-medium">
                        3. Weighted Components
                      </h3>
                      <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                        qualityComponent = avgQuality * 0.6 * 10
                        <br />
                        workComponent = scaledWorkComplexity * 0.4 * 10
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Quality Component:
                        </span>
                        <span className="font-medium">
                          {qualityComponent.toFixed(2)} points
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Work Component:
                        </span>
                        <span className="font-medium">
                          {workComponent.toFixed(2)} points
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 font-medium">4. Final Score</h3>
                      <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                        finalScore = Math.max(1, Math.min(100,
                        Math.round(qualityComponent + workComponent)))
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Result:
                        </span>
                        <span
                          className={`text-lg font-bold ${getFinalScoreColor(commit.finalScore)}`}
                        >
                          {commit.finalScore} / 100
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card className="border-border border dark:bg-black">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  AI Analysis Summary
                </CardTitle>
                <CardDescription>
                  AI-generated feedback on this commit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted border-border rounded-lg border p-4">
                  <p className="font-medium">
                    {commit.summary || 'No summary available'}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-medium">
                      <span className="inline-block h-3 w-3 rounded-full bg-green-500"></span>
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {commit.correctness >= 7 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-green-500">•</span>
                          <span>
                            Strong logical correctness and well-thought-out code
                          </span>
                        </li>
                      )}
                      {commit.readability >= 7 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-green-500">•</span>
                          <span>
                            Excellent readability with clear naming and
                            structure
                          </span>
                        </li>
                      )}
                      {commit.bestPractices >= 7 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-green-500">•</span>
                          <span>
                            Follows best practices and idiomatic code patterns
                          </span>
                        </li>
                      )}
                      {commit.performance >= 7 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-green-500">•</span>
                          <span>
                            Good performance awareness and optimization
                          </span>
                        </li>
                      )}
                      {commit.security >= 7 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-green-500">•</span>
                          <span>
                            Strong security considerations and practices
                          </span>
                        </li>
                      )}
                      {commit.dryness >= 7 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-green-500">•</span>
                          <span>Good code reuse and DRY principles</span>
                        </li>
                      )}
                      {commit.scopeDiscipline >= 7 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-green-500">•</span>
                          <span>Well-focused changes with clear scope</span>
                        </li>
                      )}
                      {commit.testability >= 7 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-green-500">•</span>
                          <span>Highly testable code structure</span>
                        </li>
                      )}
                      {commit.impactToNoise >= 7 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-green-500">•</span>
                          <span>
                            High impact-to-noise ratio with meaningful changes
                          </span>
                        </li>
                      )}
                      {commit.workComplexity >= 7 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-green-500">•</span>
                          <span>Substantial and complex work accomplished</span>
                        </li>
                      )}
                      {Object.values(commit).filter(
                        val => typeof val === 'number' && val >= 7
                      ).length === 0 && (
                        <li className="text-muted-foreground italic">
                          No notable strengths identified
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-medium">
                      <span className="inline-block h-3 w-3 rounded-full bg-red-500"></span>
                      Areas for Improvement
                    </h3>
                    <ul className="space-y-2">
                      {commit.correctness <= 4 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-red-500">•</span>
                          <span>
                            Logic issues and potential bugs in implementation
                          </span>
                        </li>
                      )}
                      {commit.readability <= 4 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-red-500">•</span>
                          <span>
                            Poor readability with confusing structure or naming
                          </span>
                        </li>
                      )}
                      {commit.bestPractices <= 4 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-red-500">•</span>
                          <span>
                            Doesn&apos;t follow language or framework best
                            practices
                          </span>
                        </li>
                      )}
                      {commit.performance <= 4 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-red-500">•</span>
                          <span>
                            Performance issues or inefficient code patterns
                          </span>
                        </li>
                      )}
                      {commit.security <= 4 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-red-500">•</span>
                          <span>
                            Security vulnerabilities or risky practices
                          </span>
                        </li>
                      )}
                      {commit.dryness <= 4 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-red-500">•</span>
                          <span>Excessive code duplication and repetition</span>
                        </li>
                      )}
                      {commit.scopeDiscipline <= 4 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-red-500">•</span>
                          <span>Too many unrelated changes in one commit</span>
                        </li>
                      )}
                      {commit.testability <= 4 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-red-500">•</span>
                          <span>Difficult to test or lacks testability</span>
                        </li>
                      )}
                      {commit.impactToNoise <= 4 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-red-500">•</span>
                          <span>
                            Low impact-to-noise ratio with unnecessary changes
                          </span>
                        </li>
                      )}
                      {commit.workComplexity <= 2 && (
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-red-500">•</span>
                          <span>
                            Trivial changes with minimal effort or impact
                          </span>
                        </li>
                      )}
                      {Object.values(commit).filter(
                        val => typeof val === 'number' && val <= 4
                      ).length === 0 && (
                        <li className="text-muted-foreground italic">
                          No significant areas for improvement
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex h-[300px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
          {commit.queueStatus === 'error' ? (
            <>
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="text-lg font-medium">Analysis Error</p>
              <p className="text-muted-foreground">
                {commit.errorMessage || 'An error occurred during analysis'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                <RefreshCw
                  className={`mr-1 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`}
                />
                Retry Analysis
              </Button>
            </>
          ) : (
            <>
              <Clock className="h-12 w-12 text-amber-500" />
              <p className="text-lg font-medium">Analysis Pending</p>
              <p className="text-muted-foreground">
                This commit is waiting to be analyzed
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function MetricItem({
  name,
  value,
  color,
  description
}: {
  name: string
  value: number
  color: string
  description: string
}) {
  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400'
    if (score >= 6) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 4) return 'text-amber-600 dark:text-amber-400'
    if (score >= 2) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <div className="text-sm">{name}</div>
        <div className={`font-bold ${getScoreColor(value)}`}>{value}/10</div>
      </div>
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div
          className="h-full"
          style={{ width: `${value * 10}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-muted-foreground mt-1 text-xs">{description}</p>
    </div>
  )
}
