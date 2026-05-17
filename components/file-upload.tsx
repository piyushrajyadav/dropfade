"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X, FileText, Image as ImageIcon, Music, Video, Archive, CheckCircle, AlertCircle } from "lucide-react"
import { formatFileSize } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  maxSize?: number
  disabled?: boolean
}

export function FileUpload({ onFileSelect, maxSize = 5242880, disabled }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sizeError, setSizeError] = useState<string>("")

  const getFileIcon = (file: File) => {
    const type = file.type
    const name = file.name.toLowerCase()

    if (type.startsWith("image/")) return <ImageIcon className="h-6 w-6" />
    if (type.startsWith("video/")) return <Video className="h-6 w-6" />
    if (type.startsWith("audio/")) return <Music className="h-6 w-6" />
    if (type.includes("pdf") || type.includes("document") || type.includes("text")) return <FileText className="h-6 w-6" />
    if (name.endsWith(".zip") || name.endsWith(".rar") || name.endsWith(".7z")) return <Archive className="h-6 w-6" />
    return <File className="h-6 w-6" />
  }

  const validateFileSize = (file: File): boolean => {
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0)
      setSizeError(`❌ File too large (${fileSizeMB} MB). Maximum is ${maxSizeMB}MB.`)
      return false
    }
    setSizeError("")
    return true
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        if (validateFileSize(file)) {
          setSelectedFile(file)
          onFileSelect(file)
        } else {
          setSelectedFile(null)
          onFileSelect(null)
        }
      }
    },
    [onFileSelect, maxSize],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxSize * 2, // Allow larger files to show custom error
    multiple: false,
    disabled,
    noClick: !!sizeError, // Disable click if there's an error
  })

  const removeFile = () => {
    setSelectedFile(null)
    setSizeError("")
    onFileSelect(null)
  }

  return (
    <div className="space-y-6">
      <Card className={`overflow-hidden border-2 ${sizeError ? "border-red-500" : "border-[var(--border)]"} bg-[var(--surface)] shadow-lg transition-all duration-200`}>
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg m-6 p-12 text-center cursor-pointer transition-all duration-300
              ${isDragActive 
                ? "border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.02]" 
                : sizeError
                ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                : "border-[var(--border)]"
              }
              ${disabled 
                ? "opacity-50 cursor-not-allowed" 
                : !sizeError && "hover:border-[var(--accent)] hover:bg-[var(--accent)]/5"
              }
            `}
          >
            <input {...getInputProps()} />
            <div className={`transition-transform duration-300 ${isDragActive ? 'scale-110' : ''}`}>
              <div className="inline-flex p-4 bg-gradient-to-br from-[var(--accent)] to-orange-600 rounded-2xl mb-6 shadow-lg">
                <Upload className="h-8 w-8 text-white" />
              </div>
              {isDragActive ? (
                <p className="text-xl font-semibold text-[var(--accent)]">Drop the file here...</p>
              ) : (
                <div>
                  <p className="text-xl font-semibold text-[var(--text)] mb-3">
                    Drag & drop a file here, or click to select
                  </p>
                  <p className="text-[var(--muted)]">
                    Maximum file size: {formatFileSize(maxSize)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {sizeError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-500 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            {sizeError}
          </p>
        </div>
      )}

      {selectedFile && !sizeError && (
        <Card className="overflow-hidden border-2 border-green-500 bg-green-50 dark:bg-green-950/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg text-white">
                  {getFileIcon(selectedFile)}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text)] flex items-center gap-2">
                    {selectedFile.name}
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </p>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    ✓ {formatFileSize(selectedFile.size)} — looks good!
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={removeFile} 
                disabled={disabled}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
