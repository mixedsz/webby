"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, LogOut } from "lucide-react"

export default function LogoutPage() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(true)

  useEffect(() => {
    const logout = async () => {
      // Clear Flake Services session from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("flake_seller_key")
        localStorage.removeItem("flake_role")
        // Legacy key cleanup
        localStorage.removeItem("keyauth_seller_key")
      }

      await new Promise((resolve) => setTimeout(resolve, 1200))
      setIsLoggingOut(false)

      setTimeout(() => {
        router.push("/dashboard")
      }, 800)
    }

    logout()
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-border bg-card">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            {isLoggingOut ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <LogOut className="h-8 w-8 text-primary" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isLoggingOut ? "Logging out..." : "Logged out"}
          </h1>
          
          <p className="text-muted-foreground">
            {isLoggingOut
              ? "Please wait while we securely log you out."
              : "You have been successfully logged out. Redirecting..."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
