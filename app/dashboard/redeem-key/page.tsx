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
import { Gift, Key, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"

const products = [
  { id: "boost-bot", name: "Boost Bot" },
  { id: "sellauth-aio", name: "SellAuth AIO" },
  { id: "keyauth-bot", name: "KeyAuth Bot" },
  { id: "discord-tool", name: "Discord Tool" },
]

export default function RedeemKeyPage() {
  const [selectedProduct, setSelectedProduct] = useState("")
  const [licenseKey, setLicenseKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProduct || !licenseKey) {
      setStatus("error")
      setMessage("Please select a product and enter a license key")
      return
    }

    setIsLoading(true)
    setStatus("idle")
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    // Mock validation - in real app, this would call KeyAuth API
    if (licenseKey.length >= 10) {
      setStatus("success")
      setMessage("License key activated successfully! Your subscription is now active.")
    } else {
      setStatus("error")
      setMessage("Invalid license key. Please check your key and try again.")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-30 flex h-auto min-h-16 items-center border-b border-border bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Redeem a Key</h1>
            <p className="text-sm text-muted-foreground">
              Activate your product license or subscription
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 flex items-start justify-center">
        <div className="w-full max-w-xl space-y-6">
          {/* Main Form Card */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Enter Your License Key</CardTitle>
                  <CardDescription>Unlock premium features and tools</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Product Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Select Product
                  </label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="w-full h-12 bg-input border-primary/50 focus:border-primary focus:ring-primary">
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

                {/* License Key Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    License Key
                  </label>
                  <Input
                    type="text"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    className="h-12 bg-input border-border focus:border-primary focus:ring-primary font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the license key you received after purchase
                  </p>
                </div>

                {/* Status Message */}
                {status !== "idle" && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      status === "success"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {status === "success" ? (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    )}
                    <p className="text-sm">{message}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      Activate License
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Having trouble with your key?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {"If you're experiencing issues with your license key, please contact our support team via Discord for assistance."}
                  </p>
                  <Link
                    href="https://discord.gg/keyauth"
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
    </div>
  )
}
