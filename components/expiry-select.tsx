"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ExpirySelectProps {
  onExpiryChange: (expiry: string) => void
  disabled?: boolean
}

export function ExpirySelect({ onExpiryChange, disabled }: ExpirySelectProps) {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold text-[var(--text)]">
        Auto-delete after
      </Label>
      <Select onValueChange={onExpiryChange} defaultValue="1hour" disabled={disabled}>
        <SelectTrigger className="h-12 border-2 border-[var(--border)] rounded-xl bg-[var(--surface)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 text-[var(--text)]">
          <SelectValue placeholder="Select expiry time" />
        </SelectTrigger>
        <SelectContent className="border-2 border-[var(--border)] rounded-xl bg-[var(--surface)] backdrop-blur-lg shadow-xl">
          <SelectItem value="5min" className="rounded-lg hover:bg-[var(--accent)]/10 focus:bg-[var(--accent)]/10">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>5 minutes</span>
            </div>
          </SelectItem>
          <SelectItem value="1hour" className="rounded-lg hover:bg-[var(--accent)]/10 focus:bg-[var(--accent)]/10">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>1 hour</span>
            </div>
          </SelectItem>
          <SelectItem value="1day" className="rounded-lg hover:bg-[var(--accent)]/10 focus:bg-[var(--accent)]/10">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>1 day</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
