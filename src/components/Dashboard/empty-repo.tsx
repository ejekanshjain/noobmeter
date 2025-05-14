import { Button } from '@/components/ui/button'
import { GitBranch, Plus } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { GitConnectionForm } from './git-connection-form'

export function EmptyRepositories() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-medium">Repositories</h1>
          <p className="text-muted-foreground text-sm">
            Connect your first repository to get started
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

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
        <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <GitBranch className="text-muted-foreground h-8 w-8" />
        </div>
        <h2 className="mb-2 text-xl font-medium">No repositories connected</h2>
        <p className="text-muted-foreground mb-6 max-w-md text-center">
          Connect your first repository to start analyzing your code and
          measuring your noobness.
        </p>
        <Button size="lg" asChild>
          <Link href="/repositories">
            <Plus className="mr-2 h-4 w-4" />
            Connect Your First Repository
          </Link>
        </Button>
      </div>
    </div>
  )
}
