"use client"

import { useState, useEffect, useCallback } from "react"
import { useKeyAuth } from "@/lib/keyauth-context"
import { getAllVariables, createVariable, deleteVariable, editVariable, type Variable } from "@/lib/keyauth-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Globe, Plus, RefreshCw, AlertCircle, Trash2, Pencil, Copy } from "lucide-react"

export default function VariablesPage() {
  const { sellerKey, isConfigured } = useKeyAuth()
  const [variables, setVariables] = useState<Variable[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createData, setCreateData] = useState("")
  const [createAuthed, setCreateAuthed] = useState(true)

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editId, setEditId] = useState("")
  const [editData, setEditData] = useState("")

  const fetchVariables = useCallback(async () => {
    if (!isConfigured) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await getAllVariables(sellerKey)
      if (response.success && response.vars) {
        setVariables(response.vars as Variable[])
      } else {
        if (response.message?.includes("No variables")) {
          setVariables([])
        } else {
          setError(response.message || "Failed to fetch variables")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [sellerKey, isConfigured])

  useEffect(() => {
    fetchVariables()
  }, [fetchVariables])

  const handleCreateVariable = async () => {
    setCreateLoading(true)
    try {
      const response = await createVariable(sellerKey, createName, createData, createAuthed)
      if (response.success) {
        setCreateOpen(false)
        setCreateName("")
        setCreateData("")
        fetchVariables()
      } else {
        setError(response.message || "Failed to create variable")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleEditVariable = async () => {
    setEditLoading(true)
    try {
      const response = await editVariable(sellerKey, editId, editData)
      if (response.success) {
        setEditOpen(false)
        fetchVariables()
      } else {
        setError(response.message || "Failed to update variable")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteVariable = async (varId: string) => {
    try {
      const response = await deleteVariable(sellerKey, varId)
      if (response.success) {
        fetchVariables()
      } else {
        setError(response.message || "Failed to delete variable")
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
            <Globe className="h-6 w-6" />
            Global Variables
          </h1>
          <p className="text-muted-foreground">Manage global variables accessible by your application</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchVariables} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Variable
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Variable</DialogTitle>
                <DialogDescription>
                  Add a new global variable for your application
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Variable Name</Label>
                  <Input
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g., api_endpoint, version"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Textarea
                    value={createData}
                    onChange={(e) => setCreateData(e.target.value)}
                    placeholder="Variable value..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Authentication</Label>
                    <p className="text-xs text-muted-foreground">
                      Only authenticated users can access
                    </p>
                  </div>
                  <Switch checked={createAuthed} onCheckedChange={setCreateAuthed} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateVariable} disabled={createLoading || !createName}>
                  {createLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  Create Variable
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

      {/* Variables Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Variables</CardTitle>
          <CardDescription>
            {variables.length} variable(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Value</TableHead>
                  <TableHead>Auth Required</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading variables...</p>
                    </TableCell>
                  </TableRow>
                ) : variables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Globe className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No variables created</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  variables.map((variable) => (
                    <TableRow key={variable.varid}>
                      <TableCell className="font-medium">{variable.varid}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                            {variable.msg}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(variable.msg)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {variable.authed === "1" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">Yes</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditId(variable.varid)
                              setEditData(variable.msg)
                              setEditOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteVariable(variable.varid)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Variable</DialogTitle>
            <DialogDescription>
              Update the value of {editId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Value</Label>
              <Textarea
                value={editData}
                onChange={(e) => setEditData(e.target.value)}
                placeholder="Variable value..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditVariable} disabled={editLoading}>
              {editLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
