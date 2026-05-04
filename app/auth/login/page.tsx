"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, Zap } from "lucide-react"

type Mode = "login" | "signup"

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Middleware will redirect to /dashboard
      window.location.href = "/dashboard"
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })

    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    // If a session is returned immediately, email confirmation is disabled — go straight to dashboard
    if (data.session) {
      window.location.href = "/dashboard"
      return
    }

    // Fallback: confirmation email was sent
    setLoading(false)
    setSuccessMsg("Account created! Check your email to confirm before signing in.")
    setEmail("")
    setPassword("")
    setUsername("")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-wide text-foreground">Flake Services</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {mode === "login" ? "Sign in to your account" : "Create a new account"}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <form onSubmit={mode === "login" ? handleLogin : handleSignUp} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="username" className="text-sm text-foreground">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="bg-input border-border focus:border-primary"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-input border-border focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={6}
                className="bg-input border-border focus:border-primary"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success">
                <span>{successMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </>
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Mode toggle */}
          <div className="mt-5 pt-5 border-t border-border text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                {"Don't have an account? "}
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setError(null); setSuccessMsg(null) }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(null); setSuccessMsg(null) }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
