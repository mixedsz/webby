"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  HelpCircle,
  MessageCircle,
  Book,
  Video,
  Mail,
  ExternalLink,
  ArrowRight,
  FileText,
  Zap,
  Shield,
} from "lucide-react"
import Link from "next/link"

const faqs = [
  {
    question: "How do I activate my license key?",
    answer: "Go to the 'Redeem Key' section in the sidebar, select your product from the dropdown, enter your license key, and click 'Activate License'. Your product will be available immediately in the Downloads section.",
  },
  {
    question: "What is HWID and why do I need to reset it?",
    answer: "HWID (Hardware ID) is a unique identifier for your computer. Our software uses it to prevent unauthorized sharing. If you change your hardware, reinstall Windows, or switch computers, you may need to reset your HWID from the Downloads page.",
  },
  {
    question: "How do I download my purchased software?",
    answer: "Navigate to the 'Downloads' section in the sidebar. You'll see all your purchased products with download buttons. Click the download button next to the product you want to download.",
  },
  {
    question: "Can I transfer my license to another account?",
    answer: "License transfers are handled on a case-by-case basis. Please contact our support team via Discord for assistance with license transfers.",
  },
  {
    question: "How do rebrands work?",
    answer: "Rebrands allow you to create custom-branded licenses for your customers. You can generate new license keys with custom durations and notes from the 'Rebrand' section. This is perfect for resellers and businesses.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Credit/Debit cards, PayPal, and various cryptocurrencies. Payment options are displayed at checkout based on your region.",
  },
]

const resources = [
  {
    title: "Documentation",
    description: "Comprehensive guides and API documentation",
    icon: Book,
    href: "#",
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step video walkthroughs",
    icon: Video,
    href: "#",
  },
  {
    title: "API Reference",
    description: "Full API documentation for developers",
    icon: FileText,
    href: "#",
  },
  {
    title: "Status Page",
    description: "Check service status and uptime",
    icon: Zap,
    href: "#",
  },
]

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-30 flex h-auto min-h-16 items-center border-b border-border bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Help Center</h1>
            <p className="text-sm text-muted-foreground">
              Find answers and get support
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Contact Support */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border bg-gradient-to-br from-primary/20 to-primary/5 hover:from-primary/25 hover:to-primary/10 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Discord Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get instant help from our community and support team
                  </p>
                  <Link href="https://discord.gg/keyauth" target="_blank">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Join Discord
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-secondary">
                  <Mail className="h-6 w-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Send us an email for non-urgent inquiries
                  </p>
                  <Link href="mailto:support@keyauth.cc">
                    <Button variant="outline" className="border-border bg-secondary hover:bg-muted">
                      Send Email
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
                <CardDescription>Quick answers to common questions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border">
                  <AccordionTrigger className="text-left hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Book className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Resources</CardTitle>
                <CardDescription>Helpful guides and documentation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {resources.map((resource) => (
                <Link key={resource.title} href={resource.href}>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <resource.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{resource.title}</h4>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
