"use client"

import { Label } from "@/components/ui/label"
import { useState } from "react"

interface DownloadLimitSelectProps {
  onLimitChange: (limit: number) => void
  disabled?: boolean
}

export function DownloadLimitSelect({ onLimitChange, disabled }: DownloadLimitSelectProps) {
  const [selected, setSelected] = useState(1)
  const options = [1, 2, 3, 5, 10]

  const handleSelect = (value: number) => {
    setSelected(value)
    onLimitChange(value)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-lg font-semibold text-[var(--text)]">
          Delete after how many downloads?
        </Label>
        <p className="text-sm text-[var(--muted)]">
          1 = one-time only (most secure)
        </p>
      </div>
      
      <div className="flex gap-3 flex-wrap">
        {options.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleSelect(value)}
            disabled={disabled}
            className={`
              px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200
              ${selected === value
                ? "gradient-accent text-white shadow-lg scale-105"
                : "bg-secondary/80 text-[var(--text)] hover:bg-secondary border-2 border-[var(--border)] hover:border-accent/50"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}
