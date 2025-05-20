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
import { elegantColors, getDiceBearAvatar, getNoobTitle } from '@/utils/helper'
import { GitBranch, RefreshCw, Skull, Trophy, User } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import PodiumChart from './podium-chart'

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

  const loadLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getRepositoryLeaderboard(repositoryId)
      if (!result?.error) {
        const typedLeaderboard: LeaderboardEntry[] = (result?.leaderboard || [])
          .filter((entry: any) => entry?.authorEmail !== 'yjhala58@gmail.com')
          .map((entry: any) => ({
            authorEmail: entry?.authorEmail || '',
            authorName: entry?.authorName,
            avatarUrl: entry?.avatarUrl || '',
            commitCount: Number(entry?.commitCount || 0),
            avgScore: Number(entry?.avgScore || 0),
            bestScore: Number(entry?.bestScore || 0),
            worstScore: Number(entry?.worstScore || 0)
          }))
        setLeaderboard(typedLeaderboard)
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }, [repositoryId])

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard, repositoryId])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadLeaderboard()
    } finally {
      setRefreshing(false)
    }
  }

  const getInitials = (email: string) => {
    return email?.split('@')[0]?.substring(0, 2)?.toUpperCase() || '??'
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
            <h1 className="text-2xl font-medium">{repository?.project}</h1>
          </div>
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <Skull className="h-4 w-4" /> NoobMeter Leaderboard{' '}
            <Skull className="h-4 w-4" />
          </p>
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

      {leaderboard.length > 0 && (
        <Card className="border-border overflow-hidden border shadow-sm">
          <CardHeader className="border-border bg-muted/20 border-b pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Trophy className="h-5 w-5 text-amber-500" />
              The Wall of Shame
            </CardTitle>
            <CardDescription>
              Top 5 code offenders ranked by noobness (lower is worse)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[520px] w-full">
              <PodiumChart data={leaderboard} barColors={elegantColors} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <Card className="border-border col-span-full border p-6 shadow-sm">
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          </Card>
        ) : leaderboard.length > 0 ? (
          leaderboard.slice(0, 5).map((entry, index) => (
            <Card
              key={entry.authorEmail || `entry-${index}`}
              className="border-border group relative overflow-hidden border transition-all duration-300 hover:shadow-md"
            >
              <div
                className="absolute inset-0 opacity-10 transition-opacity duration-300 group-hover:opacity-20"
                style={{
                  background: `linear-gradient(135deg, ${elegantColors[index % elegantColors.length]}20 0%, transparent 100%)`
                }}
              />

              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="px-2 py-0.5"
                    style={{
                      borderColor: elegantColors[index % elegantColors.length],
                      color: elegantColors[index % elegantColors.length]
                    }}
                  >
                    #{index + 1}
                  </Badge>
                  <div className="text-sm font-medium">
                    <span className="text-muted-foreground mr-1">Score:</span>
                    <span
                      style={{
                        color: elegantColors[index % elegantColors.length]
                      }}
                    >
                      {entry.avgScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar
                    className="h-12 w-12 border shadow-sm"
                    style={{
                      borderColor: elegantColors[index % elegantColors.length]
                    }}
                  >
                    <AvatarImage
                      src={
                        getDiceBearAvatar(entry.authorEmail, index) ||
                        '/placeholder.svg'
                      }
                    />
                    <AvatarFallback
                      style={{
                        backgroundColor: `${elegantColors[index % elegantColors.length]}20`,
                        color: elegantColors[index % elegantColors.length]
                      }}
                    >
                      {getInitials(entry.authorEmail || '')}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-medium">
                      {entry.authorName || 'Unknown User'}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {getNoobTitle(index, entry.avgScore)}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <User className="h-3 w-3" />
                      <span className="max-w-[180px] truncate">
                        {entry.authorEmail || 'unknown@example.com'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-muted/30 rounded p-2">
                    <div className="text-muted-foreground text-xs">Commits</div>
                    <div className="font-medium">{entry.commitCount}</div>
                  </div>

                  <div className="bg-muted/30 rounded p-2">
                    <div className="text-muted-foreground text-xs">Best</div>
                    <div className="font-medium">
                      {entry.bestScore.toFixed(1)}
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded p-2">
                    <div className="text-muted-foreground text-xs">Worst</div>
                    <div className="font-medium">
                      {entry.worstScore.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                    <span>Noob Score</span>
                    <span>{entry.avgScore.toFixed(1)}/100</span>
                  </div>
                  <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(3, entry.avgScore)}%`,
                        backgroundColor:
                          elegantColors[index % elegantColors.length]
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-border col-span-full border p-6">
            <div className="flex h-40 flex-col items-center justify-center gap-4">
              <p className="text-muted-foreground">
                No data available for leaderboard
              </p>
              <p className="text-muted-foreground/70 text-sm">
                Leaderboard will appear once commits have been analyzed
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
