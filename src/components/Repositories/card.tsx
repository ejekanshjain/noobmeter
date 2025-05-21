'use client'
import { deleteGitConnection } from '@/app/actions/git-connections'
import { getTotalCommits } from '@/app/actions/repo-metrics'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowUpRight,
  Calendar,
  GitBranch,
  Github,
  Gitlab,
  Loader2,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'

export function RepositoryCard({ repository }: { repository: any }) {
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<{
    count: number
    author: number
  }>({
    count: 0,
    author: 0
  })
  const handleDisconnect = () => {
    startTransition(async () => {
      await deleteGitConnection(repository.id)
    })
  }
  useEffect(() => {
    const fetchCommitCount = async () => {
      setIsLoading(true)
      try {
        const res = await getTotalCommits(repository?.id)
        setData({
          author: res?.totalAuthors || 0,
          count: res?.totalCommits || 0
        })
      } catch (error) {
        console.error('Failed to fetch commit count:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommitCount()
  }, [repository?.id])

  const latestCommit = repository.commits?.[0]

  const formatDate = (dateInput: string | Date) => {
    if (!dateInput) return 'No date'
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    return date.toLocaleDateString()
  }

  return (
    <Card className="border-primary/20 bg-card/50 group hover:border-primary/40 overflow-hidden backdrop-blur-sm transition-all duration-300">
      <div className="from-primary/5 to-secondary/5 absolute inset-0 rounded-lg bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div
            className={`rounded-full p-1 ${
              repository.type === 'github'
                ? 'bg-[#2ea44f]/10 text-[#2ea44f]'
                : 'bg-amber-500/10 text-amber-500'
            }`}
          >
            {repository.type === 'github' ? (
              <Github className="h-4 w-4" />
            ) : (
              <Gitlab className="h-4 w-4" />
            )}
          </div>
          <CardTitle className="text-lg">{repository.project}</CardTitle>
        </div>

        <Badge
          variant="outline"
          className="border-primary/20 bg-primary/10 text-xs"
        >
          {data?.count} commits
        </Badge>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card/50 flex flex-col rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-cyan-500" />
                <span className="text-muted-foreground text-xs">Commits</span>
              </div>
              <div className="mt-1 text-lg font-semibold">
                {isLoading ? (
                  <div className="flex h-6 items-center">
                    <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  data.count.toLocaleString()
                )}
              </div>
            </div>

            <div className="bg-card/50 flex flex-col rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-500" />
                <span className="text-muted-foreground text-xs">
                  Contributors
                </span>
              </div>
              <div className="mt-1 text-lg font-semibold">
                {isLoading ? (
                  <div className="flex h-6 items-center">
                    <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  data.author.toLocaleString()
                )}
              </div>
            </div>
          </div>

          {latestCommit && (
            <div className="text-muted-foreground mt-3 flex items-center gap-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>Last updated: {formatDate(latestCommit.date)}</span>
            </div>
          )}
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gradient-border group flex-1"
              asChild
            >
              <Link href={`/repo/${repository.id}`}>
                <span className="group-hover:text-gradient transition-all duration-300">
                  View Details
                </span>
                <ArrowUpRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-destructive/30 hover:bg-destructive/10 flex-1"
              onClick={handleDisconnect}
              disabled={isPending}
            >
              <span className="text-destructive">
                {isPending ? 'Disconnecting...' : 'Disconnect'}
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
