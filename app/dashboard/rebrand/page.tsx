"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  RefreshCw,
  Key,
  Plus,
  AlertCircle,
  ExternalLink,
  Clock,
  Trash2,
  Tag,
  FileText,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Headphones,
  Shield,
  Loader2,
} from "lucide-react"
import Link from "next/link"

const products = [
  { id: "boost-bot", name: "Boost Bot" },
  { id: "sellauth-aio", name: "SellAuth AIO" },
  { id: "keyauth-bot", name: "KeyAuth Bot" },
  { id: "discord-tool", name: "Discord Tool" },
]

const durations = [
  { id: "1day", name: "1 Day" },
  { id: "7days", name: "7 Days" },
  { id: "30days", name: "30 Days" },
  { id: "90days", name: "90 Days" },
  { id: "365days", name: "1 Year" },
  { id: "lifetime", name: "Lifetime" },
]

interface LicenseKey {
  id: string
  key: string
  product: string
  expiresAt: string
  note: string | null
}

const existingKeys: LicenseKey[] = []

const benefits = [
  { icon: Sparkles, text: "Custom branding for your business" },
  { icon: Shield, text: "Full control over license management" },
  { icon: Headphones, text: "Priority support and updates" },
  { icon: DollarSign, text: "Increased revenue opportunities" },
]

export default function RebrandPage() {
  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedDuration, setSelectedDuration] = useState("")
  const [note, setNote] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [keys, setKeys] = useState<LicenseKey[]>(existingKeys)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [resettingId, setResettingId] = useState<string | null>(null)

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProduct || !selectedDuration) return

    setIsCreating(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    const newKey: LicenseKey = {
      id: Date.now().toString(),
      key: `Reliant-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 8)}`,
      product: products.find((p) => p.id === selectedProduct)?.name || "",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " "),
      note: note || null,
    }
    
    setKeys([newKey, ...keys])
    setSelectedProduct("")
    setSelectedDuration("")
    setNote("")
    setIsCreating(false)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setKeys(keys.filter((k) => k.id !== id))
    setDeletingId(null)
  }

  const handleResetHWID = async (id: string) => {
    setResettingId(id)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setResettingId(null)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-30 flex h-auto min-h-16 items-center border-b border-border bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <RefreshCw className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rebrand Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage your rebrand licenses and create new keys
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Top Grid - Create Key + Info */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Create License Key Form */}
          <Card className="lg:col-span-2 border-border bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Create License Key</CardTitle>
                  <CardDescription>Generate a new license for your customers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateKey} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Product Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Select Product
                    </label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="w-full h-11 bg-input border-border focus:border-primary">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {products.map((product) => (
                          <SelectItem
                            key={product.id}
                            value={product.id}
                            className="focus:bg-secondary"
                          >
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      License Duration
                    </label>
                    <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                      <SelectTrigger className="w-full h-11 bg-input border-border focus:border-primary">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {durations.map((duration) => (
                          <SelectItem
                            key={duration.id}
                            value={duration.id}
                            className="focus:bg-secondary"
                          >
                            {duration.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Note Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Note (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Add a note for this license"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="h-11 bg-input border-border focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    This note will help you identify the license later
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isCreating || !selectedProduct || !selectedDuration}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create License Key
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Rebrand Information */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <FileText className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Rebrand Information</CardTitle>
                  <CardDescription>Important updates and support resources</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Need Help */}
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <h4 className="font-medium text-foreground">Need Help?</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  If you encounter any errors or need assistance with your rebrands, our support team is available 24/7 to help you.
                </p>
                <Link
                  href="https://discord.gg/flakeservices"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Join our Discord
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Rebrand Benefits</h4>
                <ul className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <benefit.icon className="h-4 w-4 text-primary" />
                      {benefit.text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Promo Card */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground font-medium">
                  Looking to purchase additional rebrands? Contact our support team for special offers and bulk discounts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* License Keys Table */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-foreground" />
                <div>
                  <CardTitle className="text-lg">Your License Keys</CardTitle>
                </div>
              </div>
              <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                {keys.length} keys
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {keys.length > 0 ? (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="text-muted-foreground font-medium">#</TableHead>
                      <TableHead className="text-muted-foreground font-medium">LICENSE KEY</TableHead>
                      <TableHead className="text-muted-foreground font-medium">PRODUCT</TableHead>
                      <TableHead className="text-muted-foreground font-medium">TIME LEFT</TableHead>
                      <TableHead className="text-muted-foreground font-medium">NOTE</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((key, index) => (
                      <TableRow key={key.id} className="hover:bg-secondary/30">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{key.key}</TableCell>
                        <TableCell>{key.product}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {key.expiresAt}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {key.note || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResetHWID(key.id)}
                              disabled={resettingId === key.id}
                              className="h-8 px-3 border-border bg-secondary hover:bg-muted text-sm"
                            >
                              {resettingId === key.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Reset HWID
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(key.id)}
                              disabled={deletingId === key.id}
                              className="h-8 px-3 border-destructive/50 bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm"
                            >
                              {deletingId === key.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No license keys yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create your first license key using the form above
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
