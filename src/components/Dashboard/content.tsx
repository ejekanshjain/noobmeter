'use client'

import { getGitConnections } from '@/app/actions/git-connections'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { EmptyRepositories } from './empty-repo'
import { GitConnectionForm } from './git-connection-form'
import { RepositoryCard } from './repo-card'

export function RepositoriesDashboard() {
  const [repositories, setRepositories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)

  useEffect(() => {
    async function loadRepositories() {
      setLoading(true)
      try {
        const { connections, error } = await getGitConnections()
        console.log('connections', connections)
        if (error) {
          setError(error)
        } else {
          setRepositories(connections || [])
          if (connections && connections.length > 0) {
            setSelectedRepo(connections[0]?.id || '')
          }
        }
      } catch (err) {
        setError('Failed to load repositories')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadRepositories()
  }, [])

  const handleSelectRepo = (repoId: string) => {
    setSelectedRepo(repoId)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-medium">Repositories</h1>
            <p className="text-muted-foreground text-sm">
              Select a repository to view its metrics and commits
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground" disabled>
            <Plus className="mr-2 h-4 w-4" />
            Connect Repository
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="border-border bg-card/50 h-32 animate-pulse rounded-lg border"
              />
            ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-medium">Repositories</h1>
            <p className="text-muted-foreground text-sm">
              Select a repository to view its metrics and commits
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground" asChild>
            <Link href="/repositories">
              <Plus className="mr-2 h-4 w-4" />
              Connect Repository
            </Link>
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (repositories.length === 0) {
    return <EmptyRepositories />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-medium">Repositories</h1>
          <p className="text-muted-foreground text-sm">
            Select a repository to view its metrics and commits
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Connect Repository
            </Button>
          </DialogTrigger>
          <DialogContent className="border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Connect Repository</DialogTitle>
            </DialogHeader>
            <GitConnectionForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {repositories.map(repo => (
          <RepositoryCard
            key={repo.id}
            repository={repo}
            isSelected={selectedRepo === repo.id}
            onSelect={() => handleSelectRepo(repo.id)}
          />
        ))}
      </div>
    </div>
  )
}
