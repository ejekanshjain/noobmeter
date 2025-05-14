'use client'

import {
  addGitConnection,
  type GitConnectionFormValues
} from '@/app/actions/git-connections'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { AlertCircle, Check, Copy, Github, Gitlab, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

export function GitConnectionForm() {
  const [activeTab, setActiveTab] = useState<'github' | 'gitlab'>('github')
  const [isPending, startTransition] = useTransition()
  const [showWebhookInfo, setShowWebhookInfo] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [copied, setCopied] = useState<'url' | 'secret' | null>(null)

  const form = useForm<GitConnectionFormValues>({
    resolver: zodResolver(
      z.object({
        type: z.enum(['github', 'gitlab']),
        host: z.string().url('Please enter a valid URL').or(z.literal('')),
        project: z.string().min(1, 'Project name is required'),
        token: z.string().min(1, 'Access token is required')
      })
    ),
    defaultValues: {
      type: activeTab,
      host:
        activeTab === 'github' ? 'https://github.com' : 'https://gitlab.com',
      project: '',
      token: ''
    }
  })

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'github' | 'gitlab')
    form.setValue('type', value as 'github' | 'gitlab')
    form.setValue(
      'host',
      value === 'github' ? 'https://github.com' : 'https://gitlab.com'
    )
  }

  const extractRepoPath = (input: string): string => {
    try {
      // Check if it's a full URL
      if (input.startsWith('http')) {
        const url = new URL(input)
        const path = url.pathname.replace(/^\//, '') // Remove leading slash

        // Remove .git extension if present
        return path.replace(/\.git$/, '')
      }
      // Already in correct format
      return input
    } catch (e) {
      // If URL parsing fails, return the original input
      return input
    }
  }

  // Modify the handleSubmit function to process the repository path
  const handleSubmit = async (values: GitConnectionFormValues) => {
    // Extract the repository path from the project field
    const processedValues = {
      ...values,
      project: extractRepoPath(values.project)
    }

    startTransition(async () => {
      try {
        const result = await addGitConnection(processedValues)

        if (result.error) {
          toast.error(result.error)
        } else if (result.success) {
          toast.success('Repository connected successfully!')
          setShowWebhookInfo(true)
          setWebhookUrl(`${window.location.origin}/api/webhooks/git`)
          setWebhookSecret(result.webhookSecret || '')
          form.reset()
        }
      } catch (error) {
        toast.error('Failed to connect repository')
        console.error(error)
      }
    })
  }

  const copyToClipboard = (text: string, type: 'url' | 'secret') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (showWebhookInfo) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Repository connected successfully!</AlertTitle>
          <AlertDescription>
            To enable automatic commit analysis, you need to set up a webhook in
            your repository.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Webhook URL</div>
            <div className="flex">
              <Input value={webhookUrl} readOnly className="rounded-r-none" />
              <Button
                type="button"
                variant="outline"
                className="rounded-l-none"
                onClick={() => copyToClipboard(webhookUrl, 'url')}
              >
                {copied === 'url' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              Add this URL to your repository webhook settings
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Webhook Secret</div>
            <div className="flex">
              <Input
                value={webhookSecret}
                readOnly
                className="rounded-r-none"
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-l-none"
                onClick={() => copyToClipboard(webhookSecret, 'secret')}
              >
                {copied === 'secret' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              Use this as the secret/token in your webhook settings
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Webhook Setup Instructions</h3>
          {activeTab === 'github' ? (
            <ol className="list-inside list-decimal space-y-2 text-sm">
              <li>Go to your GitHub repository</li>
              <li>Click on "Settings" → "Webhooks" → "Add webhook"</li>
              <li>Set the Payload URL to the Webhook URL above</li>
              <li>Set Content type to "application/json"</li>
              <li>Set the Secret to the Webhook Secret above</li>
              <li>Select "Just the push event"</li>
              <li>Ensure "Active" is checked and click "Add webhook"</li>
            </ol>
          ) : (
            <ol className="list-inside list-decimal space-y-2 text-sm">
              <li>Go to your GitLab repository</li>
              <li>Click on "Settings" → "Webhooks"</li>
              <li>Set the URL to the Webhook URL above</li>
              <li>Set the Secret token to the Webhook Secret above</li>
              <li>Check the "Push events" trigger</li>
              <li>Click "Add webhook"</li>
            </ol>
          )}
        </div>

        <Button onClick={() => setShowWebhookInfo(false)} className="w-full">
          Done
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="github" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </TabsTrigger>
            <TabsTrigger value="gitlab" className="flex items-center gap-2">
              <Gitlab className="h-4 w-4" />
              GitLab
            </TabsTrigger>
          </TabsList>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="github" className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Repository</FormLabel>
                    <FormControl>
                      <Input placeholder="username/repository" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the repository in the format username/repository or
                      paste the full repository URL
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
                    <FormLabel>GitHub Access Token</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Create a personal access token with repo scope in your
                      GitHub settings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="gitlab" className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitLab URL (for self-hosted)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://gitlab.example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave default for gitlab.com
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
                    <FormLabel>GitLab Project</FormLabel>
                    <FormControl>
                      <Input placeholder="username/repository" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the project in the format username/repository or
                      paste the full project URL
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
                    <FormLabel>GitLab Access Token</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Create a personal access token with API scope in your
                      GitLab settings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </motion.div>
        </Tabs>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>Connect Repository</>
          )}
        </Button>
      </form>
    </Form>
  )
}
