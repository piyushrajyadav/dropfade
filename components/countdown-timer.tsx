"use client"

import { useState, useEffect } from "react"
import { formatTimeRemaining } from "@/lib/utils"

interface CountdownTimerProps {
  expiresAt: number
  onExpired?: () => void
}

export function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000))
      setTimeLeft(remaining)

      if (remaining === 0 && onExpired) {
        onExpired()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpired])

  if (timeLeft <= 0) {
    return <span className="text-destructive">Expired</span>
  }

  return <span className="text-orange-600 font-mono">{formatTimeRemaining(timeLeft)}</span>
}
