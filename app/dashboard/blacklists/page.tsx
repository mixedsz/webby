"use client"

import { useState, useEffect, useCallback } from "react"
import { useKeyAuth } from "@/lib/keyauth-context"
import { getBlacklists, createBlacklist, deleteBlacklist, type Blacklist } from "@/lib/keyauth-api"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Shield, Plus, RefreshCw, AlertCircle, Trash2, Search } from "lucide-react"

export default function BlacklistsPage() {
  const { sellerKey, isConfigured } = useKeyAuth()
  const [blacklists, setBlacklists] = useState<Blacklist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createData, setCreateData] = useState("")
  const [createType, setCreateType] = useState<"ip" | "hwid">("ip")

  const fetchBlacklists = useCallback(async () => {
    if (!isConfigured) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await getBlacklists(sellerKey)
      if (response.success && response.blacklists) {
        setBlacklists(response.blacklists as Blacklist[])
      } else {
        if (response.message?.includes("No blacklists")) {
          setBlacklists([])
        } else {
          setError(response.message || "Failed to fetch blacklists")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [sellerKey, isConfigured])

  useEffect(() => {
    fetchBlacklists()
  }, [fetchBlacklists])

  const handleCreateBlacklist = async () => {
    setCreateLoading(true)
    try {
      const response = await createBlacklist(sellerKey, createData, createType)
      if (response.success) {
        setCreateOpen(false)
        setCreateData("")
        fetchBlacklists()
      } else {
        setError(response.message || "Failed to add to blacklist")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteBlacklist = async (data: string, type: string) => {
    try {
      const response = await deleteBlacklist(sellerKey, data, type as "ip" | "hwid")
      if (response.success) {
        fetchBlacklists()
      } else {
        setError(response.message || "Failed to remove from blacklist")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const filteredBlacklists = blacklists.filter((blacklist) => {
    const matchesSearch = blacklist.blacklist?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || blacklist.blacktype === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "ip":
        return "bg-blue-500/20 text-blue-500"
      case "hwid":
        return "bg-purple-500/20 text-purple-500"
      default:
        return "bg-muted text-muted-foreground"
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
            <Shield className="h-6 w-6" />
            Blacklists
          </h1>
          <p className="text-muted-foreground">Block IPs and HWIDs from accessing your application</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchBlacklists} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add to Blacklist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add to Blacklist</DialogTitle>
                <DialogDescription>
                  Block an IP address or HWID from your application
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={createType} onValueChange={(v) => setCreateType(v as "ip" | "hwid")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ip">IP Address</SelectItem>
                      <SelectItem value="hwid">Hardware ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{createType === "ip" ? "IP Address" : "Hardware ID"}</Label>
                  <Input
                    value={createData}
                    onChange={(e) => setCreateData(e.target.value)}
                    placeholder={createType === "ip" ? "192.168.1.1" : "HWID string"}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateBlacklist} disabled={createLoading || !createData}>
                  {createLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  Add to Blacklist
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search blacklist entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ip">IP Only</SelectItem>
                <SelectItem value="hwid">HWID Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Blacklists Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Blocked Entries</CardTitle>
          <CardDescription>
            {filteredBlacklists.length} blocked {filteredBlacklists.length === 1 ? "entry" : "entries"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading blacklists...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredBlacklists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No blacklist entries</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBlacklists.map((blacklist, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${getTypeColor(blacklist.blacktype)}`}>
                          {blacklist.blacktype}
                        </span>
                      </TableCell>
                      <TableCell>
                        <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {blacklist.blacklist}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteBlacklist(blacklist.blacklist, blacklist.blacktype)}
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
