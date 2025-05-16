'use client'

import {
  getRepositoryCommits,
  getRepositoryMetrics
} from '@/app/actions/repo-metrics'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, GitBranch, GitCommit, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { CommitCard } from '../Dashboard/commit-card'

interface RepositoryOverviewProps {
  repositoryId: string
  repository: any
}

export function RepositoryOverview({
  repositoryId,
  repository
}: RepositoryOverviewProps) {
  const [metrics, setMetrics] = useState<any>(null)
  const [commits, setCommits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    async function loadRepositoryData() {
      setLoading(true)
      try {
        const [metricsResult, commitsResult] = await Promise.all([
          getRepositoryMetrics(repositoryId),
          getRepositoryCommits(repositoryId, 10)
        ])

        if (!metricsResult.error) {
          setMetrics(metricsResult.metrics || {})
        }

        if (!commitsResult.error) {
          setCommits(commitsResult.commits || [])
        }
      } catch (err) {
        console.error('Failed to load repository data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (repositoryId) {
      loadRepositoryData()
    }
  }, [repositoryId])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const [metricsResult, commitsResult] = await Promise.all([
        getRepositoryMetrics(repositoryId),
        getRepositoryCommits(repositoryId, 10)
      ])

      if (!metricsResult.error) {
        setMetrics(metricsResult.metrics || {})
      }

      if (!commitsResult.error) {
        setCommits(commitsResult.commits || [])
      }
    } catch (err) {
      console.error('Failed to refresh repository data:', err)
    } finally {
      setRefreshing(false)
    }
  }

  // Format metrics data for radar chart
  const radarData = metrics
    ? [
        {
          name: 'Correctness',
          value: metrics.avgCorrectness || 0,
          fullMark: 10
        },
        {
          name: 'Readability',
          value: metrics.avgReadability || 0,
          fullMark: 10
        },
        {
          name: 'Best Practices',
          value: metrics.avgBestPractices || 0,
          fullMark: 10
        },
        {
          name: 'Performance',
          value: metrics.avgPerformance || 0,
          fullMark: 10
        },
        { name: 'Security', value: metrics.avgSecurity || 0, fullMark: 10 },
        { name: 'DRYness', value: metrics.avgDryness || 0, fullMark: 10 },
        {
          name: 'Scope Discipline',
          value: metrics.avgScopeDiscipline || 0,
          fullMark: 10
        },
        {
          name: 'Testability',
          value: metrics.avgTestability || 0,
          fullMark: 10
        },
        {
          name: 'Impact-to-Noise',
          value: metrics.avgImpactToNoise || 0,
          fullMark: 10
        }
      ]
    : []

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
        </div>

        <Skeleton className="h-[400px] rounded-lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
            <h1 className="text-2xl font-medium">{repository.project}</h1>
          </div>
          <p className="text-muted-foreground text-sm">{repository.host}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            className={`mr-1 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatsCard
          title="Noob Score"
          value={(metrics?.avgFinalScore || 0).toFixed(1)}
          description="Average code quality score"
          icon={<BarChart3 className="h-4 w-4" />}
          trend={metrics?.avgFinalScore >= 50 ? 'up' : 'down'}
        />
        <StatsCard
          title="Total Commits"
          value={metrics?.totalCommits?.toString() || '0'}
          description="Analyzed commits"
          icon={<GitCommit className="h-4 w-4" />}
          trend="up"
        />
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="bg-muted border-border border p-1">
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="commits" className="flex items-center gap-2">
            <GitCommit className="h-4 w-4" />
            Recent Commits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          {radarData.some(item => item.value > 0) ? (
            <Card className="border-border border dark:bg-black">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Code Quality Metrics
                </CardTitle>
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
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
              <p className="text-muted-foreground">No metrics available yet</p>
              <p className="text-muted-foreground/70 text-sm">
                Metrics will appear once commits have been analyzed
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="commits" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Recent Commits</h2>
          </div>

          {commits && commits.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {commits.map(commit => (
                <CommitCard
                  key={commit.id}
                  commit={{
                    ...commit,
                    metrics: {
                      correctness: commit.correctness || 0,
                      readability: commit.readability || 0,
                      bestPractices: commit.bestPractices || 0,
                      performance: commit.performance || 0,
                      security: commit.security || 0,
                      dryness: commit.dryness || 0,
                      scopeDiscipline: commit.scopeDiscipline || 0,
                      testability: commit.testability || 0,
                      impactToNoise: commit.impactToNoise || 0,
                      workComplexity: commit.workComplexity || 0,
                      finalScore: commit.finalScore || 0
                    },
                    date: commit.date
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
              <p className="text-muted-foreground">No commits available yet</p>
              <p className="text-muted-foreground/70 text-sm">
                Commits will appear once they've been pushed to this repository
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatsCard({
  title,
  value,
  description,
  icon
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend: 'up' | 'down'
}) {
  return (
    <Card className="border-border border dark:bg-black">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </div>
        <p className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
