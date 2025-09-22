"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X } from "lucide-react"
import { formatFileSize } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  maxSize?: number
  disabled?: boolean
}

export function FileUpload({ onFileSelect, maxSize = 5242880, disabled }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        setSelectedFile(file)
        onFileSelect(file)
      }
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxSize,
    multiple: false,
    disabled,
  })

  const removeFile = () => {
    setSelectedFile(null)
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-700 shadow-lg">
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg m-6 p-12 text-center cursor-pointer transition-all duration-300
              ${isDragActive 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.02]" 
                : "border-gray-300 dark:border-slate-600"
              }
              ${disabled 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:shadow-lg hover:shadow-blue-500/10"
              }
            `}
          >
            <input {...getInputProps()} />
            <div className={`transition-transform duration-300 ${isDragActive ? 'scale-110' : ''}`}>
              <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/25">
                <Upload className="h-8 w-8 text-white" />
              </div>
              {isDragActive ? (
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">Drop the file here...</p>
              ) : (
                <div>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Drag & drop a file here, or click to select
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Maximum file size: {formatFileSize(maxSize)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {fileRejections.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            {fileRejections[0].errors[0].message}
          </p>
        </div>
      )}

      {selectedFile && (
        <Card className="overflow-hidden border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/25">
                  <File className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedFile.name}</p>
                  <p className="text-green-600 dark:text-green-400 font-medium">{formatFileSize(selectedFile.size)}</p>
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
