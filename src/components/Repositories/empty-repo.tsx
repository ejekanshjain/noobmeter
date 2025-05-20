import { Button } from '@/components/ui/button'
import { GitBranch, Plus } from 'lucide-react'
import Link from 'next/link'

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
      </div>

      <div className="border-primary/20 bg-card/30 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center backdrop-blur-sm">
        <div className="relative">
          <div className="bg-primary/20 absolute inset-0 rounded-full blur-md"></div>
          <GitBranch className="text-primary relative h-6 w-6" />
        </div>
        <h3 className="mt-4 mb-2 text-lg font-medium">
          No repositories connected
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm text-sm">
          Connect your GitHub or GitLab repositories to start analyzing your
          code and measuring your noob level.
        </p>
        <Button
          asChild
          className="from-primary to-secondary hover:from-secondary hover:to-primary bg-gradient-to-r transition-all duration-500"
        >
          <Link href="/repositories/new">
            <Plus className="mr-2 h-4 w-4" />
            Connect Repository
          </Link>
        </Button>
      </div>
    </div>
  )
}
