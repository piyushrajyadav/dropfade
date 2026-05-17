"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface TextInputProps {
  onTextChange: (text: string) => void
  disabled?: boolean
  maxLength?: number
}

export function TextInput({ onTextChange, disabled, maxLength = 1000 }: TextInputProps) {
  const [text, setText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Preserve text when component remounts
  useEffect(() => {
    if (textareaRef.current && text) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`
    }
  }, [text])

  const getCounterColor = () => {
    const length = text.length
    if (length > 950) return "text-red-500"
    if (length > 800) return "text-[var(--accent)]"
    return "text-[var(--muted)]"
  }

  const getBorderColor = () => {
    const length = text.length
    if (length > 950) return "border-red-500 focus:border-red-500"
    if (length > 800) return "border-[var(--accent)] focus:border-[var(--accent)]"
    return "border-[var(--border)] focus:border-[var(--accent)]"
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, maxLength)
    
    // Auto-resize
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`
    
    setText(value)
    onTextChange(value)

    if (e.target.value.length > maxLength) {
      toast.error("Limit reached")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key support
    if (e.key === "Tab") {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newText = text.substring(0, start) + "  " + text.substring(end)
      
      if (newText.length <= maxLength) {
        setText(newText)
        onTextChange(newText)
        
        // Set cursor position after the inserted spaces
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
          }
        }, 0)
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text")
    const start = e.currentTarget.selectionStart
    const end = e.currentTarget.selectionEnd
    const newText = text.substring(0, start) + pastedText + text.substring(end)
    
    if (newText.length > maxLength) {
      e.preventDefault()
      const truncated = newText.slice(0, maxLength)
      setText(truncated)
      onTextChange(truncated)
      toast.warning("Pasted text was trimmed to 1000 character limit")
    }
  }

  return (
    <div className="space-y-4">
      <Label htmlFor="text-input" className="text-lg font-semibold text-[var(--text)]">
        Your message or note
      </Label>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          id="text-input"
          placeholder="Type your message, note, or secret here..."
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
          rows={4}
          className={`resize-none rounded-xl bg-[var(--surface)] transition-all duration-200 text-[var(--text)] placeholder:text-[var(--muted)] ${getBorderColor()}`}
        />
        <div className={`absolute bottom-3 right-3 px-3 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs font-medium ${getCounterColor()}`}>
          {text.length > 950 && text.length < maxLength && "Limit reached: "}
          {text.length}/{maxLength}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
        <span className="text-sm text-[var(--muted)] font-medium">
          This will be deleted after access
        </span>
      </div>
    </div>
  )
}
