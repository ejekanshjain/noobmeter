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
            <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
              Repositories
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select a repository to view its metrics and commits
            </p>
          </div>
          <Button
            className="bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
            disabled
          >
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
                className="h-40 animate-pulse rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800/50"
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
            <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
              Repositories
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select a repository to view its metrics and commits
            </p>
          </div>
          <Button
            className="bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
            asChild
          >
            <Link href="/repositories/new">
              <Plus className="mr-2 h-4 w-4" />
              Connect Repository
            </Link>
          </Button>
        </div>

        <Alert
          variant="destructive"
          className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20"
        >
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-600 dark:text-red-400">
            Error
          </AlertTitle>
          <AlertDescription className="text-red-600 dark:text-red-400">
            {error}
          </AlertDescription>
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
          <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
            Repositories
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select a repository to view its metrics and commits
          </p>
        </div>
        <Button
          className="bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
          asChild
        >
          <Link href="/repositories/new">
            <Plus className="mr-2 h-4 w-4" />
            Connect Repository
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
        <Input
          placeholder="Search repositories..."
          className="border-gray-200 bg-white pl-10 dark:border-gray-800 dark:bg-gray-900"
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
          <div className="col-span-3 flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              No repositories found matching your search
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
