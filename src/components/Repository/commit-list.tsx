'use client'

import { getRepositoryCommits } from '@/app/actions/repo-metrics'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
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
import {
  Calendar,
  GitBranch,
  GitCommit,
  RefreshCw,
  Search,
  User,
  X
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { CommitCard } from '../Dashboard/commit-card'

interface CommitsListProps {
  repositoryId: string
  repository: any
}

interface FilterFormValues {
  searchQuery: string
  authorFilter: string
  dateFilter: Date | undefined
}

export function CommitsList({ repositoryId, repository }: CommitsListProps) {
  const [commits, setCommits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0
  })
  const [authors, setAuthors] = useState<string[]>([])

  // Set up React Hook Form
  const form = useForm<FilterFormValues>({
    defaultValues: {
      searchQuery: '',
      authorFilter: '',
      dateFilter: undefined
    }
  })

  // Get current form values
  const { searchQuery, authorFilter, dateFilter } = form.watch()

  // Memoize the current page and total pages calculations
  const { currentPage, totalPages } = useMemo(() => {
    return {
      currentPage: Math.floor(pagination.offset / pagination.limit) + 1,
      totalPages: Math.ceil(pagination.total / pagination.limit)
    }
  }, [pagination.offset, pagination.limit, pagination.total])

  // Debounce search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Define loadCommits with useCallback to prevent re-renders
  const loadCommits = useCallback(async () => {
    setLoading(true)
    try {
      const filters = {
        searchQuery: debouncedSearchQuery,
        authorFilter: authorFilter === 'all' ? '' : authorFilter,
        dateFilter: dateFilter ? dateFilter.toISOString().split('T')[0] : ''
      }

      const result = await getRepositoryCommits(
        repositoryId,
        pagination.limit,
        pagination.offset,
        filters
      )

      if (!result.error) {
        setCommits(result.commits || [])
        setPagination(prev => ({
          ...prev,
          total: result.pagination?.total || prev.total
        }))

        if (result.authors) {
          setAuthors(result.authors)
        }
      }
    } catch (err) {
      console.error('Failed to load commits:', err)
    } finally {
      setLoading(false)
    }
  }, [
    repositoryId,
    pagination.limit,
    pagination.offset,
    debouncedSearchQuery,
    authorFilter,
    dateFilter
  ])

  // Load commits when filters or pagination changes
  useEffect(() => {
    if (repositoryId) {
      loadCommits()
    }
  }, [loadCommits, repositoryId])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    loadCommits().finally(() => setRefreshing(false))
  }, [loadCommits])

  const handlePrevPage = useCallback(() => {
    if (pagination.offset - pagination.limit >= 0) {
      setPagination(prev => ({
        ...prev,
        offset: prev.offset - prev.limit
      }))
    }
  }, [pagination.limit, pagination.offset])

  const handleNextPage = useCallback(() => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination(prev => ({
        ...prev,
        offset: prev.offset + prev.limit
      }))
    }
  }, [pagination.limit, pagination.offset, pagination.total])

  const clearFilters = useCallback(() => {
    form.reset({
      searchQuery: '',
      authorFilter: '',
      dateFilter: undefined
    })

    // Reset to first page when clearing filters
    setPagination(prev => ({
      ...prev,
      offset: 0
    }))
  }, [form])

  // Memoize the filtered commits to prevent unnecessary re-renders
  const memoizedCommits = useMemo(() => {
    return commits.map(commit => ({
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
    }))
  }, [commits])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-teal-500 dark:text-teal-400" />
            <h1 className="text-2xl font-medium">{repository.project}</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Commit history and analysis
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

      <Card className="border-border border dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            Commits
          </CardTitle>
          <CardDescription>
            {pagination.total > 0 ? (
              <>
                Showing {pagination.offset + 1}-
                {Math.min(
                  pagination.offset + pagination.limit,
                  pagination.total
                )}{' '}
                of {pagination.total} commits
              </>
            ) : (
              'No commits found'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="mb-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Controller
                  control={form.control}
                  name="searchQuery"
                  render={({ field }) => (
                    <div className="relative">
                      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                      <Input
                        placeholder="Search commits..."
                        className="pl-10"
                        {...field}
                      />
                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 transform p-0"
                          onClick={() => form.setValue('searchQuery', '')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="flex gap-2">
                <div className="w-48">
                  <Controller
                    control={form.control}
                    name="authorFilter"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <div className="flex items-center gap-2">
                            <User className="text-muted-foreground h-4 w-4" />
                            <SelectValue placeholder="Filter by author" />
                          </div>
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
                    )}
                  />
                </div>

                <div className="w-48">
                  <Controller
                    control={form.control}
                    name="dateFilter"
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        placeholder="Filter by date"
                        icon={
                          <Calendar className="text-muted-foreground h-4 w-4" />
                        }
                      />
                    )}
                  />
                </div>

                {(searchQuery || authorFilter || dateFilter) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </form>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : memoizedCommits.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {memoizedCommits.map(commit => (
                <CommitCard key={commit.id} commit={commit} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
              <p className="text-muted-foreground">
                No commits found matching your filters
              </p>
              {(searchQuery || authorFilter || dateFilter) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {pagination.total > pagination.limit &&
            memoizedCommits.length > 0 && (
              <div className="mt-6 flex justify-center">
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
                              setPagination(prev => ({
                                ...prev,
                                offset: (pageToShow - 1) * prev.limit
                              }))
                            }}
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
