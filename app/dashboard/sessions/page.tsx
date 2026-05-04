"use client"

import { useState, useEffect, useCallback } from "react"
import { useKeyAuth } from "@/lib/keyauth-context"
import { getAllSessions, endSession, endAllSessions, type Session } from "@/lib/keyauth-api"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Clock, RefreshCw, Search, AlertCircle, XCircle, Trash2 } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

export default function SessionsPage() {
  const { sellerKey, isConfigured } = useKeyAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchSessions = useCallback(async () => {
    if (!isConfigured) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await getAllSessions(sellerKey)
      if (response.success && response.sessions) {
        setSessions(response.sessions as Session[])
      } else {
        if (response.message === "No sessions found") {
          setSessions([])
        } else {
          setError(response.message || "Failed to fetch sessions")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [sellerKey, isConfigured])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleEndSession = async (sessionId: string) => {
    try {
      const response = await endSession(sellerKey, sessionId)
      if (response.success) {
        fetchSessions()
      } else {
        setError(response.message || "Failed to end session")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleEndAllSessions = async () => {
    try {
      const response = await endAllSessions(sellerKey)
      if (response.success) {
        fetchSessions()
      } else {
        setError(response.message || "Failed to end all sessions")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const filteredSessions = sessions.filter((session) =>
    session.credential?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.ip?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Clock className="h-6 w-6" />
            Sessions
          </h1>
          <p className="text-muted-foreground">Monitor and manage active sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSessions} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={sessions.length === 0}>
                <Trash2 className="h-4 w-4 mr-2" />
                End All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End all sessions?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will terminate all active sessions. Users will need to log in again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleEndAllSessions}>End All Sessions</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Sessions</CardTitle>
          <CardDescription>
            {filteredSessions.length} active session(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="hidden md:table-cell">Session ID</TableHead>
                  <TableHead className="hidden lg:table-cell">Expires</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading sessions...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No active sessions</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.credential || "-"}</TableCell>
                      <TableCell>
                        <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {session.ip || "-"}
                        </code>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <code className="font-mono text-xs truncate max-w-[150px] block">
                          {session.id}
                        </code>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {session.expiry ? (
                          <span className="text-sm">
                            {formatDistanceToNow(new Date(parseInt(session.expiry) * 1000), { addSuffix: true })}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEndSession(session.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          End
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
