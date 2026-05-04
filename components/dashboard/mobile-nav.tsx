"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Key,
  Users,
  Download,
  Settings,
  FileText,
  Webhook,
  Shield,
  Globe,
  LogOut,
  Layers,
  Clock,
  UserCog,
  Menu,
  Zap,
} from "lucide-react"
import { useKeyAuth } from "@/lib/keyauth-context"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Licenses", href: "/dashboard/licenses", icon: Key },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Subscriptions", href: "/dashboard/subscriptions", icon: Layers },
  { name: "Sessions", href: "/dashboard/sessions", icon: Clock },
  { name: "Files", href: "/dashboard/files", icon: Download },
  { name: "Variables", href: "/dashboard/variables", icon: Globe },
  { name: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
  { name: "Logs", href: "/dashboard/logs", icon: FileText },
  { name: "Blacklists", href: "/dashboard/blacklists", icon: Shield },
  { name: "Resellers", href: "/dashboard/resellers", icon: UserCog },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { appDetails, isConfigured } = useKeyAuth()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar border-border">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-border">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-foreground tracking-tight truncate">
              {isConfigured && appDetails?.name ? appDetails.name : "KeyAuth"}
            </span>
            <span className="text-xs text-muted-foreground">Seller Dashboard</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                )}
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3 bg-sidebar">
          <Link
            href="/logout"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
