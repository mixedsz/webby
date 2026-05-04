"use client"

import { useState } from "react"
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
} from "lucide-react"
import Link from "next/link"

export default function DashboardOverview() {
  const { sellerKey, setSellerKey, isConfigured, appDetails, stats, isLoading, error, refreshData } = useKeyAuth()
  const [inputKey, setInputKey] = useState(sellerKey)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSaveKey = () => {
    setSellerKey(inputKey)
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
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      title: "Total Licenses",
      value: stats?.totalkeys || "0",
      icon: Key,
      href: "/dashboard/licenses",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Online Users",
      value: stats?.onlineusers || "0",
      icon: Activity,
      href: "/dashboard/sessions",
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      title: "Total Files",
      value: stats?.totalfiles || "0",
      icon: Download,
      href: "/dashboard/files",
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
  ]

  const quickLinks = [
    { name: "Create License", href: "/dashboard/licenses", description: "Generate new license keys" },
    { name: "Manage Users", href: "/dashboard/users", description: "View and manage users" },
    { name: "Upload Files", href: "/dashboard/files", description: "Upload downloadable files" },
    { name: "View Logs", href: "/dashboard/logs", description: "Monitor application activity" },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          {isConfigured 
            ? `Welcome back! Managing ${appDetails?.name || "your application"}`
            : "Configure your seller key to get started"
          }
        </p>
      </div>

      {/* API Key Configuration */}
      {!isConfigured && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Configure Seller Key</CardTitle>
            </div>
            <CardDescription>
              Enter your KeyAuth seller key to access the dashboard. You can find it at{" "}
              <a 
                href="https://keyauth.cc/app/?page=seller-settings" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                keyauth.cc/app <ExternalLink className="h-3 w-3" />
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="Enter your 32-character seller key"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="pr-10 font-mono"
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
              <Button onClick={handleSaveKey} disabled={inputKey.length !== 32}>
                Save Key
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Your seller key is stored locally in your browser and never sent to our servers.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Configured State */}
      {isConfigured && (
        <>
          {/* Error Alert */}
          {error && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-destructive">Error</p>
                  <p className="text-sm text-muted-foreground truncate">{error}</p>
                </div>
                <Button variant="outline" size="sm" onClick={refreshData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* App Details Card */}
          {appDetails && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="truncate">{appDetails.name}</CardTitle>
                      <CardDescription>Version {appDetails.version}</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Owner ID</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono bg-muted px-2 py-1 rounded text-xs truncate max-w-[200px]">{appDetails.ownerid}</code>
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
                {copied && (
                  <p className="text-xs text-primary mt-2">Copied to clipboard!</p>
                )}
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
                      <div className={`p-2.5 rounded-lg ${stat.bgColor} shrink-0`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((link) => (
                <Link key={link.name} href={link.href}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                    <CardContent className="p-4">
                      <p className="font-medium">{link.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Seller Key Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seller Key</CardTitle>
              <CardDescription>Manage your KeyAuth seller key</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    type={showKey ? "text" : "password"}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
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
                <Button 
                  onClick={handleSaveKey} 
                  disabled={inputKey.length !== 32 || inputKey === sellerKey}
                  variant="outline"
                >
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
