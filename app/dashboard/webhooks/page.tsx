"use client"

import { useState, useEffect, useCallback } from "react"
import { useKeyAuth } from "@/lib/keyauth-context"
import { getAllWebhooks, createWebhook, deleteWebhook, type Webhook } from "@/lib/keyauth-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Webhook as WebhookIcon, Plus, RefreshCw, AlertCircle, Trash2, Copy, ExternalLink } from "lucide-react"

export default function WebhooksPage() {
  const { sellerKey, isConfigured } = useKeyAuth()
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createBaseUrl, setCreateBaseUrl] = useState("")
  const [createUserAgent, setCreateUserAgent] = useState("")
  const [createAuthed, setCreateAuthed] = useState(true)

  const fetchWebhooks = useCallback(async () => {
    if (!isConfigured) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await getAllWebhooks(sellerKey)
      if (response.success && response.webhooks) {
        setWebhooks(response.webhooks as Webhook[])
      } else {
        if (response.message?.includes("No webhooks")) {
          setWebhooks([])
        } else {
          setError(response.message || "Failed to fetch webhooks")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [sellerKey, isConfigured])

  useEffect(() => {
    fetchWebhooks()
  }, [fetchWebhooks])

  const handleCreateWebhook = async () => {
    setCreateLoading(true)
    try {
      const response = await createWebhook(sellerKey, createBaseUrl, createUserAgent, createAuthed)
      if (response.success) {
        setCreateOpen(false)
        setCreateBaseUrl("")
        setCreateUserAgent("")
        fetchWebhooks()
      } else {
        setError(response.message || "Failed to create webhook")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteWebhook = async (webId: string) => {
    try {
      const response = await deleteWebhook(sellerKey, webId)
      if (response.success) {
        fetchWebhooks()
      } else {
        setError(response.message || "Failed to delete webhook")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!isConfigured) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <p>Please configure your seller key in the Overview page first.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <WebhookIcon className="h-6 w-6" />
            Webhooks
          </h1>
          <p className="text-muted-foreground">Manage webhooks for event notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchWebhooks} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Webhook</DialogTitle>
                <DialogDescription>
                  Add a new webhook endpoint for your application
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Base URL</Label>
                  <Input
                    value={createBaseUrl}
                    onChange={(e) => setCreateBaseUrl(e.target.value)}
                    placeholder="https://example.com/api/webhook"
                  />
                  <p className="text-xs text-muted-foreground">
                    The URL where webhook events will be sent
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>User Agent (optional)</Label>
                  <Input
                    value={createUserAgent}
                    onChange={(e) => setCreateUserAgent(e.target.value)}
                    placeholder="MyApp/1.0"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Authentication</Label>
                    <p className="text-xs text-muted-foreground">
                      Only authenticated requests trigger webhook
                    </p>
                  </div>
                  <Switch checked={createAuthed} onCheckedChange={setCreateAuthed} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateWebhook} disabled={createLoading || !createBaseUrl}>
                  {createLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  Create Webhook
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm">{error}</p>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Webhooks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configured Webhooks</CardTitle>
          <CardDescription>
            {webhooks.length} webhook(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Webhook ID</TableHead>
                  <TableHead className="hidden md:table-cell">Base URL</TableHead>
                  <TableHead>Auth Required</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading webhooks...</p>
                    </TableCell>
                  </TableRow>
                ) : webhooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <WebhookIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No webhooks configured</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  webhooks.map((webhook) => (
                    <TableRow key={webhook.webid}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs bg-muted px-2 py-1 rounded truncate max-w-[100px]">
                            {webhook.webid}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(webhook.webid)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[200px]">{webhook.baseurl}</span>
                          <a href={webhook.baseurl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        {webhook.authed === "1" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">Yes</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteWebhook(webhook.webid)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
