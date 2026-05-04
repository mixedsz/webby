"use client"

import { useState, useEffect, useCallback } from "react"
import { useKeyAuth } from "@/lib/keyauth-context"
import { getAllFiles, uploadFile, deleteFile, type AppFile } from "@/lib/keyauth-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
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
import { Download, Plus, RefreshCw, AlertCircle, Trash2, FileIcon, Link, ExternalLink } from "lucide-react"

export default function FilesPage() {
  const { sellerKey, isConfigured, appDetails } = useKeyAuth()
  const [files, setFiles] = useState<AppFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Upload dialog state
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadUrl, setUploadUrl] = useState("")
  const [uploadAuthed, setUploadAuthed] = useState(true)

  const fetchFiles = useCallback(async () => {
    if (!isConfigured) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await getAllFiles(sellerKey)
      if (response.success && response.files) {
        setFiles(response.files as AppFile[])
      } else {
        if (response.message === "No files Found") {
          setFiles([])
        } else {
          setError(response.message || "Failed to fetch files")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [sellerKey, isConfigured])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleUploadFile = async () => {
    setUploadLoading(true)
    try {
      const response = await uploadFile(sellerKey, uploadUrl, uploadAuthed)
      if (response.success) {
        setUploadOpen(false)
        setUploadUrl("")
        fetchFiles()
      } else {
        setError(response.message || "Failed to upload file")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setUploadLoading(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await deleteFile(sellerKey, fileId)
      if (response.success) {
        fetchFiles()
      } else {
        setError(response.message || "Failed to delete file")
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
            <Download className="h-6 w-6" />
            Files
          </h1>
          <p className="text-muted-foreground">Manage downloadable files for your application</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchFiles} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New File</DialogTitle>
                <DialogDescription>
                  Add a file URL to <span className="font-medium text-foreground">{appDetails?.name ?? "your application"}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {appDetails && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/20">
                    <span className="text-xs font-medium text-primary">Application:</span>
                    <span className="text-xs text-foreground font-semibold">{appDetails.name}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>File URL</Label>
                  <Input
                    value={uploadUrl}
                    onChange={(e) => setUploadUrl(e.target.value)}
                    placeholder="https://example.com/file.zip"
                  />
                  <p className="text-xs text-muted-foreground">
                    Direct download link to your file (e.g., GitHub releases, Dropbox, CDN)
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 border border-border p-3">
                  <div className="space-y-0.5">
                    <Label>Require Authentication</Label>
                    <p className="text-xs text-muted-foreground">
                      When enabled, users must be logged in via KeyAuth to download this file
                    </p>
                  </div>
                  <Switch checked={uploadAuthed} onCheckedChange={setUploadAuthed} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
                <Button onClick={handleUploadFile} disabled={uploadLoading || !uploadUrl}>
                  {uploadLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  Upload File
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

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Application Files</CardTitle>
          <CardDescription>
            {files.length} file(s) available
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File ID</TableHead>
                  <TableHead className="hidden md:table-cell">Name</TableHead>
                  <TableHead className="hidden lg:table-cell">Size</TableHead>
                  <TableHead>Auth Required</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading files...</p>
                    </TableCell>
                  </TableRow>
                ) : files.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <FileIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No files uploaded</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{file.id}</code>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{file.name || "-"}</TableCell>
                      <TableCell className="hidden lg:table-cell">{file.size || "-"}</TableCell>
                      <TableCell>
                        {file.authed === "1" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">Yes</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {file.url && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={file.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteFile(file.id)}
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
    </div>
  )
}
