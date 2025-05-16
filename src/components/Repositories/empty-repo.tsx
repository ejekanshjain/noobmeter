import { Button } from '@/components/ui/button'
import { GitBranch, Plus } from 'lucide-react'
import Link from 'next/link'

export function EmptyRepositories() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-medium">Repositories</h1>
          <p className="text-sm text-gray-500">
            Connect your first repository to get started
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <GitBranch className="h-6 w-6 text-teal-500" />
        </div>
        <h2 className="mb-2 text-xl font-medium">No repositories connected</h2>
        <p className="mb-6 max-w-md text-gray-500">
          Connect your first repository to start analyzing your code and
          measuring your noobness level.
        </p>
        <Button className="bg-teal-700 text-white hover:bg-teal-600" asChild>
          <Link href="/repositories/new">
            <Plus className="mr-2 h-4 w-4" />
            Connect Repository
          </Link>
        </Button>
      </div>
    </div>
  )
}
