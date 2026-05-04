"use client"

import { useState, useEffect } from "react"
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
import { Gift, Key, ArrowRight, AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useKeyAuth, type SavedApp } from "@/lib/keyauth-context"
import { getSubscriptions, redeemLicense, type SubscriptionPlan } from "@/lib/keyauth-api"
import { logRedemption } from "@/lib/actions"

export default function RedeemKeyPage() {
  const { sellerKey, appDetails, savedApps, isOwner } = useKeyAuth()

  // For regular users, use savedApps as available apps
  const [availableApps, setAvailableApps] = useState<SavedApp[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([])
  const [appsLoading, setAppsLoading] = useState(false)
  const [appsError, setAppsError] = useState<string | null>(null)

  const [selectedAppKey, setSelectedAppKey] = useState("")
  const [selectedSubscription, setSelectedSubscription] = useState("")
  const [licenseKey, setLicenseKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  // Get the selected app details
  const selectedApp = availableApps.find(app => app.sellerKey === selectedAppKey)

  // Load subscriptions when app is selected
  const loadSubscriptions = async (appSellerKey: string) => {
    setAppsLoading(true)
    setAppsError(null)
    try {
      const res = await getSubscriptions(appSellerKey)
      if (res.success && Array.isArray(res.subscriptions)) {
        setSubscriptions(res.subscriptions as SubscriptionPlan[])
      } else {
        setAppsError(res.message || "Failed to load subscription plans.")
      }
    } catch (err) {
      setAppsError(err instanceof Error ? err.message : "Failed to load subscription plans.")
    } finally {
      setAppsLoading(false)
    }
  }

  // Initialize available apps from savedApps or current owner app
  useEffect(() => {
    if (savedApps.length > 0) {
      setAvailableApps(savedApps)
      // Auto-select the first app or current active app
      const activeApp = savedApps.find(app => app.sellerKey === sellerKey) || savedApps[0]
      if (activeApp) {
        setSelectedAppKey(activeApp.sellerKey)
        loadSubscriptions(activeApp.sellerKey)
      }
    } else if (isOwner && sellerKey && appDetails) {
      // Fallback for owner without savedApps
      const ownerApp: SavedApp = {
        sellerKey,
        appDetails,
        stats: { totusers: "0", totalkeys: "0", onlineusers: "0", totalfiles: "0" }
      }
      setAvailableApps([ownerApp])
      setSelectedAppKey(sellerKey)
      loadSubscriptions(sellerKey)
    }
  }, [savedApps, sellerKey, appDetails, isOwner])

  // Reload subscriptions when selected app changes
  useEffect(() => {
    if (selectedAppKey) {
      setSelectedSubscription("")
      loadSubscriptions(selectedAppKey)
    }
  }, [selectedAppKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedApp || !licenseKey.trim()) {
      setStatus("error")
      setMessage("Please select an application and enter a license key.")
      return
    }

    if (!selectedApp.appDetails?.name || !selectedApp.appDetails?.ownerid) {
      setStatus("error")
      setMessage("App configuration is missing. Please contact the owner.")
      return
    }

    setIsLoading(true)
    setStatus("idle")

    try {
      const result = await redeemLicense(
        selectedApp.appDetails.name,
        selectedApp.appDetails.ownerid,
        licenseKey.trim()
      )

      // Log the redemption attempt to Supabase
      logRedemption({
        appName: selectedApp.appDetails.name,
        licenseKey: licenseKey.trim(),
        success: result.success,
        message: result.message || "",
      }).catch(() => {
        // Non-critical — don't surface DB errors to the user
      })

      if (result.success) {
        setStatus("success")
        setMessage(result.message || "License key activated successfully! Your subscription is now active.")
        setLicenseKey("")
        // Store the redeemed license for the Downloads page
        if (typeof window !== "undefined") {
          const storedLicenses = JSON.parse(localStorage.getItem("flake_redeemed_licenses") || "[]")
          storedLicenses.push({
            appName: selectedApp.appDetails.name,
            licenseKey: licenseKey.trim(),
            redeemedAt: new Date().toISOString(),
            sellerKey: selectedApp.sellerKey,
          })
          localStorage.setItem("flake_redeemed_licenses", JSON.stringify(storedLicenses))
        }
      } else {
        setStatus("error")
        setMessage(result.message || "Invalid license key. Please check your key and try again.")
      }
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
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
                {/* Application Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Select Application
                  </label>

                  {appsError && (
                    <p className="text-xs text-destructive">{appsError}</p>
                  )}

                  {availableApps.length === 0 ? (
                    <div className="p-4 rounded-lg border border-border bg-muted/30 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        No applications available
                      </p>
                      <p className="text-xs text-muted-foreground">
                        An owner needs to configure applications first. If you are the owner, please log in with your seller key in the Overview page.
                      </p>
                    </div>
                  ) : (
                    <Select
                      value={selectedAppKey}
                      onValueChange={setSelectedAppKey}
                      disabled={appsLoading}
                    >
                      <SelectTrigger className="w-full h-12 bg-input border-primary/50 focus:border-primary focus:ring-primary">
                        <SelectValue placeholder="Select an application" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {availableApps.map((app) => (
                          <SelectItem
                            key={app.sellerKey}
                            value={app.sellerKey}
                            className="focus:bg-secondary"
                          >
                            {app.appDetails.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
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
                  disabled={isLoading || appsLoading || availableApps.length === 0 || !selectedAppKey}
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
    </div>
  )
}
