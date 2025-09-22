"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface TextInputProps {
  onTextChange: (text: string) => void
  disabled?: boolean
  maxLength?: number
}

export function TextInput({ onTextChange, disabled, maxLength = 1000 }: TextInputProps) {
  const [text, setText] = useState("")

  const handleChange = (value: string) => {
    if (value.length <= maxLength) {
      setText(value)
      onTextChange(value)
    }
  }

  return (
    <div className="space-y-4">
      <Label htmlFor="text-input" className="text-lg font-semibold text-gray-900 dark:text-white">
        Your message or note
      </Label>
      <div className="relative">
        <Textarea
          id="text-input"
          placeholder="Type your message, note, or secret here..."
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          className="min-h-[150px] resize-none border-2 border-gray-200 dark:border-slate-700 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />
        <div className="absolute bottom-3 right-3 px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300">
          {text.length}/{maxLength}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            This will be deleted after one access
          </span>
        </div>
      </div>
    </div>
  )
}
