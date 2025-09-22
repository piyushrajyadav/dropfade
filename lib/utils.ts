import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { nanoid } from "nanoid"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateCode(): string {
  const codeLength = Number.parseInt(process.env.CODE_LENGTH || "6")
  return nanoid(codeLength).toUpperCase()
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function getFileIcon(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "pdf":
      return "📄"
    case "doc":
    case "docx":
      return "📝"
    case "xls":
    case "xlsx":
      return "📊"
    case "ppt":
    case "pptx":
      return "📽️"
    case "zip":
    case "rar":
    case "7z":
      return "🗜️"
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return "🖼️"
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
      return "🎥"
    case "mp3":
    case "wav":
    case "flac":
      return "🎵"
    case "txt":
      return "📄"
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "html":
    case "css":
    case "py":
    case "java":
    case "cpp":
      return "💻"
    default:
      return "📎"
  }
}

export function getExpirySeconds(expiry: string): number {
  switch (expiry) {
    case "5min":
      return 5 * 60 // 5 minutes
    case "1hour":
      return 60 * 60 // 1 hour
    case "1day":
      return 24 * 60 * 60 // 1 day
    default:
      return 60 * 60 // Default to 1 hour
  }
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "Expired"

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}
