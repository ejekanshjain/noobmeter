'use client'

import {
  getPaginatedAuthors,
  getRepositoryLeaderboard
} from '@/app/actions/repo-metrics'
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

interface AuthorEntry {
  authorEmail: string
  avgScore: number
}

export function Leaderboard({ repositoryId, repository }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // For authors pagination
  const [authors, setAuthors] = useState<AuthorEntry[]>([])
  const [totalAuthors, setTotalAuthors] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorEntry | null>(null)

  const loadLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getRepositoryLeaderboard(repositoryId)
      if (!result?.error) {
        const typedLeaderboard: LeaderboardEntry[] = (
          result?.leaderboard || []
        ).map((entry: any) => ({
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

  const loadAuthors = useCallback(async () => {
    setIsSearching(true)
    try {
      const result = await getPaginatedAuthors({
        repositoryId,
        page: currentPage,
        pageSize,
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
  }, [repositoryId, currentPage, pageSize, searchQuery])

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard, repositoryId])

  useEffect(() => {
    loadAuthors()
  }, [loadAuthors, currentPage, pageSize])

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

  const totalPages = Math.ceil(totalAuthors / pageSize)

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

      <Tabs defaultValue="leaderboard" className="w-full">
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
                          borderColor:
                            elegantColors[index % elegantColors.length],
                          color: elegantColors[index % elegantColors.length]
                        }}
                      >
                        #{index + 1}
                      </Badge>
                      <div className="text-sm font-medium">
                        <span className="text-muted-foreground mr-1">
                          Score:
                        </span>
                        <span
                          style={{
                            color: elegantColors[index % elegantColors.length]
                          }}
                        >
                          {Number(entry.avgScore).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-12 w-12 border shadow-sm"
                        style={{
                          borderColor:
                            elegantColors[index % elegantColors.length]
                        }}
                      >
                        <AvatarImage
                          src={
                            getDiceBearAvatar(entry.authorEmail, index) ||
                            '/placeholder.svg' ||
                            '/placeholder.svg' ||
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
                        <div className="text-muted-foreground text-xs">
                          Commits
                        </div>
                        <div className="font-medium">{entry.commitCount}</div>
                      </div>

                      <div className="bg-muted/30 rounded p-2">
                        <div className="text-muted-foreground text-xs">
                          Best
                        </div>
                        <div className="font-medium">
                          {Number(entry.bestScore).toFixed(1)}
                        </div>
                      </div>

                      <div className="bg-muted/30 rounded p-2">
                        <div className="text-muted-foreground text-xs">
                          Worst
                        </div>
                        <div className="font-medium">
                          {Number(entry.worstScore).toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                        <span>Noob Score</span>
                        <span>{Number(entry.avgScore).toFixed(1)}/100</span>
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
                      <TableHead className="w-[100px] text-center">
                        Details
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isSearching ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <RefreshCw className="text-muted-foreground mx-auto h-6 w-6 animate-spin" />
                        </TableCell>
                      </TableRow>
                    ) : authors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No authors found
                        </TableCell>
                      </TableRow>
                    ) : (
                      authors.map((author, index) => {
                        const rank = (currentPage - 1) * pageSize + index + 1
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
                                      {Number(author.avgScore).toFixed(1)}
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
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setSelectedAuthor(author)}
                                  >
                                    <User className="h-4 w-4" />
                                    <span className="sr-only">
                                      View Details
                                    </span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Author Details</DialogTitle>
                                    <DialogDescription>
                                      Detailed information about this
                                      contributor
                                    </DialogDescription>
                                  </DialogHeader>

                                  {selectedAuthor && (
                                    <div className="space-y-4 py-4">
                                      <div className="flex items-center gap-4">
                                        <Avatar
                                          className="h-16 w-16 border-2"
                                          style={{
                                            borderColor:
                                              elegantColors[colorIndex]
                                          }}
                                        >
                                          <AvatarImage
                                            src={
                                              getDiceBearAvatar(
                                                selectedAuthor.authorEmail,
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
                                            {getInitials(
                                              selectedAuthor.authorEmail
                                            )}
                                          </AvatarFallback>
                                        </Avatar>

                                        <div>
                                          <h3 className="text-lg font-semibold">
                                            {
                                              selectedAuthor.authorEmail.split(
                                                '@'
                                              )[0]
                                            }
                                          </h3>
                                          <p className="text-muted-foreground text-sm">
                                            {selectedAuthor.authorEmail}
                                          </p>
                                          <p className="mt-1 text-sm">
                                            Rank:{' '}
                                            <span className="font-medium">
                                              #{rank}
                                            </span>
                                          </p>
                                        </div>
                                      </div>

                                      <div className="bg-muted/30 rounded-lg p-4">
                                        <h4 className="mb-2 font-medium">
                                          Noob Score Analysis
                                        </h4>
                                        <div className="space-y-3">
                                          <div>
                                            <div className="mb-1 flex justify-between text-sm">
                                              <span>Overall Score</span>
                                              <span
                                                className={getScoreColor(
                                                  selectedAuthor.avgScore
                                                )}
                                              >
                                                {Number(
                                                  selectedAuthor.avgScore
                                                ).toFixed(1)}
                                                /100
                                              </span>
                                            </div>
                                            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                              <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                  width: `${Math.max(3, selectedAuthor.avgScore)}%`,
                                                  backgroundColor:
                                                    elegantColors[colorIndex]
                                                }}
                                              />
                                            </div>
                                          </div>

                                          <div className="pt-2">
                                            <h5 className="mb-2 text-sm font-medium">
                                              Noob Title
                                            </h5>
                                            <Badge
                                              className="px-3 py-1 text-sm"
                                              style={{
                                                backgroundColor: `${elegantColors[colorIndex]}20`,
                                                color:
                                                  elegantColors[colorIndex],
                                                borderColor:
                                                  elegantColors[colorIndex]
                                              }}
                                              variant="outline"
                                            >
                                              {getNoobTitle(
                                                rank - 1,
                                                selectedAuthor.avgScore
                                              )}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="text-muted-foreground text-sm italic">
                                        Note: View the Top Offenders tab for
                                        more detailed statistics on this
                                        author&apos;s commits.
                                      </div>
                                    </div>
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
                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground text-sm">
                      Showing{' '}
                      <span className="font-medium">{authors.length}</span> of{' '}
                      <span className="font-medium">{totalAuthors}</span>{' '}
                      authors
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        Show:
                      </span>
                      <select
                        className="bg-background border-input rounded-md border px-2 py-1 text-sm"
                        value={pageSize}
                        onChange={e => {
                          setPageSize(Number(e.target.value))
                          setCurrentPage(1)
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
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
