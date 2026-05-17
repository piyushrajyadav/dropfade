"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

export type ToastType = "success" | "error" | "warning"

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-orange-500",
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white transition-all duration-300 ${
        bgColors[type]
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 300)
        }}
        className="hover:opacity-75 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
