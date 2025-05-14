'use client'

import type React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Code,
  GitCommit,
  MessageSquare,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'

interface CommitMetrics {
  correctness?: number
  readability?: number
  bestPractices?: number
  performance?: number
  security?: number
  dryness?: number
  scopeDiscipline?: number
  testability?: number
  impactToNoise?: number
  workComplexity?: number
  finalScore: number
}

interface Commit {
  id: string
  sha: string
  repo: string
  message: string
  date: string
  metrics: CommitMetrics
  summary?: string
  url?: string
}

export function CommitCard({ commit }: { commit: Commit }) {
  const [expanded, setExpanded] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500'
    if (score >= 6) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getScoreTextColor = (score: number) => {
    if (score >= 8) return 'text-green-500'
    if (score >= 6) return 'text-amber-500'
    return 'text-red-500'
  }

  const getMetricIcon = (name: string, value?: number) => {
    if (!value) return null

    const icons: Record<string, React.ReactNode> = {
      correctness: <CheckCircle className="h-4 w-4" />,
      readability: <BookOpen className="h-4 w-4" />,
      security: <AlertTriangle className="h-4 w-4" />,
      performance: <Sparkles className="h-4 w-4" />
    }

    return icons[name] || <Code className="h-4 w-4" />
  }

  const getMetricColor = (value?: number) => {
    if (!value) return 'bg-gray-500'
    if (value >= 8) return 'bg-green-500'
    if (value >= 6) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <Card className="border-primary/20 bg-card/50 group hover:border-primary/40 overflow-hidden backdrop-blur-sm transition-all duration-300">
      <div className="from-primary/5 to-secondary/5 absolute inset-0 rounded-lg bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      <CardContent className="relative z-10 p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <GitCommit className="text-primary h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">{commit.message}</div>
                <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/10 text-xs"
                  >
                    {commit.repo}
                  </Badge>
                  <span>{commit.date}</span>
                  {commit.sha && (
                    <span className="text-muted-foreground text-xs">
                      {commit.sha.substring(0, 7)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <div
                  className={`h-8 w-8 rounded-full ${getScoreColor(commit.metrics.finalScore)} animate-pulse-glow flex items-center justify-center font-bold text-white`}
                >
                  {commit.metrics.finalScore.toFixed(1)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(!expanded)}
                aria-label={expanded ? 'Collapse' : 'Expand'}
                className="relative overflow-hidden"
              >
                <div className="bg-primary/10 absolute inset-0 rounded-md opacity-0 transition-opacity hover:opacity-100"></div>
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border-primary/20 mt-3 border-t pt-3">
                  {/* Metrics Grid */}
                  <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <TooltipProvider>
                      {Object.entries(commit.metrics)
                        .filter(
                          ([key, value]) =>
                            key !== 'finalScore' && value !== undefined
                        )
                        .slice(0, 8)
                        .map(([key, value]) => (
                          <Tooltip key={key}>
                            <TooltipTrigger asChild>
                              <div className="bg-card/30 border-primary/10 flex items-center gap-2 rounded-md border p-2">
                                <div
                                  className={`h-6 w-6 rounded-full ${getMetricColor(value)} flex items-center justify-center text-white`}
                                >
                                  {getMetricIcon(key, value) ||
                                    value?.toFixed(1)}
                                </div>
                                <span className="text-xs capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {key.replace(/([A-Z])/g, ' $1').trim()}:{' '}
                                {value?.toFixed(1)}/10
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                    </TooltipProvider>
                  </div>

                  {commit.summary && (
                    <div className="mb-4 flex items-start gap-2">
                      <Sparkles className="text-primary mt-0.5 h-5 w-5" />
                      <div>
                        <h4 className="mb-1 font-medium">AI Feedback</h4>
                        <p className="text-muted-foreground text-sm">
                          {commit.summary}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    {commit.url && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gradient-border group gap-1"
                        asChild
                      >
                        <a
                          href={commit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Code className="h-4 w-4" />
                          <span className="group-hover:text-gradient transition-all duration-300">
                            View Code
                          </span>
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="gradient-border group gap-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="group-hover:text-gradient transition-all duration-300">
                        Request More Feedback
                      </span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
