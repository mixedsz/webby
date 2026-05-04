"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
  RefreshCw,
  Gift,
  ChevronDown,
  Plus,
  X,
  Check,
} from "lucide-react"
import { useKeyAuth } from "@/lib/keyauth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Owner-only full navigation
const ownerNavigation = [
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

// Regular user navigation — matches the screenshot provided
const userNavigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Redeem Key", href: "/dashboard/redeem-key", icon: Gift },
  { name: "Downloads", href: "/dashboard/downloads", icon: Download },
  { name: "Rebrand", href: "/dashboard/rebrand", icon: RefreshCw },
]

export function Sidebar() {
  const pathname = usePathname()
  const { appDetails, isOwner, role, savedApps, switchApp, removeApp, clearOwnerKey, sellerKey } = useKeyAuth()

  const navigation = isOwner ? ownerNavigation : userNavigation

  return (
    <aside className="fixed left-0 top-0 z-40 hidden lg:flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-20 items-center justify-center border-b border-border px-4">
        <Image
          src="/flake-logo.png"
          alt="Flake Services"
          width={160}
          height={60}
          className="object-contain h-14 w-auto"
          priority
        />
      </div>

      {/* App Switcher - Only show for owners with apps */}
      {isOwner && appDetails && (
        <div className="px-3 py-3 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-auto py-2 px-3 bg-background/50 hover:bg-accent"
              >
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-xs text-muted-foreground">Current App</span>
                  <span className="text-sm font-medium truncate w-full text-left">
                    {appDetails.name}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[232px]">
              {savedApps.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Your Applications
                  </div>
                  {savedApps.map((app) => (
                    <DropdownMenuItem
                      key={app.sellerKey}
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => switchApp(app)}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {app.sellerKey === sellerKey && (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                        <span className={cn(
                          "truncate",
                          app.sellerKey !== sellerKey && "ml-5"
                        )}>
                          {app.appDetails.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeApp(app.sellerKey)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => clearOwnerKey()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Application
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/15 text-primary"
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

      {/* Bottom — user info + logout */}
      <div className="border-t border-border p-3 space-y-1">
        {role && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 shrink-0">
              <span className="text-xs font-bold text-primary uppercase">
                {isOwner ? "O" : "U"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {isOwner ? (appDetails?.name || "Owner") : "User Account"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {isOwner ? "Seller / Owner" : "Member"}
              </p>
            </div>
          </div>
        )}
        <Link
          href="/logout"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </Link>
      </div>
    </aside>
  )
}
