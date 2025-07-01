'use client'

import {
  getAuthorDetailedStats,
  getPaginatedAuthors
} from '@/app/actions/author'
import { getRepositoryLeaderboardAction } from '@/app/actions/repo-metrics'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { elegantColors, getDiceBearAvatar, getNoobTitle } from '@/utils/helper'
import {
  ChevronLeft,
  ChevronRight,
  GitBranch,
  RefreshCw,
  Search,
  Skull,
  Trophy,
  User,
  Users
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import AuthorDetailsCard from './author-detail-card'
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
  commitsByCategory: { [category: string]: number }
  commitsByDomain: { [domain: string]: number }
  commitsByImpact: { [impact: string]: number }
  contributionPoints: number
  averageQualityMetrics: {
    correctness: number
    bestPractices: number
    readability: number
    performance: number
    security: number
    technicalQuality: number
  }
  logarithmicAdjustment: number
}

interface AuthorEntry {
  authorEmail: string
  avgScore: number
  commitCount: number
  bestScore: number
  worstScore: number
}

export function Leaderboard({ repositoryId, repository }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // For authors pagination
  const [authors, setAuthors] = useState<AuthorEntry[]>([])
  const [totalAuthors, setTotalAuthors] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState<any>(null)
  const [authorDetails, setAuthorDetails] = useState<any>(null)
  const [loadingAuthorDetails, setLoadingAuthorDetails] = useState(false)

  const loadLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getRepositoryLeaderboardAction(repositoryId)
      if (!result?.error) {
        const typedLeaderboard: LeaderboardEntry[] = (
          result?.leaderboard || []
        ).map((entry: any) => ({
          authorEmail: entry?.authorEmail || '',
          authorName: entry?.authorName || entry?.authorEmail?.split('@')[0],
          avatarUrl: entry?.avatarUrl || '',
          commitCount: Number(entry?.commitCount || 0),
          avgScore: Number(entry?.avgScore || 0),
          bestScore: Number(entry?.bestScore || 0),
          worstScore: Number(entry?.worstScore || 0),
          commitsByCategory: entry?.commitsByCategory || {},
          commitsByDomain: entry?.commitsByDomain || {},
          commitsByImpact: entry?.commitsByImpact || {},
          contributionPoints: Number(entry?.contributionPoints || 0),
          averageQualityMetrics: entry?.averageQualityMetrics || {
            correctness: 0,
            bestPractices: 0,
            readability: 0,
            performance: 0,
            security: 0,
            technicalQuality: 0
          },
          logarithmicAdjustment: Number(entry?.logarithmicAdjustment || 1)
        }))
        setLeaderboard(typedLeaderboard)
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }, [repositoryId])

  const loadAuthors = useCallback(async () => {
    setIsSearching(true)
    try {
      const result = await getPaginatedAuthors({
        repositoryId,
        page: currentPage,
        pageSize: 10,
        search: searchQuery
      })

      if (!result?.error) {
        setAuthors(result.authors || [])
        setTotalAuthors(result.totalAuthors || 0)
      }
    } catch (err) {
      console.error('Failed to load authors:', err)
    } finally {
      setIsSearching(false)
    }
  }, [repositoryId, currentPage, searchQuery])

  const loadAuthorDetails = async (authorEmail: string) => {
    setLoadingAuthorDetails(true)
    try {
      const details = await getAuthorDetailedStats(authorEmail, repositoryId)
      if (!details?.error) {
        setAuthorDetails(details)
      }
    } catch (err) {
      console.error('Failed to load author details:', err)
    } finally {
      setLoadingAuthorDetails(false)
    }
  }

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard, repositoryId])

  useEffect(() => {
    loadAuthors()
  }, [loadAuthors, currentPage])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([loadLeaderboard(), loadAuthors()])
    } finally {
      setRefreshing(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadAuthors()
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const getInitials = (email: string) => {
    return email?.split('@')[0]?.substring(0, 2)?.toUpperCase() || '??'
  }

  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-red-500'
    if (score < 70) return 'text-amber-500'
    return 'text-green-500'
  }

  const totalPages = Math.ceil(totalAuthors / 10)

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

      <Tabs defaultValue="all-authors" className="w-full">
        <TabsList className="bg-muted/50 mb-6 grid w-full grid-cols-2 rounded-xl p-1">
          <TabsTrigger
            value="leaderboard"
            className="data-[state=active]:bg-background flex items-center gap-2 rounded-lg transition-all data-[state=active]:shadow-sm"
          >
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>Top Offenders</span>
          </TabsTrigger>
          <TabsTrigger
            value="all-authors"
            className="data-[state=active]:bg-background flex items-center gap-2 rounded-lg transition-all data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4 text-cyan-500" />
            <span>All Authors</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6">
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

          <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <Card className="border-border col-span-full border p-6 shadow-sm">
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
              </Card>
            ) : leaderboard.length > 0 ? (
              leaderboard.slice(0, 5).map((entry, index) => (
                <AuthorDetailsCard
                  key={entry.authorEmail || `entry-${index}`}
                  author={{
                    authorEmail: entry.authorEmail,
                    avgScore: entry.avgScore,
                    rank: index + 1,
                    commitCount: entry.commitCount,
                    bestScore: entry.bestScore,
                    worstScore: entry.worstScore
                  }}
                  colorIndex={index % elegantColors.length}
                  commitsByCategory={entry.commitsByCategory}
                  commitsByDomain={entry.commitsByDomain}
                  commitsByImpact={entry.commitsByImpact}
                  averageQualityMetrics={entry.averageQualityMetrics}
                  contributionPoints={entry.contributionPoints}
                  logarithmicAdjustment={entry.logarithmicAdjustment}
                />
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
        </TabsContent>

        <TabsContent value="all-authors">
          <Card className="border-border overflow-hidden border shadow-sm">
            <CardHeader className="border-border bg-muted/20 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <Users className="h-5 w-5 text-cyan-500" />
                All Authors Leaderboard
              </CardTitle>
              <CardDescription>
                Complete list of all contributors ranked by their code quality
                score
              </CardDescription>

              <div className="mt-2 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by email..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px] text-center">
                        Rank
                      </TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead className="text-right">Noob Score</TableHead>
                      <TableHead className="text-center">Commits</TableHead>
                      <TableHead className="w-[100px] text-center">
                        Details
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isSearching ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <RefreshCw className="text-muted-foreground mx-auto h-6 w-6 animate-spin" />
                        </TableCell>
                      </TableRow>
                    ) : authors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No authors found
                        </TableCell>
                      </TableRow>
                    ) : (
                      authors.map((author, index) => {
                        const rank = (currentPage - 1) * 10 + index + 1
                        const colorIndex = index % elegantColors.length

                        return (
                          <TableRow
                            key={author.authorEmail}
                            className="group hover:bg-muted/50"
                          >
                            <TableCell className="text-center font-medium">
                              <Badge
                                variant="outline"
                                className="px-2 py-0.5"
                                style={{
                                  borderColor: elegantColors[colorIndex],
                                  color: elegantColors[colorIndex]
                                }}
                              >
                                #{rank}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border shadow-sm">
                                  <AvatarImage
                                    src={
                                      getDiceBearAvatar(
                                        author.authorEmail,
                                        index
                                      ) || '/placeholder.svg'
                                    }
                                  />
                                  <AvatarFallback
                                    style={{
                                      backgroundColor: `${elegantColors[colorIndex]}20`,
                                      color: elegantColors[colorIndex]
                                    }}
                                  >
                                    {getInitials(author.authorEmail)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {author.authorEmail.split('@')[0]}
                                  </div>
                                  <div className="text-muted-foreground max-w-[200px] truncate text-xs">
                                    {author.authorEmail}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span
                                      className={`font-medium ${getScoreColor(author.avgScore)}`}
                                    >
                                      {author.avgScore.toFixed(1)}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {getNoobTitle(rank - 1, author.avgScore)}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-medium">
                                {author.commitCount}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      setSelectedAuthor(author)
                                      loadAuthorDetails(author.authorEmail)
                                    }}
                                  >
                                    <User className="h-4 w-4" />
                                    <span className="sr-only">
                                      View Details
                                    </span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Author Profile</DialogTitle>
                                    <DialogDescription>
                                      Comprehensive analysis of{' '}
                                      {selectedAuthor?.authorEmail}
                                    </DialogDescription>
                                  </DialogHeader>

                                  {loadingAuthorDetails ? (
                                    <div className="flex items-center justify-center py-12">
                                      <RefreshCw className="text-muted-foreground h-8 w-8 animate-spin" />
                                    </div>
                                  ) : (
                                    authorDetails && (
                                      <AuthorDetailsCard
                                        author={{
                                          authorEmail:
                                            authorDetails.authorEmail,
                                          avgScore: authorDetails.weightedScore,
                                          rank: rank,
                                          commitCount:
                                            authorDetails.totalCommits,
                                          bestScore: authorDetails.bestScore,
                                          worstScore: authorDetails.worstScore
                                        }}
                                        colorIndex={colorIndex}
                                        commitsByCategory={
                                          authorDetails.commitsByCategory
                                        }
                                        commitsByDomain={
                                          authorDetails.commitsByDomain
                                        }
                                        commitsByImpact={
                                          authorDetails.commitsByImpact
                                        }
                                        averageQualityMetrics={
                                          authorDetails.averageQualityMetrics
                                        }
                                        contributionPoints={
                                          authorDetails.contributionPoints
                                        }
                                        logarithmicAdjustment={
                                          authorDetails.logarithmicAdjustment
                                        }
                                      />
                                    )
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination controls */}
              {totalPages > 0 && (
                <div className="flex items-center justify-between border-t px-4 py-4">
                  <div className="text-muted-foreground text-sm">
                    Showing{' '}
                    <span className="font-medium">{authors.length}</span> of{' '}
                    <span className="font-medium">{totalAuthors}</span> authors
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isSearching}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          // Show pages around current page
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? 'default' : 'outline'
                              }
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handlePageChange(pageNum)}
                              disabled={isSearching}
                            >
                              {pageNum}
                            </Button>
                          )
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isSearching}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
