'use client'

import { addGitConnection } from '@/app/actions/git-connections'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  GitBranch,
  Github,
  GitlabIcon as GitlabLogo,
  Info,
  Key,
  LinkIcon,
  Server
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Define the form schema
const gitConnectionSchema = z.object({
  type: z.enum(['github', 'gitlab']),
  host: z.string().optional(),
  project: z.string().min(1, 'Repository path is required'),
  token: z.string().min(1, 'Access token is required')
})

type GitConnectionFormValues = z.infer<typeof gitConnectionSchema>

export const NewRepositoryPage = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [webhookSecret, setWebhookSecret] = useState<string | null>(null)

  const form = useForm<GitConnectionFormValues>({
    resolver: zodResolver(gitConnectionSchema),
    defaultValues: {
      type: 'github',
      host: '',
      project: '',
      token: ''
    }
  })

  async function onSubmit(values: GitConnectionFormValues) {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Create a new object with host defaulting to an empty string if undefined
      const formValues = {
        ...values,
        host: values.host || ''
      }

      const result = await addGitConnection(formValues)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(true)
        setWebhookSecret(result.webhookSecret)

        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push('/repositories')
        }, 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Link
          href="/repositories"
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to repositories
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold">Connect Repository</h1>
          <p className="text-muted-foreground mt-1">
            Connect a GitHub or GitLab repository to analyze code quality and
            track noob scores
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-cyan-500" />
                  Repository Details
                </CardTitle>
                <CardDescription>
                  Enter the details of the repository you want to connect
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>
                      Repository connected successfully. You will be redirected
                      to the repositories page.
                      {webhookSecret && (
                        <div className="mt-2">
                          <p className="font-medium">Webhook Secret:</p>
                          <code className="bg-muted/50 rounded px-2 py-1 text-sm">
                            {webhookSecret}
                          </code>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <Tabs
                      defaultValue="github"
                      onValueChange={value =>
                        form.setValue('type', value as 'github' | 'gitlab')
                      }
                    >
                      <TabsList className="bg-muted/50 mb-6 grid w-full grid-cols-2 rounded-xl p-1">
                        <TabsTrigger
                          value="github"
                          className="data-[state=active]:bg-background flex items-center gap-2 rounded-lg transition-all data-[state=active]:shadow-sm"
                        >
                          <Github className="h-4 w-4" />
                          <span>GitHub</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="gitlab"
                          className="data-[state=active]:bg-background flex items-center gap-2 rounded-lg transition-all data-[state=active]:shadow-sm"
                        >
                          <GitlabLogo className="h-4 w-4" />
                          <span>GitLab</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="github">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="host"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Server className="text-muted-foreground h-4 w-4" />
                                  Host (Optional)
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">
                                          Leave empty for github.com. Only
                                          specify for GitHub Enterprise
                                          instances.
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="github.com" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Defaults to github.com if left empty
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="project"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <GitBranch className="text-muted-foreground h-4 w-4" />
                                  Repository Path
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="username/repository"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Format: username/repository (e.g.,
                                  octocat/Hello-World)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="token"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Key className="text-muted-foreground h-4 w-4" />
                                  GitHub Access Token
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="ghp_..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Personal access token with repo scope
                                  permissions
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="gitlab">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="host"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Server className="text-muted-foreground h-4 w-4" />
                                  Host (Optional)
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">
                                          Leave empty for gitlab.com. Only
                                          specify for self-hosted GitLab
                                          instances.
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="gitlab.com" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Defaults to gitlab.com if left empty
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="project"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <GitBranch className="text-muted-foreground h-4 w-4" />
                                  Repository Path
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="username/repository"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Format: username/repository or
                                  group/subgroup/repository
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="token"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Key className="text-muted-foreground h-4 w-4" />
                                  GitLab Access Token
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="glpat-..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Personal access token with api and
                                  read_repository scopes
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" asChild>
                        <Link href="/repositories">Cancel</Link>
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Connecting...' : 'Connect Repository'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-cyan-500" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">1. Connect Your Repository</h3>
                  <p className="text-muted-foreground text-sm">
                    Enter your repository details and access token to establish
                    a connection.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">2. Set Up Webhook (Optional)</h3>
                  <p className="text-muted-foreground text-sm">
                    For real-time analysis, set up a webhook using the provided
                    secret.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">3. Start Analyzing</h3>
                  <p className="text-muted-foreground text-sm">
                    Once connected, we&apos;ll start analyzing your code and
                    calculating noob scores.
                  </p>
                </div>

                <div className="mt-4 border-t pt-4">
                  <h3 className="mb-2 font-medium">
                    Access Token Requirements
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <Github className="h-4 w-4" />
                        <span className="font-medium">GitHub</span>
                      </div>
                      <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                        <li>Personal access token (classic)</li>
                        <li>
                          Required scope:{' '}
                          <code className="bg-muted/70 rounded px-1 text-xs">
                            repo
                          </code>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <GitlabLogo className="h-4 w-4" />
                        <span className="font-medium">GitLab</span>
                      </div>
                      <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                        <li>Personal access token</li>
                        <li>
                          Required scopes:{' '}
                          <code className="bg-muted/70 rounded px-1 text-xs">
                            api
                          </code>
                          ,{' '}
                          <code className="bg-muted/70 rounded px-1 text-xs">
                            read_repository
                          </code>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href="https://docs.example.com/repository-setup"
                    target="_blank"
                    className="flex items-center gap-2"
                  >
                    <LinkIcon className="h-4 w-4" />
                    View Documentation
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
