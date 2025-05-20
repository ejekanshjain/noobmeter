'use client'

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
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { elegantColors, getDiceBearAvatar, getNoobTitle } from '@/utils/helper'
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  Users
} from 'lucide-react'
import { useState } from 'react'
import AuthorDetailsCard from './author-detail-card'

interface AuthorsGridProps {
  authors: Array<{
    authorEmail: string
    avgScore: number
  }>
  totalAuthors: number
  currentPage: number
  pageSize: number
  isLoading: boolean
  onPageChange: (page: number) => void
  onSearch: (query: string) => void
  onRefresh: () => void
}

export default function AuthorsGrid({
  authors,
  totalAuthors,
  currentPage,
  pageSize,
  isLoading,
  onPageChange,
  onSearch,
  onRefresh
}: AuthorsGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'highest' | 'lowest'>('lowest')
  const [selectedAuthor, setSelectedAuthor] = useState<{
    authorEmail: string
    avgScore: number
    rank: number
  } | null>(null)

  const handleSearch = () => {
    // This will trigger the parent component to reset to page 1
    onSearch(searchQuery)
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

  // Sort authors based on the selected order
  const sortedAuthors = [...authors].sort((a, b) => {
    if (sortOrder === 'lowest') {
      return a.avgScore - b.avgScore
    } else {
      return b.avgScore - a.avgScore
    }
  })

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Users className="h-5 w-5 text-cyan-500" />
              Authors Leaderboard
            </CardTitle>
            <CardDescription>
              All contributors ranked by their code quality score
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="mr-2 h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={sortOrder}
                  onValueChange={value =>
                    setSortOrder(value as 'highest' | 'lowest')
                  }
                >
                  <DropdownMenuRadioItem value="lowest">
                    Lowest Score First
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="highest">
                    Highest Score First
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
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
          <Button variant="default" onClick={handleSearch} disabled={isLoading}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : sortedAuthors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="text-lg font-medium">No authors found</h3>
            <p className="text-muted-foreground mt-1 max-w-md">
              Try adjusting your search or filters to find what you&apos;re
              looking for.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedAuthors.map((author, index) => {
                const rank = (currentPage - 1) * pageSize + index + 1
                const colorIndex = index % elegantColors.length

                return (
                  <Dialog key={author.authorEmail}>
                    <DialogTrigger asChild>
                      <Card
                        className="group hover:border-muted cursor-pointer border transition-all duration-200 hover:shadow-md"
                        onClick={() =>
                          setSelectedAuthor({
                            ...author,
                            rank
                          })
                        }
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10 border shadow-sm">
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
                              <Badge
                                variant="outline"
                                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]"
                                style={{
                                  borderColor: elegantColors[colorIndex],
                                  color: elegantColors[colorIndex],
                                  backgroundColor: 'white'
                                }}
                              >
                                {rank}
                              </Badge>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium">
                                {author.authorEmail.split('@')[0]}
                              </div>
                              <div className="text-muted-foreground truncate text-xs">
                                {author.authorEmail}
                              </div>
                            </div>

                            <div
                              className={`text-right font-bold ${getScoreColor(author.avgScore)}`}
                            >
                              {Number(author.avgScore).toFixed(1)}
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.max(3, author.avgScore)}%`,
                                  backgroundColor: elegantColors[colorIndex]
                                }}
                              />
                            </div>
                            <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                              <span>
                                {getNoobTitle(rank - 1, author.avgScore)}
                              </span>
                              <span>
                                {author.avgScore < 50
                                  ? '😱'
                                  : author.avgScore < 70
                                    ? '😐'
                                    : '🌟'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                      {selectedAuthor && (
                        <AuthorDetailsCard
                          author={selectedAuthor}
                          colorIndex={colorIndex}
                          onClose={() => setSelectedAuthor(null)}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                )
              })}
            </div>

            {/* Pagination controls */}
            {totalPages > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-muted-foreground text-sm">
                  Showing <span className="font-medium">{authors.length}</span>{' '}
                  of <span className="font-medium">{totalAuthors}</span> authors
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                          onClick={() => onPageChange(pageNum)}
                          disabled={isLoading}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
