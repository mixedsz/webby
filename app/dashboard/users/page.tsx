"use client"

import { useState, useEffect, useCallback } from "react"
import { useKeyAuth } from "@/lib/keyauth-context"
import {
  getAllUsers,
  deleteUser,
  banUser,
  unbanUser,
  resetUserHwid,
  pauseUser,
  unpauseUser,
  extendUserExpiration,
  type User,
} from "@/lib/keyauth-api"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  RefreshCw,
  MoreHorizontal,
  Copy,
  Trash2,
  Ban,
  Check,
  Search,
  AlertCircle,
  Pause,
  Play,
  RotateCcw,
  Clock,
} from "lucide-react"
import { format } from "date-fns"

export default function UsersPage() {
  const { sellerKey, isConfigured } = useKeyAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Extend dialog state
  const [extendOpen, setExtendOpen] = useState(false)
  const [extendUser, setExtendUser] = useState("")
  const [extendSub, setExtendSub] = useState("")
  const [extendDays, setExtendDays] = useState("30")
  const [extendLoading, setExtendLoading] = useState(false)

  // Ban dialog state
  const [banOpen, setBanOpen] = useState(false)
  const [banUsername, setBanUsername] = useState("")
  const [banReason, setBanReason] = useState("")
  const [banLoading, setBanLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    if (!isConfigured) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await getAllUsers(sellerKey)
      if (response.success && response.users) {
        setUsers(response.users as User[])
      } else {
        if (response.message === "No users found") {
          setUsers([])
        } else {
          setError(response.message || "Failed to fetch users")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [sellerKey, isConfigured])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDeleteUser = async (username: string) => {
    try {
      const response = await deleteUser(sellerKey, username)
      if (response.success) {
        fetchUsers()
      } else {
        setError(response.message || "Failed to delete user")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleBanUser = async () => {
    setBanLoading(true)
    try {
      const response = await banUser(sellerKey, banUsername, banReason || "Banned via dashboard")
      if (response.success) {
        setBanOpen(false)
        setBanReason("")
        fetchUsers()
      } else {
        setError(response.message || "Failed to ban user")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setBanLoading(false)
    }
  }

  const handleUnbanUser = async (username: string) => {
    try {
      const response = await unbanUser(sellerKey, username)
      if (response.success) {
        fetchUsers()
      } else {
        setError(response.message || "Failed to unban user")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handlePauseUser = async (username: string) => {
    try {
      const response = await pauseUser(sellerKey, username)
      if (response.success) {
        fetchUsers()
      } else {
        setError(response.message || "Failed to pause user")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleUnpauseUser = async (username: string) => {
    try {
      const response = await unpauseUser(sellerKey, username)
      if (response.success) {
        fetchUsers()
      } else {
        setError(response.message || "Failed to unpause user")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleResetHwid = async (username: string) => {
    try {
      const response = await resetUserHwid(sellerKey, username)
      if (response.success) {
        fetchUsers()
      } else {
        setError(response.message || "Failed to reset HWID")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleExtendUser = async () => {
    setExtendLoading(true)
    try {
      const response = await extendUserExpiration(sellerKey, extendUser, extendSub, parseInt(extendDays))
      if (response.success) {
        setExtendOpen(false)
        fetchUsers()
      } else {
        setError(response.message || "Failed to extend user")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setExtendLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.ip?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.hwid?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "banned" && user.banned === "1") ||
      (statusFilter === "active" && user.banned !== "1")

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (user: User) => {
    if (user.banned === "1") {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-destructive/20 text-destructive">Banned</span>
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-500">Active</span>
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
            <Users className="h-6 w-6" />
            Users
          </h1>
          <p className="text-muted-foreground">Manage your application users</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading}>
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
                placeholder="Search by username, IP, or HWID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Application Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} of {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">IP Address</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading users...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.slice(0, 100).map((user) => (
                    <TableRow key={user.username}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.username}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(user.username)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.ip ? (
                          <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{user.ip}</code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {user.lastlogin ? (
                          <span className="text-sm">
                            {format(new Date(parseInt(user.lastlogin) * 1000), "MMM d, yyyy")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {user.createdate ? (
                          <span className="text-sm">
                            {format(new Date(parseInt(user.createdate) * 1000), "MMM d, yyyy")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyToClipboard(user.username)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Username
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetHwid(user.username)}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Reset HWID
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setExtendUser(user.username)
                              setExtendSub(user.subscriptions?.[0]?.subscription || "default")
                              setExtendOpen(true)
                            }}>
                              <Clock className="h-4 w-4 mr-2" />
                              Extend Subscription
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.banned === "1" ? (
                              <DropdownMenuItem onClick={() => handleUnbanUser(user.username)}>
                                <Check className="h-4 w-4 mr-2" />
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem onClick={() => {
                                  setBanUsername(user.username)
                                  setBanOpen(true)
                                }}>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Ban User
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePauseUser(user.username)}>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Pause User
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user.username)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length > 100 && (
            <div className="p-4 text-center text-sm text-muted-foreground border-t">
              Showing first 100 of {filteredUsers.length} users
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extend Dialog */}
      <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Subscription</DialogTitle>
            <DialogDescription>Add days to user subscription</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={extendUser} disabled />
            </div>
            <div className="space-y-2">
              <Label>Subscription Name</Label>
              <Input
                value={extendSub}
                onChange={(e) => setExtendSub(e.target.value)}
                placeholder="Subscription name"
              />
            </div>
            <div className="space-y-2">
              <Label>Days to Add</Label>
              <Input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendOpen(false)}>Cancel</Button>
            <Button onClick={handleExtendUser} disabled={extendLoading}>
              {extendLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Extend Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banOpen} onOpenChange={setBanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>Ban user from accessing the application</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={banUsername} disabled />
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter ban reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBanUser} disabled={banLoading}>
              {banLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
