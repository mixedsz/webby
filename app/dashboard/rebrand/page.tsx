"use client"

import { useKeyAuth } from "@/lib/keyauth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, ExternalLink, UserCog, Shield, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function RebrandPage() {
  const { isOwner, appDetails } = useKeyAuth()

  // Users should not see rebrand page contents
  if (!isOwner) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm">You do not have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <RefreshCw className="h-6 w-6" />
          Rebrand Management
        </h1>
        <p className="text-muted-foreground">
          Rebrands are tied directly to resellers. Creating a reseller on KeyAuth automatically generates a rebrand of your application.
        </p>
      </div>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How Rebrands Work</CardTitle>
          <CardDescription>
            KeyAuth automatically handles rebrand creation when you add a reseller
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              {
                step: "1",
                title: "Create a Reseller",
                desc: "Go to the Resellers page and create a new reseller or manager account.",
              },
              {
                step: "2",
                title: "Automatic Rebrand",
                desc: "KeyAuth automatically creates a rebrand of your application tied to that reseller's account.",
              },
              {
                step: "3",
                title: "Reseller Gets Access",
                desc: "The reseller can log into KeyAuth with their credentials and manage their rebrand application independently.",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold text-sm shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Application */}
      {appDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Current Application
            </CardTitle>
            <CardDescription>This is the app that gets rebranded for your resellers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
              <div>
                <p className="font-semibold">{appDetails.name}</p>
                <p className="text-sm text-muted-foreground">Version {appDetails.version} &middot; Owner ID: {appDetails.ownerid}</p>
              </div>
              <Shield className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="p-2.5 w-fit rounded-lg bg-primary/10">
              <UserCog className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Manage Resellers</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage reseller accounts. Each reseller gets their own rebrand automatically.
              </p>
            </div>
            <Button asChild className="w-full mt-auto">
              <Link href="/dashboard/resellers">Go to Resellers</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="p-2.5 w-fit rounded-lg bg-secondary">
              <ExternalLink className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="font-semibold">KeyAuth Dashboard</p>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage all rebrand applications directly on KeyAuth.
              </p>
            </div>
            <Button variant="outline" asChild className="w-full mt-auto">
              <a href="https://keyauth.cc/app/?page=resellers" target="_blank" rel="noopener noreferrer">
                Open KeyAuth
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
