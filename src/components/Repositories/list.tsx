'use client'

import { getGitConnections } from '@/app/actions/git-connections'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { RepositoryCard } from './card'
import { EmptyRepositories } from './empty-repo'

export function RepositoriesList() {
  const [repositories, setRepositories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadRepositories() {
      setLoading(true)
      try {
        const { connections, error } = await getGitConnections()
        if (error) {
          setError(error)
        } else {
          setRepositories(connections || [])
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

  const filteredRepositories = repositories.filter(
    repo =>
      repo.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.host.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <Link href="/repositories/new">
            <Button disabled variant={'outline'}>
              <Plus className="mr-2 h-4 w-4" />
              Connect Repository
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="border-primary/20 bg-card/50 h-40 animate-pulse rounded-lg border backdrop-blur-sm"
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
          <Button asChild variant={'outline'}>
            <Link href="/repositories/new">
              <Plus className="mr-2 h-4 w-4" />
              Connect Repository
            </Link>
          </Button>
        </div>

        <Alert
          variant="destructive"
          className="border-primary/20 bg-card/50 backdrop-blur-sm"
        >
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
        <Button asChild variant={'outline'}>
          <Link href="/repositories/new">
            <Plus className="mr-2 h-4 w-4" />
            Connect Repository
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          placeholder="Search repositories..."
          className="border-primary/20 bg-card/50 pl-10 backdrop-blur-sm"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRepositories.length > 0 ? (
          filteredRepositories.map(repo => (
            <RepositoryCard key={repo.id} repository={repo} />
          ))
        ) : (
          <div className="border-primary/20 bg-card/30 col-span-3 flex h-40 items-center justify-center rounded-lg border border-dashed backdrop-blur-sm">
            <p className="text-muted-foreground">
              No repositories found matching your search
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
