"use client"

import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

interface HeaderProps {
  userName?: string
}

export function Header({ userName = "User" }: HeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <header className="sticky top-0 z-30 flex h-auto min-h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()},{" "}
          <span className="text-primary">{userName}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          This is where all the <em className="text-primary not-italic font-medium">magic</em> happens!
        </p>
      </div>

      <Button
        variant="outline"
        className="gap-2 border-border bg-secondary hover:bg-muted"
      >
        <User className="h-4 w-4" />
        User Account
      </Button>
    </header>
  )
}
