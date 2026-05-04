"use client"

import { useState, useEffect, useCallback } from "react"
import { useKeyAuth } from "@/lib/keyauth-context"
import {
  getAllLicenses,
  createLicense,
  deleteLicense,
  banLicense,
  unbanLicense,
  setLicenseNote,
  type License,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Key,
  Plus,
  RefreshCw,
  MoreHorizontal,
  Copy,
  Trash2,
  Ban,
  Check,
  Search,
  AlertCircle,
  StickyNote,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function LicensesPage() {
  const { sellerKey, isConfigured } = useKeyAuth()
  const [licenses, setLicenses] = useState<License[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createForm, setCreateForm] = useState({
    expiry: "30",
    amount: "1",
    mask: "******-******-******-******",
    level: "1",
    note: "",
    character: "2" as "1" | "2" | "3",
  })
  const [createdKeys, setCreatedKeys] = useState<string[]>([])

  // Note dialog state
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteKey, setNoteKey] = useState("")
  const [noteValue, setNoteValue] = useState("")
  const [noteLoading, setNoteLoading] = useState(false)

  const fetchLicenses = useCallback(async () => {
    if (!isConfigured) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await getAllLicenses(sellerKey)
      if (response.success && response.keys) {
        setLicenses(response.keys as License[])
      } else {
        if (response.message === "No keys found") {
          setLicenses([])
        } else {
          setError(response.message || "Failed to fetch licenses")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [sellerKey, isConfigured])

  useEffect(() => {
    fetchLicenses()
  }, [fetchLicenses])

  const handleCreateLicense = async () => {
    setCreateLoading(true)
    try {
      const response = await createLicense(sellerKey, {
        expiry: parseInt(createForm.expiry),
        amount: parseInt(createForm.amount),
        mask: createForm.mask,
        level: parseInt(createForm.level),
        note: createForm.note,
        character: parseInt(createForm.character) as 1 | 2 | 3,
      })

      if (response.success) {
        const keys = response.keys || (response.key ? [response.key as string] : [])
        setCreatedKeys(keys)
        fetchLicenses()
      } else {
        setError(response.message || "Failed to create license")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteLicense = async (key: string) => {
    try {
      const response = await deleteLicense(sellerKey, key)
      if (response.success) {
        fetchLicenses()
      } else {
        setError(response.message || "Failed to delete license")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleBanLicense = async (key: string) => {
    try {
      const response = await banLicense(sellerKey, key, "Banned via dashboard")
      if (response.success) {
        fetchLicenses()
      } else {
        setError(response.message || "Failed to ban license")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleUnbanLicense = async (key: string) => {
    try {
      const response = await unbanLicense(sellerKey, key)
      if (response.success) {
        fetchLicenses()
      } else {
        setError(response.message || "Failed to unban license")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleSetNote = async () => {
    setNoteLoading(true)
    try {
      const response = await setLicenseNote(sellerKey, noteKey, noteValue)
      if (response.success) {
        setNoteOpen(false)
        fetchLicenses()
      } else {
        setError(response.message || "Failed to set note")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setNoteLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const filteredLicenses = licenses.filter((license) => {
    const matchesSearch =
      license.key?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.usedby?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.note?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "used" && license.usedby) ||
      (statusFilter === "unused" && !license.usedby) ||
      (statusFilter === "banned" && license.banned === "1")

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (license: License) => {
    if (license.banned === "1") {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-destructive/20 text-destructive">Banned</span>
    }
    if (license.usedby) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">Used</span>
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">Unused</span>
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
            <Key className="h-6 w-6" />
            Licenses
          </h1>
          <p className="text-muted-foreground">Manage your license keys</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLicenses} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={createOpen} onOpenChange={(open) => {
            setCreateOpen(open)
            if (!open) setCreatedKeys([])
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create License
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New License</DialogTitle>
                <DialogDescription>Generate new license keys for your application</DialogDescription>
              </DialogHeader>

              {createdKeys.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium text-primary mb-2">
                      {createdKeys.length} license(s) created successfully!
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {createdKeys.map((key, i) => (
                        <div key={i} className="flex items-center gap-2 bg-background rounded p-2">
                          <code className="flex-1 text-xs font-mono truncate">{key}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => copyToClipboard(key)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => {
                    copyToClipboard(createdKeys.join("\n"))
                  }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All Keys
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expiry (days)</Label>
                      <Input
                        type="number"
                        value={createForm.expiry}
                        onChange={(e) => setCreateForm({ ...createForm, expiry: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={createForm.amount}
                        onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Key Mask</Label>
                    <Input
                      value={createForm.mask}
                      onChange={(e) => setCreateForm({ ...createForm, mask: e.target.value })}
                      placeholder="******-******-******"
                    />
                    <p className="text-xs text-muted-foreground">Use * for random characters</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <Input
                        type="number"
                        min="1"
                        value={createForm.level}
                        onChange={(e) => setCreateForm({ ...createForm, level: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Character Type</Label>
                      <Select
                        value={createForm.character}
                        onValueChange={(v) => setCreateForm({ ...createForm, character: v as "1" | "2" | "3" })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Mixed Case</SelectItem>
                          <SelectItem value="2">Uppercase</SelectItem>
                          <SelectItem value="3">Lowercase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Note (optional)</Label>
                    <Input
                      value={createForm.note}
                      onChange={(e) => setCreateForm({ ...createForm, note: e.target.value })}
                      placeholder="Add a note to identify this license"
                    />
                  </div>

                  <DialogFooter>
                    <Button onClick={handleCreateLicense} disabled={createLoading} className="w-full">
                      {createLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Generate {createForm.amount} License(s)
                    </Button>
                  </DialogFooter>
                </div>
              )}
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
                placeholder="Search by key, user, or note..."
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
                <SelectItem value="unused">Unused</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Licenses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">License Keys</CardTitle>
          <CardDescription>
            {filteredLicenses.length} of {licenses.length} licenses
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Used By</TableHead>
                  <TableHead className="hidden lg:table-cell">Expires</TableHead>
                  <TableHead className="hidden lg:table-cell">Note</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading licenses...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredLicenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Key className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No licenses found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLicenses.slice(0, 100).map((license) => (
                    <TableRow key={license.key}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs bg-muted px-2 py-1 rounded truncate max-w-[180px]">
                            {license.key}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(license.key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(license)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {license.usedby || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {license.expires ? (
                          <span className="text-sm">
                            {formatDistanceToNow(new Date(parseInt(license.expires) * 1000), { addSuffix: true })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm truncate max-w-[150px] block">
                          {license.note || <span className="text-muted-foreground">-</span>}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyToClipboard(license.key)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Key
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setNoteKey(license.key)
                              setNoteValue(license.note || "")
                              setNoteOpen(true)
                            }}>
                              <StickyNote className="h-4 w-4 mr-2" />
                              Set Note
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {license.banned === "1" ? (
                              <DropdownMenuItem onClick={() => handleUnbanLicense(license.key)}>
                                <Check className="h-4 w-4 mr-2" />
                                Unban License
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleBanLicense(license.key)}>
                                <Ban className="h-4 w-4 mr-2" />
                                Ban License
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteLicense(license.key)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete License
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
          {filteredLicenses.length > 100 && (
            <div className="p-4 text-center text-sm text-muted-foreground border-t">
              Showing first 100 of {filteredLicenses.length} licenses
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note Dialog */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set License Note</DialogTitle>
            <DialogDescription>Add or update a note for this license</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>License Key</Label>
              <code className="block font-mono text-xs bg-muted px-3 py-2 rounded">{noteKey}</code>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Input
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                placeholder="Enter a note for this license"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button onClick={handleSetNote} disabled={noteLoading}>
              {noteLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
