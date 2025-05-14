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
import { cn } from '@/lib/cn'
import {
  Check,
  ExternalLink,
  GitBranch,
  MoreHorizontal,
  RefreshCw,
  Settings,
  Trash2
} from 'lucide-react'
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
  isSelected?: boolean
  onSelect?: () => void
}

export function RepositoryCard({
  repository,
  isSelected = false,
  onSelect
}: RepositoryCardProps) {
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
      <Card
        className={cn(
          'hover:border-primary/40 group cursor-pointer overflow-hidden border transition-all duration-200',
          isSelected && 'border-primary ring-primary ring-1'
        )}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <GitBranch className="text-primary h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="max-w-[180px] truncate font-medium">
                  {repository.project}
                </div>
                <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">
                    {getHostIcon(repository.host)}
                  </Badge>
                  <span className="max-w-[120px] truncate">
                    {repository.host}
                  </span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation()
                    router.push(`/repositories/${repository.id}`)
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation()
                    router.push(`/repositories/${repository.id}/commits`)
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Commits
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation()
                    router.refresh()
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={e => {
                    e.stopPropagation()
                    setShowDeleteDialog(true)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant={repository.isActive ? 'default' : 'secondary'}
                className="text-xs"
              >
                {repository.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {isSelected && (
                <Badge variant="outline" className="bg-primary/10 text-xs">
                  <Check className="mr-1 h-3 w-3" /> Selected
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={e => {
                e.stopPropagation()
                if (onSelect) onSelect()
              }}
            >
              {isSelected ? 'View Details' : 'Select'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the repository connection for{' '}
              <strong>{repository.project}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
