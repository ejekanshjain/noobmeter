'use client'

import { getRepositoryLeaderboard } from '@/app/actions/repo-metrics'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Award,
  GitBranch,
  Medal,
  RefreshCw,
  Skull,
  Trophy,
  User
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface LeaderboardProps {
  repositoryId: string
  repository: any
}

interface LeaderboardEntry {
  authorEmail: string
  authorName?: string
  avatarUrl?: string
  commitCount: number
  avgScore: number
  bestScore: number
  worstScore: number
}

export function Leaderboard({ repositoryId, repository }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadLeaderboard()
  }, [repositoryId])

  async function loadLeaderboard() {
    setLoading(true)
    try {
      const result = await getRepositoryLeaderboard(repositoryId)
      if (!result.error) {
        setLeaderboard(result.leaderboard || [])
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadLeaderboard()
    } finally {
      setRefreshing(false)
    }
  }

  // Get initials from email
  const getInitials = (email: string) => {
    return email.split('@')[0]?.substring(0, 2).toUpperCase()
  }

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 dark:text-green-400'
    if (score >= 60) return 'text-emerald-500 dark:text-emerald-400'
    if (score >= 40) return 'text-amber-500 dark:text-amber-400'
    if (score >= 20) return 'text-orange-500 dark:text-orange-400'
    return 'text-red-500 dark:text-red-400'
  }

  // Get rank icon
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Skull className="h-6 w-6 text-red-500 dark:text-red-400" />
      case 1:
        return (
          <Skull className="h-6 w-6 text-orange-500 dark:text-orange-400" />
        )
      case 2:
        return <Skull className="h-5 w-5 text-amber-500 dark:text-amber-400" />
      case 3:
        return (
          <Medal className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
        )
      case 4:
        return <Trophy className="h-5 w-5 text-green-500 dark:text-green-400" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  // Get rank title
  const getRankTitle = (index: number, score: number) => {
    if (index === 0) return 'Ultimate Noob'
    if (index === 1) return 'Major Noob'
    if (index === 2) return 'Certified Noob'
    if (index === 3) return 'Improving'
    if (index === 4) return 'Almost Pro'
    return score < 40 ? 'Noob' : 'Pro'
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
            <h1 className="text-2xl font-medium">{repository.project}</h1>
          </div>
          <p className="text-muted-foreground text-sm">Noobness leaderboard</p>
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

      <Card className="border-border border dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
            Top 5 Noobs
          </CardTitle>
          <CardDescription>
            The most notorious code offenders ranked by their noobness
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-8">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div key={entry.authorEmail} className="relative">
                  {/* Rank badge */}
                  <div className="absolute -top-4 -left-4 z-10 flex items-center justify-center">
                    <div className="bg-background border-border rounded-full border p-2 shadow-lg">
                      {getRankIcon(index)}
                    </div>
                  </div>

                  <div className="bg-muted/30 dark:bg-muted/10 border-border relative overflow-hidden rounded-lg border p-6 pt-8">
                    {/* Background pattern */}
                    <div className="pointer-events-none absolute inset-0 opacity-5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                      >
                        <defs>
                          <pattern
                            id={`noobPattern${index}`}
                            patternUnits="userSpaceOnUse"
                            width="20"
                            height="20"
                            patternTransform="rotate(45)"
                          >
                            <rect width="2" height="2" fill="currentColor" />
                          </pattern>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill={`url(#noobPattern${index})`}
                        />
                      </svg>
                    </div>

                    <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center">
                      <div className="flex items-center gap-4">
                        <Avatar className="border-border h-16 w-16 border-2 shadow-lg">
                          <AvatarImage
                            src={entry.avatarUrl || '/placeholder.svg'}
                          />
                          <AvatarFallback className="bg-cyan-100 text-cyan-500 dark:bg-cyan-900 dark:text-cyan-300">
                            {getInitials(entry.authorEmail)}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-bold">
                              {entry.authorName}
                            </div>
                            <Badge variant="outline" className="ml-1">
                              {getRankTitle(index, entry.avgScore)}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <User className="h-3 w-3" />
                            <span>{entry.authorEmail}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid flex-1 grid-cols-2 gap-4 md:mt-0 md:grid-cols-4">
                        <div className="bg-background border-border flex flex-col items-center rounded border p-2">
                          <div className="text-muted-foreground text-xs">
                            Commits
                          </div>
                          <div className="text-lg font-bold">
                            {entry.commitCount}
                          </div>
                        </div>

                        <div className="bg-background border-border flex flex-col items-center rounded border p-2">
                          <div className="text-muted-foreground text-xs">
                            Best Score
                          </div>
                          <div
                            className={`text-lg font-bold ${getScoreColor(entry.bestScore)}`}
                          >
                            {entry.bestScore.toFixed(0)}
                          </div>
                        </div>

                        <div className="bg-background border-border flex flex-col items-center rounded border p-2">
                          <div className="text-muted-foreground text-xs">
                            Worst Score
                          </div>
                          <div
                            className={`text-lg font-bold ${getScoreColor(entry.worstScore)}`}
                          >
                            {entry.worstScore.toFixed(0)}
                          </div>
                        </div>

                        <div className="bg-background border-border flex flex-col items-center rounded border p-2">
                          <div className="text-muted-foreground text-xs">
                            Avg Score
                          </div>
                          <div
                            className={`text-lg font-bold ${getScoreColor(entry.avgScore)}`}
                          >
                            {entry.avgScore.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
              <p className="text-muted-foreground">
                No data available for leaderboard
              </p>
              <p className="text-muted-foreground/70 text-sm">
                Leaderboard will appear once commits have been analyzed
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
