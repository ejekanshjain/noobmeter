'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { elegantColors, getDiceBearAvatar, getNoobTitle } from '@/utils/helper'
import {
  ArrowUpDown,
  Award,
  Code,
  GitCommit,
  Star,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { useState } from 'react'

interface AuthorDetailsCardProps {
  author: {
    authorEmail: string
    avgScore: number
    rank: number
    commitCount?: number
    bestScore?: number
    worstScore?: number
  }
  colorIndex: number
  onClose?: () => void
}

export default function AuthorDetailsCard({
  author,
  colorIndex,
  onClose
}: AuthorDetailsCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getInitials = (email: string) => {
    return email?.split('@')[0]?.substring(0, 2)?.toUpperCase() || '??'
  }

  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-red-500'
    if (score < 70) return 'text-amber-500'
    return 'text-green-500'
  }

  const getScoreEmoji = (score: number) => {
    if (score < 40) return '💩'
    if (score < 70) return '😐'
    return '🌟'
  }

  const getScoreDescription = (score: number) => {
    if (score < 40) return 'Needs significant improvement'
    if (score < 70) return 'Average code quality'
    return 'Excellent code quality'
  }

  return (
    <Card className="w-full max-w-md overflow-hidden border shadow-md transition-all duration-300">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `linear-gradient(135deg, ${elegantColors[colorIndex]}40 0%, transparent 100%)`
        }}
      />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Award
              className="h-5 w-5"
              style={{ color: elegantColors[colorIndex] }}
            />
            Author Profile
          </CardTitle>
          <Badge
            variant="outline"
            className="px-2 py-0.5"
            style={{
              borderColor: elegantColors[colorIndex],
              color: elegantColors[colorIndex]
            }}
          >
            #{author.rank}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar
            className="h-16 w-16 border-2 shadow-sm"
            style={{
              borderColor: elegantColors[colorIndex]
            }}
          >
            <AvatarImage
              src={
                getDiceBearAvatar(author.authorEmail, author.rank - 1) ||
                '/placeholder.svg'
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
            <h3 className="text-lg font-semibold">
              {author.authorEmail.split('@')[0]}
            </h3>
            <p className="text-muted-foreground max-w-[250px] truncate text-sm">
              {author.authorEmail}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: `${elegantColors[colorIndex]}15`,
                  color: elegantColors[colorIndex]
                }}
              >
                {getNoobTitle(author.rank - 1, author.avgScore)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium">Noob Score</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`text-sm font-bold ${getScoreColor(author.avgScore)}`}
                  >
                    {author.avgScore.toFixed(1)}/100{' '}
                    {getScoreEmoji(author.avgScore)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getScoreDescription(author.avgScore)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Progress
            value={author.avgScore}
            className="h-2"
            indicatorClassName="transition-all duration-500"
            style={{
              backgroundColor: `${elegantColors[colorIndex]}30`
            }}
          />
        </div>

        {showDetails && (
          <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 pt-2 duration-300">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 flex flex-col items-center justify-center rounded-lg p-3">
                <GitCommit className="text-muted-foreground mb-1 h-4 w-4" />
                <span className="text-muted-foreground text-xs">Commits</span>
                <span className="font-semibold">
                  {author.commitCount || 'N/A'}
                </span>
              </div>

              <div className="bg-muted/30 flex flex-col items-center justify-center rounded-lg p-3">
                <Code className="text-muted-foreground mb-1 h-4 w-4" />
                <span className="text-muted-foreground text-xs">
                  Avg. Score
                </span>
                <span
                  className={`font-semibold ${getScoreColor(author.avgScore)}`}
                >
                  {author.avgScore.toFixed(1)}
                </span>
              </div>

              <div className="bg-muted/30 flex flex-col items-center justify-center rounded-lg p-3">
                <TrendingUp className="mb-1 h-4 w-4 text-green-500" />
                <span className="text-muted-foreground text-xs">
                  Best Score
                </span>
                <span className="font-semibold text-green-500">
                  {author.bestScore?.toFixed(1) || 'N/A'}
                </span>
              </div>

              <div className="bg-muted/30 flex flex-col items-center justify-center rounded-lg p-3">
                <TrendingDown className="mb-1 h-4 w-4 text-red-500" />
                <span className="text-muted-foreground text-xs">
                  Worst Score
                </span>
                <span className="font-semibold text-red-500">
                  {author.worstScore?.toFixed(1) || 'N/A'}
                </span>
              </div>
            </div>

            <div className="bg-muted/20 border-muted rounded-lg border p-3">
              <h4 className="mb-2 flex items-center gap-1 text-sm font-medium">
                <Star className="h-4 w-4 text-amber-500" />
                Noob Analysis
              </h4>
              <p className="text-muted-foreground text-sm">
                This author is ranked{' '}
                <span className="font-medium">#{author.rank}</span> out of all
                contributors. Their code quality is{' '}
                {author.avgScore < 40
                  ? 'concerning'
                  : author.avgScore < 70
                    ? 'average'
                    : 'excellent'}
                .
                {author.avgScore < 50 &&
                  ' They should consider improving their coding practices.'}
                {author.avgScore >= 50 &&
                  author.avgScore < 70 &&
                  ' There is room for improvement in their code quality.'}
                {author.avgScore >= 70 &&
                  ' They consistently write high-quality code.'}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs"
        >
          <ArrowUpDown className="mr-1 h-3.5 w-3.5" />
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>

        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
