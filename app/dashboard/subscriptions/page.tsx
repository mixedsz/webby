"use client"

import { useState, useEffect, useCallback } from "react"
import { useKeyAuth } from "@/lib/keyauth-context"
import { getAllSubscriptions, createSubscription, deleteSubscription, type SubscriptionPlan } from "@/lib/keyauth-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Layers, Plus, RefreshCw, AlertCircle, Trash2 } from "lucide-react"

export default function SubscriptionsPage() {
  const { sellerKey, isConfigured } = useKeyAuth()
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createLevel, setCreateLevel] = useState("1")

  const fetchSubscriptions = useCallback(async () => {
    if (!isConfigured) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await getAllSubscriptions(sellerKey)
      if (response.success && response.subscriptions) {
        setSubscriptions(response.subscriptions as SubscriptionPlan[])
      } else {
        if (response.message?.includes("No subscriptions")) {
          setSubscriptions([])
        } else {
          setError(response.message || "Failed to fetch subscriptions")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [sellerKey, isConfigured])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const handleCreateSubscription = async () => {
    setCreateLoading(true)
    try {
      const response = await createSubscription(sellerKey, createName, parseInt(createLevel))
      if (response.success) {
        setCreateOpen(false)
        setCreateName("")
        setCreateLevel("1")
        fetchSubscriptions()
      } else {
        setError(response.message || "Failed to create subscription")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteSubscription = async (name: string) => {
    try {
      const response = await deleteSubscription(sellerKey, name)
      if (response.success) {
        fetchSubscriptions()
      } else {
        setError(response.message || "Failed to delete subscription")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
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
            <Layers className="h-6 w-6" />
            Subscriptions
          </h1>
          <p className="text-muted-foreground">Manage subscription tiers for your application</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSubscriptions} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Subscription</DialogTitle>
                <DialogDescription>
                  Add a new subscription tier for your application
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Subscription Name</Label>
                  <Input
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g., Premium, Basic, Pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Input
                    type="number"
                    min="1"
                    value={createLevel}
                    onChange={(e) => setCreateLevel(e.target.value)}
                    placeholder="1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher levels can access more features
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateSubscription} disabled={createLoading || !createName}>
                  {createLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  Create Subscription
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

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subscription Tiers</CardTitle>
          <CardDescription>
            {subscriptions.length} subscription tier(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading subscriptions...</p>
                    </TableCell>
                  </TableRow>
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <Layers className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No subscriptions created</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((sub) => (
                    <TableRow key={sub.name}>
                      <TableCell className="font-medium">{sub.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                          Level {sub.level}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSubscription(sub.name)}
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
