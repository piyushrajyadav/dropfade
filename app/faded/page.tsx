"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function FadedPage() {
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason") || "default"

  const messages = {
    accessed: "This content was viewed and permanently deleted.",
    expired: "This drop expired before anyone accessed it.",
    notfound: "This code doesn't exist or was never created.",
    default: "This content no longer exists.",
  }

  const message = messages[reason as keyof typeof messages] || messages.default

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <Card className="max-w-md w-full border border-[var(--border)] bg-[var(--surface)] rounded-2xl shadow-sm">
        <CardContent className="p-12 text-center">
          {/* Logo/Icon */}
          <div className="relative w-20 h-20 mx-auto mb-6 opacity-30">
            <Image 
              src="/logos/drop.png" 
              alt="DropFade" 
              fill
              className="object-contain grayscale"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-[var(--text)] mb-3">
            Content Deleted
          </h1>

          {/* Subtitle */}
          <p className="text-[var(--muted)] mb-8">
            {message}
          </p>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--surface)] px-4 text-sm text-[var(--muted)]">
                What's next?
              </span>
            </div>
          </div>

          {/* CTA */}
          <Link href="/">
            <Button className="w-full h-12 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-xl transition-all duration-200">
              <span>Create New Drop</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>

          {/* Footnote */}
          <p className="text-xs text-[var(--muted)] mt-8">
            DropFade automatically deletes content after access.<br />
            No copies. No logs. No traces.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
