"use client"

import { useState } from "react"
import Image from "next/image"
import { useKeyAuth } from "@/lib/keyauth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Key,
  Users,
  Download,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Loader2,
  Gift,
  Shield,
} from "lucide-react"
import Link from "next/link"

export default function DashboardOverview() {
  const {
    sellerKey,
    setSellerKey,
    isOwner,
    role,
    setRole,
    appDetails,
    stats,
    isLoading,
    isVerifying,
    error,
    refreshData,
    clearOwnerKey,
  } = useKeyAuth()

  const [inputKey, setInputKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSaveKey = () => {
    if (inputKey.trim()) {
      setSellerKey(inputKey.trim())
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totusers || "0",
      icon: Users,
      href: "/dashboard/users",
      colorClass: "text-blue-400",
      bgClass: "bg-blue-400/10",
    },
    {
      title: "Total Licenses",
      value: stats?.totalkeys || "0",
      icon: Key,
      href: "/dashboard/licenses",
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      title: "Online Users",
      value: stats?.onlineusers || "0",
      icon: Activity,
      href: "/dashboard/sessions",
      colorClass: "text-green-400",
      bgClass: "bg-green-400/10",
    },
    {
      title: "Total Files",
      value: stats?.totalfiles || "0",
      icon: Download,
      href: "/dashboard/files",
      colorClass: "text-amber-400",
      bgClass: "bg-amber-400/10",
    },
  ]

  // ── No role selected yet: show login / role picker ──────────────────────
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/flake-logo.png"
              alt="Flake Services"
              width={220}
              height={80}
              className="object-contain"
              priority
            />
            <p className="text-muted-foreground text-sm text-center">
              Select how you want to access the dashboard
            </p>
          </div>

          {/* Owner login */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Owner Access</CardTitle>
              </div>
              <CardDescription>
                Enter your KeyAuth seller key. Access is restricted to the Flake Services owner account.{" "}
                <a
                  href="https://keyauth.cc/app/?page=seller-settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Find your key <ExternalLink className="h-3 w-3" />
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="Enter your seller key"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
                  className="pr-10 font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleSaveKey}
                disabled={!inputKey.trim() || isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Access Owner Dashboard
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* User access */}
          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium">Regular User</p>
                  <p className="text-sm text-muted-foreground">
                    Access downloads, redeem keys, and rebrand tools.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setRole("user")} className="shrink-0">
                  <Gift className="h-4 w-4 mr-2" />
                  Enter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ── User dashboard ──────────────────────────────────────────────────────
  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-8 text-center">
          <Image
            src="/flake-logo.png"
            alt="Flake Services"
            width={220}
            height={80}
            className="object-contain mx-auto"
            priority
          />
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Welcome to Flake Services</h1>
            <p className="text-muted-foreground">Use the sidebar to navigate your account.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Redeem Key", href: "/dashboard/redeem-key", icon: Gift, desc: "Activate a license key" },
              { name: "Downloads", href: "/dashboard/downloads", icon: Download, desc: "Download your files" },
              { name: "Rebrand", href: "/dashboard/rebrand", icon: RefreshCw, desc: "Rebrand your tools" },
            ].map((item) => (
              <Link key={item.name} href={item.href}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-5 flex flex-col items-center gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Owner dashboard ─────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            {appDetails?.name ? `Managing: ${appDetails.name}` : "Welcome back, Owner"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={clearOwnerKey} className="text-muted-foreground">
            Switch Role
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm flex-1">{error}</p>
            <Button variant="outline" size="sm" onClick={refreshData}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* App Details */}
      {appDetails && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate">{appDetails.name}</CardTitle>
                <CardDescription>Version {appDetails.version}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Owner ID</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono bg-muted px-2 py-1 rounded text-xs truncate max-w-[200px]">
                    {appDetails.ownerid}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => copyToClipboard(appDetails.ownerid)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Application Secret</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono bg-muted px-2 py-1 rounded text-xs truncate max-w-[200px]">
                    {showKey ? appDetails.secret : "••••••••••••••••"}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  {showKey && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => copyToClipboard(appDetails.secret)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {copied && <p className="text-xs text-primary mt-2">Copied to clipboard!</p>}
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{stat.title}</p>
                    <p className="text-2xl lg:text-3xl font-semibold mt-1">
                      {isLoading ? "-" : stat.value}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${stat.bgClass} shrink-0`}>
                    <stat.icon className={`h-5 w-5 ${stat.colorClass}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Quick Actions</h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Create License", href: "/dashboard/licenses", description: "Generate new license keys" },
            { name: "Manage Users", href: "/dashboard/users", description: "View and manage users" },
            { name: "Upload Files", href: "/dashboard/files", description: "Upload downloadable files" },
            { name: "View Logs", href: "/dashboard/logs", description: "Monitor application activity" },
          ].map((link) => (
            <Link key={link.name} href={link.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-4">
                  <p className="font-medium text-sm">{link.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Seller Key Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Seller Key</CardTitle>
          <CardDescription>Your current active seller key</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                type={showKey ? "text" : "password"}
                value={sellerKey}
                readOnly
                className="pr-10 font-mono text-sm cursor-default"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(sellerKey)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Stored locally in your browser only.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
