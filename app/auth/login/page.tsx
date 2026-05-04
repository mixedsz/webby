"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, Zap, ArrowLeft } from "lucide-react"

type Mode = "login" | "signup" | "forgot"

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

    // Support both username and email login
    // If it contains @, treat as email, otherwise try as username
    let loginEmail = username.trim()
    
    if (!loginEmail.includes("@")) {
      // It's a username - try the generated email format first
      loginEmail = `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}@flakeservices.local`
    }
    
    // First attempt with the determined email
    let { error: loginError } = await supabase.auth.signInWithPassword({ 
      email: loginEmail, 
      password 
    })

    // If failed and username didn't contain @, maybe they signed up with a real email
    // but entered their username. Try to look them up or show appropriate error.
    if (loginError && !username.includes("@")) {
      // Try the original username as-is (in case it's actually an email they misremember)
      const { error: retryError } = await supabase.auth.signInWithPassword({
        email: username.trim(),
        password
      })
      loginError = retryError
    }

    if (loginError) {
      // Provide helpful error message
      if (loginError.message.includes("Invalid login")) {
        setError("Invalid username/email or password. If you signed up with an email before, try using that instead.")
      } else {
        setError(loginError.message)
      }
      setLoading(false)
    } else {
      window.location.href = "/dashboard"
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    if (!username.trim()) {
      setError("Username is required")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    // Generate a unique email that won't trigger email sending
    // Using a timestamp to ensure uniqueness
    const sanitizedUsername = username.toLowerCase().replace(/[^a-z0-9]/g, "")
    const authEmail = `${sanitizedUsername}@flakeservices.local`
    
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        data: { 
          username: username.trim(),
          display_name: username.trim(),
          recovery_email: email || null
        },
        // Don't send confirmation email for local domain
      },
    })

    if (error) {
      setLoading(false)
      if (error.message.includes("already registered") || error.message.includes("already been registered")) {
        setError("This username is already taken. Please choose another.")
      } else if (error.message.includes("rate limit")) {
        setError("Too many signup attempts. Please wait a few minutes and try again.")
      } else {
        setError(error.message)
      }
      return
    }

    // Check if we got a session (auto-confirmed)
    if (data.session) {
      window.location.href = "/dashboard"
      return
    }

    // If no session but user exists, it might need confirmation
    // For @flakeservices.local emails, Supabase shouldn't send emails
    if (data.user && !data.session) {
      // Try to sign in immediately - this works if email confirmation is disabled
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password
      })
      
      if (!signInError) {
        window.location.href = "/dashboard"
        return
      }
    }

    setLoading(false)
    setSuccessMsg("Account created! You can now sign in with your username and password.")
    setEmail("")
    setPassword("")
    setUsername("")
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    if (!email) {
      setError("Please enter your email address")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccessMsg("If an account exists with this email, you will receive a password reset link.")
    }
    setLoading(false)
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
              {mode === "login" ? "Sign in to your account" : mode === "signup" ? "Create a new account" : "Reset your password"}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          {/* Forgot Password Form */}
          {mode === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(null); setSuccessMsg(null) }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-sm text-foreground">
                  Recovery Email
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
                <p className="text-xs text-muted-foreground">
                  Enter the email you used when creating your account
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-sm text-green-500">
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
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          ) : (
            /* Login / Signup Form */
            <form onSubmit={mode === "login" ? handleLogin : handleSignUp} className="flex flex-col gap-4">
              {/* Username - shown for both login and signup */}
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

              {/* Email - only for signup (optional, for password recovery) */}
              {mode === "signup" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="text-sm text-foreground">
                    Email <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="bg-input border-border focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Only needed if you want to recover your password later
                  </p>
                </div>
              )}

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

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setError(null); setSuccessMsg(null) }}
                  className="text-xs text-primary hover:underline self-end -mt-2"
                >
                  Forgot password?
                </button>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-sm text-green-500">
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
          )}

          {/* Mode toggle */}
          {mode !== "forgot" && (
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
          )}
        </div>
      </div>
    </div>
  )
}
