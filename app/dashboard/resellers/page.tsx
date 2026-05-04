"use client"

import { useState, useEffect, useCallback } from "react"
import { useKeyAuth } from "@/lib/keyauth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserCog, RefreshCw, Search, AlertCircle } from "lucide-react"

interface Reseller {
  user: string
  key: string
  balance?: string
}

export default function ResellersPage() {
  const { sellerKey, isConfigured } = useKeyAuth()
  const [resellers, setResellers] = useState<Reseller[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchResellers = useCallback(async () => {
    if (!isConfigured) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/keyauth/resellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "fetchallresellers", sellerkey: sellerKey }),
      })
      const data = await response.json()
      
      if (data.success && data.resellers) {
        setResellers(data.resellers)
      } else {
        if (data.message?.includes("No resellers")) {
          setResellers([])
        } else {
          setError(data.message || "Failed to fetch resellers")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [sellerKey, isConfigured])

  useEffect(() => {
    fetchResellers()
  }, [fetchResellers])

  const filteredResellers = resellers.filter((reseller) =>
    reseller.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reseller.key?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <UserCog className="h-6 w-6" />
            Resellers
          </h1>
          <p className="text-muted-foreground">Manage your application resellers</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchResellers} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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

      {/* Info Card */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="py-4">
          <p className="text-sm text-blue-400">
            Resellers can generate and manage license keys on your behalf. Visit the{" "}
            <a 
              href="https://keyauth.cc/app/?page=resellers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-300"
            >
              KeyAuth dashboard
            </a>{" "}
            to add or manage resellers.
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resellers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reseller Accounts</CardTitle>
          <CardDescription>
            {filteredResellers.length} reseller(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead className="hidden md:table-cell">Reseller Key</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading resellers...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredResellers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <UserCog className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No resellers found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResellers.map((reseller, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{reseller.user}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <code className="font-mono text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px] block">
                          {reseller.key}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                          {reseller.balance || "0"} credits
                        </span>
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
