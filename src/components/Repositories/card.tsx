'use client'
import { deleteGitConnection } from '@/app/actions/git-connections'
import { getTotalCommits } from '@/app/actions/repo-metrics'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, GitBranch, Github, Gitlab, Users } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'

export function RepositoryCard({ repository }: { repository: any }) {
  const [isPending, startTransition] = useTransition()
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
      try {
        const res = await getTotalCommits(repository?.id)
        setData({
          author: res?.totalAuthors || 0,
          count: res?.totalCommits || 0
        })
      } catch (error) {
        console.error('Failed to fetch commit count:', error)
      } finally {
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
          {repository.type === 'github' ? (
            <Github className="text-primary h-5 w-5" />
          ) : (
            <Gitlab className="text-primary h-5 w-5" />
          )}
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
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-card/30 border-primary/10 flex items-center gap-2 rounded-md border p-2">
              <GitBranch className="h-5 w-5 text-cyan-500" />
              <div className="flex flex-col">
                <span className="text-xs font-medium">{data?.count}</span>
                <span className="text-muted-foreground text-xs">Commits</span>
              </div>
            </div>
            <div className="bg-card/30 border-primary/10 flex items-center gap-2 rounded-md border p-2">
              <Users className="h-4 w-4 text-cyan-500" />
              <div className="flex flex-col">
                <span className="text-xs font-medium">{data?.author}</span>
                <span className="text-muted-foreground text-xs">Authors</span>
              </div>
            </div>
          </div>

          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>
              {latestCommit
                ? `Updated ${formatDate(latestCommit.date)}`
                : 'No commits yet'}
            </span>
          </div>

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
