"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Settings,
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react"

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [notifications, setNotifications] = useState(true)
  const [twoFactor, setTwoFactor] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    setSaved(false)
    
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    setIsSaving(false)
    setSaved(true)
    
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-30 flex h-auto min-h-16 items-center border-b border-border bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account preferences and security
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-2xl space-y-6">
          {/* Profile Settings */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Profile Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 bg-input border-border focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-input border-border focus:border-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Security</CardTitle>
                  <CardDescription>Manage your security preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Current Password</label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  className="h-11 bg-input border-border focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  className="h-11 bg-input border-border focus:border-primary"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                </div>
                <Switch
                  checked={twoFactor}
                  onCheckedChange={setTwoFactor}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <CardDescription>Configure notification preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates about your licenses</p>
                  </div>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Saved Successfully
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
