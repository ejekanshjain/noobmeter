'use client'

import { deleteGitConnection } from '@/app/actions/git-connections'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  ExternalLink,
  GitBranch,
  MoreHorizontal,
  RefreshCw,
  Settings,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface RepositoryCardProps {
  repository: {
    id: string
    type: string
    host: string
    project: string
    isActive: boolean
    webhookSecret: string
    createdAt: string
  }
}

export function RepositoryCard({ repository }: RepositoryCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteGitConnection(repository.id)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete repository:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const getHostIcon = (host: string) => {
    if (host.includes('github')) return 'github'
    if (host.includes('gitlab')) return 'gitlab'
    return 'git'
  }

  return (
    <>
      <Card className="group overflow-hidden border border-gray-200 bg-white transition-all duration-200 hover:border-teal-400 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-teal-500">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <GitBranch className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="max-w-[180px] truncate font-medium text-gray-900 dark:text-gray-100">
                  {repository.project}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Badge
                    variant="outline"
                    className="border-gray-200 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300"
                  >
                    {getHostIcon(repository.host)}
                  </Badge>
                  <span className="max-w-[120px] truncate">
                    {repository.host}
                  </span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              >
                <DropdownMenuItem
                  asChild
                  className="text-gray-700 focus:bg-gray-100 dark:text-gray-300 dark:focus:bg-gray-800"
                >
                  <Link href={`/repo/${repository.id}/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.refresh()}
                  className="text-gray-700 focus:bg-gray-100 dark:text-gray-300 dark:focus:bg-gray-800"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-900/20 dark:focus:text-red-300"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Badge
              variant={repository.isActive ? 'default' : 'secondary'}
              className={
                repository.isActive
                  ? 'bg-teal-100 text-xs text-teal-800 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:hover:bg-teal-900/40'
                  : 'bg-gray-100 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-400'
              }
            >
              {repository.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <Button
            className="mt-4 w-full bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
            asChild
          >
            <Link href={`/repo/${repository.id}`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Repository
            </Link>
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              This will permanently delete the repository connection for{' '}
              <strong className="text-gray-900 dark:text-gray-100">
                {repository.project}
              </strong>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-gray-200 bg-gray-100 text-gray-900 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
