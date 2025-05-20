'use client'

import { triggerCommitAnalysis } from '@/app/actions/commits'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  Clock,
  ExternalLink,
  GitCommit,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface CommitCardProps {
  commit: any
}

export function CommitCard({ commit }: CommitCardProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (isRetrying) return

    setIsRetrying(true)
    try {
      await triggerCommitAnalysis(commit.id)
    } catch (error) {
      console.error('Failed to retry commit analysis:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  const formattedDate = commit.date
    ? formatDistanceToNow(new Date(commit.date), { addSuffix: true })
    : 'Unknown date'

  const truncatedMessage =
    commit.message.length > 100
      ? commit.message.substring(0, 100) + '...'
      : commit.message

  const getStatusBadge = () => {
    switch (commit.queueStatus) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-300"
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case 'processing':
        return (
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-300"
          >
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        )
      case 'error':
        return (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900 dark:text-red-300"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        )
      case 'processed':
        return null
      default:
        return null
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 40) return 'text-amber-600 dark:text-amber-400'
    if (score >= 20) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <Card className="border-border overflow-hidden border transition-shadow hover:shadow-md dark:bg-black">
      <CardContent className="p-0">
        <div className="flex flex-col items-start gap-4 p-4 md:flex-row md:items-center">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <GitCommit className="h-4 w-4 flex-shrink-0 text-cyan-500 dark:text-cyan-400" />
              <span className="text-muted-foreground font-mono text-sm">
                {commit.sha.substring(0, 7)}
              </span>
              {getStatusBadge()}
            </div>

            <h3 className="mb-1 font-medium">{truncatedMessage}</h3>

            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span>{commit.authorEmail}</span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {commit.queueStatus === 'processed' ? (
              <>
                <div className="flex flex-col items-center">
                  <div className="text-muted-foreground mb-1 text-xs">
                    Score
                  </div>
                  <div
                    className={`text-xl font-bold ${getScoreColor(commit.finalScore)}`}
                  >
                    {commit.finalScore}
                  </div>
                </div>
                <Link
                  href={`/repo/${encodeURIComponent(commit.gitConnectionId)}/commits/${commit.id}`}
                >
                  <Button variant="outline" size="sm" className="ml-2">
                    <ExternalLink className="mr-1 h-4 w-4" />
                    Details
                  </Button>
                </Link>
              </>
            ) : commit.queueStatus === 'error' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                <RefreshCw
                  className={`mr-1 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`}
                />
                Retry
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
