"use client"

import { useState, useEffect, useCallback } from "react"
import { useKeyAuth } from "@/lib/keyauth-context"
import {
  getAllResellers,
  createReseller,
  deleteReseller,
  addResellerBalance,
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
import { UserCog, RefreshCw, Plus, AlertCircle, Trash2, DollarSign, Search, Loader2 } from "lucide-react"

interface Reseller {
  user: string
  role: string
  balance: number
}

export default function ResellersPage() {
  const { sellerKey, isConfigured, isOwner } = useKeyAuth()
  const [resellers, setResellers] = useState<Reseller[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newUser, setNewUser] = useState("")
  const [newPass, setNewPass] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newKeyLevels, setNewKeyLevels] = useState("1")
  const [newRole, setNewRole] = useState<"Reseller" | "Manager">("Reseller")

  // Add balance dialog
  const [balanceOpen, setBalanceOpen] = useState(false)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [balanceUser, setBalanceUser] = useState("")
  const [balanceAmount, setBalanceAmount] = useState("")

  // Delete loading
  const [deletingUser, setDeletingUser] = useState<string | null>(null)

  const fetchResellers = useCallback(async () => {
    if (!isConfigured) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAllResellers(sellerKey)
      if (data.success && Array.isArray((data as { accounts?: Reseller[] }).accounts)) {
        setResellers((data as { accounts: Reseller[] }).accounts)
      } else if (data.message?.toLowerCase().includes("no reseller")) {
        setResellers([])
      } else {
        setError(data.message || "Failed to fetch resellers")
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

  const handleCreate = async () => {
    if (!newUser || !newPass) return
    setCreateLoading(true)
    setError(null)
    try {
      const data = await createReseller(sellerKey, newUser, newPass, newRole, newEmail, newKeyLevels)
      if (data.success) {
        setCreateOpen(false)
        setNewUser("")
        setNewPass("")
        setNewEmail("")
        setNewKeyLevels("1")
        setNewRole("Reseller")
        fetchResellers()
      } else {
        setError(data.message || "Failed to create reseller")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDelete = async (user: string) => {
    setDeletingUser(user)
    try {
      const data = await deleteReseller(sellerKey, user)
      if (data.success) {
        fetchResellers()
      } else {
        setError(data.message || "Failed to delete reseller")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setDeletingUser(null)
    }
  }

  const handleAddBalance = async () => {
    const amount = parseFloat(balanceAmount)
    if (!balanceUser || isNaN(amount) || amount <= 0) return
    setBalanceLoading(true)
    try {
      const data = await addResellerBalance(sellerKey, balanceUser, amount)
      if (data.success) {
        setBalanceOpen(false)
        setBalanceUser("")
        setBalanceAmount("")
        fetchResellers()
      } else {
        setError(data.message || "Failed to add balance")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setBalanceLoading(false)
    }
  }

  const filtered = resellers.filter(
    (r) =>
      r.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.role?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isOwner) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm">Reseller management is restricted to the owner account.</p>
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
          <p className="text-muted-foreground">
            Manage resellers and managers. Creating a reseller automatically generates a rebrand of your app.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchResellers} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {/* Add Balance dialog */}
          <Dialog open={balanceOpen} onOpenChange={setBalanceOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <DollarSign className="h-4 w-4 mr-2" />
                Add Balance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Balance to Reseller</DialogTitle>
                <DialogDescription>
                  Add credits to an existing reseller account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Reseller Username</Label>
                  <Select value={balanceUser} onValueChange={setBalanceUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reseller" />
                    </SelectTrigger>
                    <SelectContent>
                      {resellers.map((r) => (
                        <SelectItem key={r.user} value={r.user}>{r.user}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    min="1"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    placeholder="e.g. 10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBalanceOpen(false)}>Cancel</Button>
                <Button onClick={handleAddBalance} disabled={balanceLoading || !balanceUser || !balanceAmount}>
                  {balanceLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Balance
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create reseller dialog */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Reseller
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Reseller / Manager</DialogTitle>
                <DialogDescription>
                  A rebrand of your app is automatically created for this reseller on KeyAuth.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={newUser}
                    onChange={(e) => setNewUser(e.target.value)}
                    placeholder="reseller_username"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="reseller@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Strong password"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={newRole} onValueChange={(v) => setNewRole(v as "Reseller" | "Manager")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reseller">Reseller</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Key Levels</Label>
                    <Input
                      value={newKeyLevels}
                      onChange={(e) => setNewKeyLevels(e.target.value)}
                      placeholder="1,2,3"
                    />
                    <p className="text-xs text-muted-foreground">Comma-separated levels</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createLoading || !newUser || !newPass || !newEmail}>
                  {createLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create
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
            <p className="text-sm flex-1">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>Dismiss</Button>
          </CardContent>
        </Card>
      )}

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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reseller Accounts</CardTitle>
          <CardDescription>{filtered.length} reseller(s)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading resellers...</p>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <UserCog className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No resellers found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((reseller) => (
                    <TableRow key={reseller.user}>
                      <TableCell className="font-medium">{reseller.user}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                          reseller.role === "manager"
                            ? "bg-amber-500/20 text-amber-500"
                            : "bg-primary/20 text-primary"
                        }`}>
                          {reseller.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{reseller.balance ?? 0} credits</span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(reseller.user)}
                          disabled={deletingUser === reseller.user}
                        >
                          {deletingUser === reseller.user
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />
                          }
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
