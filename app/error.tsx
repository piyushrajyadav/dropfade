"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <Card className="max-w-md w-full border border-[var(--border)] bg-[var(--surface)] rounded-2xl shadow-sm">
        <CardContent className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-red-500/10 mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-[var(--text)] mb-3">
            Something went wrong
          </h1>
          
          <p className="text-[var(--muted)] mb-8">
            An unexpected error occurred. Your data is safe.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={reset}
              className="w-full h-12 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-xl transition-all duration-200"
            >
              Try Again
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="w-full h-12 border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-xl font-semibold"
              >
                <span>Go Home</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
