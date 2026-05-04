"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ShoppingBag,
  Receipt,
  Download,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
} from "lucide-react"

const purchases = [
  {
    id: "INV-001",
    product: "KeyAuth Bot",
    date: "May 1, 2026",
    amount: "$19.99",
    status: "completed",
    paymentMethod: "Credit Card",
  },
  {
    id: "INV-002",
    product: "SellAuth AIO",
    date: "Apr 15, 2026",
    amount: "$29.99",
    status: "completed",
    paymentMethod: "PayPal",
  },
  {
    id: "INV-003",
    product: "Boost Bot",
    date: "Mar 22, 2026",
    amount: "$14.99",
    status: "completed",
    paymentMethod: "Crypto",
  },
  {
    id: "INV-004",
    product: "Discord Tool",
    date: "Feb 10, 2026",
    amount: "$9.99",
    status: "completed",
    paymentMethod: "Credit Card",
  },
]

const stats = [
  { label: "Total Purchases", value: "4", icon: ShoppingBag },
  { label: "Total Spent", value: "$74.96", icon: CreditCard },
  { label: "Active Licenses", value: "4", icon: CheckCircle },
]

export default function PurchasesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-30 flex h-auto min-h-16 items-center border-b border-border bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Purchases</h1>
            <p className="text-sm text-muted-foreground">
              View your purchase history and invoices
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Purchase History */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Receipt className="h-5 w-5 text-foreground" />
              <div>
                <CardTitle className="text-lg">Purchase History</CardTitle>
                <CardDescription>A list of all your transactions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead className="text-muted-foreground font-medium">INVOICE</TableHead>
                    <TableHead className="text-muted-foreground font-medium">PRODUCT</TableHead>
                    <TableHead className="text-muted-foreground font-medium">DATE</TableHead>
                    <TableHead className="text-muted-foreground font-medium">AMOUNT</TableHead>
                    <TableHead className="text-muted-foreground font-medium">STATUS</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id} className="hover:bg-secondary/30">
                      <TableCell className="font-mono text-sm">{purchase.id}</TableCell>
                      <TableCell className="font-medium">{purchase.product}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {purchase.date}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">{purchase.amount}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/10 text-green-400 border-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 border-border bg-secondary hover:bg-muted text-sm"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Invoice
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
