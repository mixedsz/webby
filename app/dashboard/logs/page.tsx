"use client"

import { useState, useEffect, useCallback } from "react"
import { useKeyAuth } from "@/lib/keyauth-context"
import { getLogs, type LogEntry } from "@/lib/keyauth-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { FileText, RefreshCw, Search, AlertCircle } from "lucide-react"
import { format } from "date-fns"

export default function LogsPage() {
  const { sellerKey, isConfigured } = useKeyAuth()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const fetchLogs = useCallback(async () => {
    if (!isConfigured) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await getLogs(sellerKey)
      if (response.success && response.logs) {
        setLogs(response.logs as LogEntry[])
      } else {
        if (response.message?.includes("No logs")) {
          setLogs([])
        } else {
          setError(response.message || "Failed to fetch logs")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [sellerKey, isConfigured])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.data?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.credential?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.pcuser?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || log.action === typeFilter

    return matchesSearch && matchesType
  })

  const uniqueActions = [...new Set(logs.map(log => log.action).filter(Boolean))]

  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case "login":
        return "bg-green-500/20 text-green-500"
      case "register":
        return "bg-blue-500/20 text-blue-500"
      case "ban":
        return "bg-red-500/20 text-red-500"
      case "upgrade":
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
            <FileText className="h-6 w-6" />
            Logs
          </h1>
          <p className="text-muted-foreground">View application activity logs</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoading}>
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Logs</CardTitle>
          <CardDescription>
            {filteredLogs.length} log entries
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="hidden md:table-cell">User</TableHead>
                  <TableHead className="hidden lg:table-cell">Details</TableHead>
                  <TableHead className="hidden xl:table-cell">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading logs...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No logs found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.slice(0, 100).map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <span className="text-sm">
                          {log.date ? format(new Date(parseInt(log.date) * 1000), "MMM d, HH:mm:ss") : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {log.credential || log.pcuser || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="truncate max-w-[200px] block text-sm">
                          {log.data || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {log.ip ? (
                          <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{log.ip}</code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredLogs.length > 100 && (
            <div className="p-4 text-center text-sm text-muted-foreground border-t">
              Showing first 100 of {filteredLogs.length} log entries
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
