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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { ArrowLeft, GitBranch, GitCommit, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CommitCard } from './commit-card'

interface RepositoryCommitsProps {
  repositoryId: string
  repository: any
}

export function RepositoryCommits({
  repositoryId,
  repository
}: RepositoryCommitsProps) {
  const [commits, setCommits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0
  })

  useEffect(() => {
    loadCommits()
  }, [repositoryId, pagination.offset])

  async function loadCommits() {
    setLoading(true)
    try {
      const result = await getRepositoryCommits(
        repositoryId,
        pagination.limit,
        pagination.offset
      )
      if (!result.error) {
        setCommits(result.commits || [])
        setPagination({
          total: result.pagination?.total ?? pagination.total,
          limit: result.pagination?.limit ?? pagination.limit,
          offset: result.pagination?.offset ?? pagination.offset
        })
      }
    } catch (err) {
      console.error('Failed to load commits:', err)
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="mb-1">
              <Link href="/dashboard">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="flex items-center gap-2 text-2xl font-medium">
            <GitBranch className="h-5 w-5" />
            {repository.project}
          </h1>
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

      <Card className="border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            Commits
          </CardTitle>
          <CardDescription>
            Showing {pagination.offset + 1}-
            {Math.min(pagination.offset + pagination.limit, pagination.total)}{' '}
            of {pagination.total} commits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : commits.length > 0 ? (
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
              <p className="text-muted-foreground text-sm">
                Commits will appear once they've been pushed to this repository
              </p>
            </div>
          )}

          {pagination.total > pagination.limit && (
            <div className="mt-6">
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
                    // Show pages around current page
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
                        pagination.offset + pagination.limit >= pagination.total
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
