"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Download,
  RefreshCw,
  Package,
  Calendar,
  Clock,
  Key,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  licenseKey: string
  expiresAt: string
  daysRemaining: number
  downloadUrl: string
}

// Products populated from user's active licenses — shown when user has redeemed keys
const userProducts: Product[] = []

function ProductCard({ product }: { product: Product }) {
  const [isResetting, setIsResetting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleResetHWID = async () => {
    setIsResetting(true)
    setResetSuccess(false)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    setIsResetting(false)
    setResetSuccess(true)
    
    // Clear success after 3 seconds
    setTimeout(() => setResetSuccess(false), 3000)
  }

  return (
    <Card className="border-border bg-card hover:border-primary/30 transition-colors duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Product Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Package className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Key className="h-4 w-4" />
                <span className="font-mono">{product.licenseKey}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Expires: {product.expiresAt}</span>
                </div>
                <div className="flex items-center gap-1.5 text-green-400">
                  <Clock className="h-4 w-4" />
                  <span>{product.daysRemaining.toLocaleString()} days remaining</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2"
            >
              <Download className="h-4 w-4" />
              Download
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              onClick={handleResetHWID}
              disabled={isResetting}
              className="border-border bg-secondary hover:bg-muted gap-2"
            >
              {isResetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : resetSuccess ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {resetSuccess ? "Reset!" : "Reset HWID"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DownloadsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-30 flex h-auto min-h-16 items-center border-b border-border bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Downloads</h1>
            <p className="text-sm text-muted-foreground">
              Access all your purchased products and tools
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Products List */}
        {userProducts.length > 0 ? (
          <div className="space-y-4">
            {userProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No products yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {"You don't have any products activated. Redeem a license key to get started."}
              </p>
              <Link href="/dashboard/redeem-key">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Redeem a Key
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-base">Need help with downloads?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">What is HWID?</h4>
                <p className="text-sm text-muted-foreground">
                  HWID (Hardware ID) is a unique identifier for your computer. Our software uses it to prevent unauthorized sharing. If you change your hardware or reinstall Windows, you may need to reset your HWID.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Installation Issues?</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {"If you're having trouble installing or running our software, please check our installation guide or contact our support team via Discord for assistance."}
                </p>
                <Link
                  href="https://discord.gg/flakeservices"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Join our Discord
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
