import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 mx-auto mb-5">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <h1 className="text-lg font-semibold text-foreground mb-2">Authentication Error</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Something went wrong during sign-in. The link may have expired or already been used. Please try again.
        </p>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/auth/login">Back to Sign In</Link>
        </Button>
      </div>
    </div>
  )
}
