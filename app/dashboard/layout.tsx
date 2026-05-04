"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { KeyAuthProvider } from "@/lib/keyauth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <KeyAuthProvider>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          {/* Mobile Header */}
          <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <MobileNav />
            <span className="font-semibold">KeyAuth</span>
          </header>
          
          {children}
        </main>
      </div>
    </KeyAuthProvider>
  )
}
