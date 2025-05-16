'use client'

import { getRepositoryCommits } from '@/app/actions/repo-metrics'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Filter, GitBranch, GitCommit, RefreshCw, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { CommitCard } from '../repositories/commit-card'

interface CommitsListProps {
  repositoryId: string
  repository: any
}

export function CommitsList({ repositoryId, repository }: CommitsListProps) {
  const [commits, setCommits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0
  })
  const [authors, setAuthors] = useState<string[]>([])

  const loadCommits = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getRepositoryCommits(
        repositoryId,
        pagination.limit,
        pagination.offset
      )
      if (!result.error) {
        setCommits(result.commits || [])
        setPagination(prev => ({
          ...prev,
          total: Number(prev.total)
        }))

        const uniqueAuthors = Array.from(
          new Set(result.commits?.map((commit: any) => commit.authorEmail))
        )
        setAuthors(uniqueAuthors)
      }
    } catch (err) {
      console.error('Failed to load commits:', err)
    } finally {
      setLoading(false)
    }
  }, [pagination, repositoryId])

  useEffect(() => {
    loadCommits()
  }, [repositoryId, pagination.offset, loadCommits])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadCommits()
    } finally {
      setRefreshing(false)
    }
  }

  const handlePrevPage = () => {
    if (pagination.offset - pagination.limit >= 0) {
      setPagination({
        ...pagination,
        offset: pagination.offset - pagination.limit
      })
    }
  }

  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination({
        ...pagination,
        offset: pagination.offset + pagination.limit
      })
    }
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1

  const filteredCommits = commits.filter(commit => {
    const matchesSearch =
      commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commit.sha.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesAuthor = !authorFilter || commit.authorEmail === authorFilter

    const matchesDate =
      !dateFilter ||
      new Date(commit.date).toDateString() === dateFilter.toDateString()

    return matchesSearch && matchesAuthor && matchesDate
  })

  const hasActiveFilters = searchQuery || authorFilter || dateFilter

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-slate-400" />
            <h1 className="text-xl font-medium text-slate-900 dark:text-slate-100">
              {repository.project}
            </h1>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Commit history and analysis
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-8 gap-1.5 rounded-md px-2 text-xs"
        >
          <RefreshCw
            className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-medium text-slate-900 dark:text-slate-100">
                <GitCommit className="h-4 w-4 text-slate-400" />
                Commits
              </CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">
                Showing {pagination.offset + 1}-
                {Math.min(
                  pagination.offset + pagination.limit,
                  pagination.total
                )}{' '}
                of {pagination.total} commits
              </p>
            </div>

            <div className="flex gap-2">
              <div className="relative min-w-[180px] flex-1">
                <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search commits..."
                  className="h-8 border-slate-200 pl-8 text-xs dark:border-slate-700"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-8 w-8 border-slate-200 dark:border-slate-700 ${
                      hasActiveFilters
                        ? 'border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
                        : ''
                    }`}
                  >
                    <Filter
                      className={`h-3.5 w-3.5 ${
                        hasActiveFilters
                          ? 'text-slate-900 dark:text-slate-100'
                          : 'text-slate-500'
                      }`}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel className="text-xs font-medium">
                    Filter Commits
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="flex flex-col items-start p-2">
                      <span className="mb-1 text-xs font-medium text-slate-500">
                        Author
                      </span>
                      <Select
                        value={authorFilter}
                        onValueChange={setAuthorFilter}
                      >
                        <SelectTrigger className="h-8 w-full border-slate-200 text-xs dark:border-slate-700">
                          <SelectValue placeholder="All authors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All authors</SelectItem>
                          {authors.map(author => (
                            <SelectItem key={author} value={author}>
                              {author}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex flex-col items-start p-2">
                      <span className="mb-1 text-xs font-medium text-slate-500">
                        Date
                      </span>
                      <DatePicker
                        date={dateFilter}
                        setDate={setDateFilter}
                        placeholder="Filter by date"
                      />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  {hasActiveFilters && (
                    <DropdownMenuItem
                      className="justify-center text-xs text-rose-500 focus:text-rose-600"
                      onClick={() => {
                        setSearchQuery('')
                        setAuthorFilter('')
                        setDateFilter(undefined)
                      }}
                    >
                      Clear all filters
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCommits.length > 0 ? (
            <div className="">
              {filteredCommits.map(commit => (
                <div key={commit.id} className="p-3">
                  <CommitCard
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
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center gap-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-500">
                No commits found matching your filters
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setAuthorFilter('')
                    setDateFilter(undefined)
                  }}
                  className="h-7 text-xs"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {pagination.total > pagination.limit &&
            filteredCommits.length > 0 && (
              <div className="border-t border-slate-100 p-3 dark:border-slate-800">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={handlePrevPage}
                        className={
                          pagination.offset === 0
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageToShow = i + 1
                      if (totalPages > 5) {
                        if (currentPage > 3) {
                          pageToShow = currentPage - 3 + i + 1
                        }
                        if (pageToShow > totalPages) {
                          pageToShow = totalPages - (4 - i)
                        }
                      }

                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={currentPage === pageToShow}
                            onClick={() => {
                              setPagination({
                                ...pagination,
                                offset: (pageToShow - 1) * pagination.limit
                              })
                            }}
                            className="h-8 w-8 text-xs"
                          >
                            {pageToShow}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={handleNextPage}
                        className={
                          pagination.offset + pagination.limit >=
                          pagination.total
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
