"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  ExternalLink,
  Star,
  ShoppingCart,
} from "lucide-react"
import Link from "next/link"

const products = [
  {
    id: "1",
    name: "KeyAuth Bot",
    description: "Powerful Discord bot for managing your KeyAuth licenses and users directly from Discord.",
    price: "$19.99",
    features: ["License Management", "User Stats", "Auto Responses", "Custom Commands"],
    popular: true,
  },
  {
    id: "2",
    name: "SellAuth AIO",
    description: "All-in-one solution for selling digital products with built-in license generation.",
    price: "$29.99",
    features: ["Payment Integration", "License Generation", "Analytics Dashboard", "API Access"],
    popular: false,
  },
  {
    id: "3",
    name: "Boost Bot",
    description: "Advanced Discord server boosting tool with intelligent user management.",
    price: "$14.99",
    features: ["Auto Boost", "Member Management", "Invite Tracking", "Server Stats"],
    popular: true,
  },
  {
    id: "4",
    name: "Discord Tool",
    description: "Multi-purpose Discord utility tool for server management and automation.",
    price: "$9.99",
    features: ["Mass DM", "Server Tools", "User Management", "Automation"],
    popular: false,
  },
]

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-30 flex h-auto min-h-16 items-center border-b border-border bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground">
              Browse our available products and tools
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="border-border bg-card hover:border-primary/30 transition-colors relative overflow-hidden">
              {product.popular && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-2xl font-bold text-primary">{product.price}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{product.description}</p>
                
                <ul className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-3 pt-2">
                  <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Purchase
                  </Button>
                  <Button variant="outline" className="border-border bg-secondary hover:bg-muted">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
