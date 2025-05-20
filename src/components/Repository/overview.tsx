'use client'

import type React from 'react'

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
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
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

  const pastelColors = [
    '#E0F7FA',
    '#B2EBF2',
    '#80DEEA',
    '#4DD0E1',
    '#26C6DA',
    '#00BCD4',
    '#00ACC1',
    '#0097A7',
    '#00838F'
  ]

  const radialBarData = metrics
    ? [
        {
          name: 'Correctness',
          value: metrics.avgCorrectness || 0,
          fill: pastelColors[8]
        },
        {
          name: 'Readability',
          value: metrics.avgReadability || 0,
          fill: pastelColors[7]
        },
        {
          name: 'Best Practices',
          value: metrics.avgBestPractices || 0,
          fill: pastelColors[6]
        },
        {
          name: 'Performance',
          value: metrics.avgPerformance || 0,
          fill: pastelColors[5]
        },
        {
          name: 'Security',
          value: metrics.avgSecurity || 0,
          fill: pastelColors[4]
        },
        {
          name: 'DRYness',
          value: metrics.avgDryness || 0,
          fill: pastelColors[3]
        },
        {
          name: 'Scope Discipline',
          value: metrics.avgScopeDiscipline || 0,
          fill: pastelColors[2]
        },
        {
          name: 'Testability',
          value: metrics.avgTestability || 0,
          fill: pastelColors[1]
        },
        {
          name: 'Impact-to-Noise',
          value: metrics.avgImpactToNoise || 0,
          fill: pastelColors[0]
        }
      ]
    : []

  const barChartData = radialBarData.map(item => ({
    ...item,
    value: item.value * 10
  }))

  // Restructure data for area chart
  const areaChartData = barChartData.map(item => ({
    name: item.name,
    value: item.value,
    fill: item.fill
  }))

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
          value={Number(metrics?.avgFinalScore || 0).toFixed(1)}
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
          {areaChartData.some(item => item.value > 0) ? (
            <Card className="border-border border dark:bg-black">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Code Quality Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={areaChartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 5
                      }}
                    >
                      <defs>
                        {areaChartData.map((entry, index) => (
                          <linearGradient
                            key={`gradient-${index}`}
                            id={`colorGradient-${index}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={entry.fill || '#00BCD4'}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor={entry.fill || '#00BCD4'}
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: 'var(--foreground)' }}
                        tickLine={{ stroke: 'var(--border)' }}
                        axisLine={{ stroke: 'var(--border)' }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: 'var(--foreground)' }}
                        tickLine={{ stroke: 'var(--border)' }}
                        axisLine={{ stroke: 'var(--border)' }}
                        label={{
                          value: 'Score',
                          angle: -90,
                          position: 'insideLeft',
                          style: {
                            textAnchor: 'middle',
                            fill: 'var(--foreground)'
                          }
                        }}
                      />
                      <Tooltip
                        formatter={value => [
                          `${(Number(value) / 10).toFixed(1)} / 10`,
                          'Score'
                        ]}
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          borderRadius: '0.5rem',
                          color: 'var(--foreground)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          paddingTop: '10px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        name="Score"
                        stroke="#00BCD4"
                        fillOpacity={1}
                        fill="url(#colorGradient-0)"
                        activeDot={{
                          r: 8,
                          stroke: '#00838F',
                          strokeWidth: 2,
                          fill: '#4DD0E1'
                        }}
                        animationDuration={1500}
                        animationEasing="ease-in-out"
                      />
                    </AreaChart>
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
                Commits will appear once they&apos;ve been pushed to this
                repository
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
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground mt-1 flex items-center text-xs">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
