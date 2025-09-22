"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CountdownTimer } from "@/components/countdown-timer"
import { Download, Copy, FileText, AlertTriangle, Zap, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { getFileIcon } from "@/lib/utils"
import type { DropData } from "@/lib/redis"

export default function DownloadPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [dropData, setDropData] = useState<DropData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  useEffect(() => {
    if (code) {
      fetchDropData()
    }
  }, [code])

  const fetchDropData = async () => {
    try {
      const response = await fetch(`/api/file/${code}`)
      const result = await response.json()

      if (result.success) {
        setDropData(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("Failed to load file")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!dropData || downloading) return

    setDownloading(true)

    try {
      console.log("Starting download for code:", code)

      const response = await fetch(`/api/download/${code}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Download failed")
      }

      if (dropData.type === "text") {
        // Handle text download
        const result = await response.json()

        if (result.success) {
          // Create and download text file
          const blob = new Blob([result.content], { type: "text/plain" })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = result.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)

          toast.success("Text file downloaded and deleted!")
        }
      } else {
        // Handle file download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = dropData.filename || "download"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast.success("File downloaded and deleted!")
      }

      setDownloaded(true)

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/?downloaded=true")
      }, 2000)
    } catch (error) {
      console.error("Download error:", error)
      toast.error(error instanceof Error ? error.message : "Download failed")
    } finally {
      setDownloading(false)
    }
  }

  const copyText = async () => {
    if (dropData?.type === "text") {
      try {
        await navigator.clipboard.writeText(dropData.content)
        toast.success("Text copied to clipboard!")

        // Mark as downloaded after copying
        await fetch(`/api/file/${code}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "download" }),
        })

        setDownloaded(true)
        setTimeout(() => {
          router.push("/?downloaded=true")
        }, 2000)
      } catch (err) {
        toast.error("Failed to copy text")
      }
    }
  }

  const handleExpired = () => {
    setError("This content has expired")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your content...</p>
        </div>
      </div>
    )
  }

  if (error || downloaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-primary mr-2" />
                <h1 className="text-2xl font-bold">DropFade</h1>
              </div>
            </div>

            <Card>
              <CardContent className="p-6 text-center">
                {downloaded ? (
                  <>
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-xl font-semibold mb-2">Download Complete!</h2>
                    <p className="text-muted-foreground mb-6">
                      The content has been downloaded and permanently deleted.
                    </p>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Content Not Available</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                  </>
                )}
                <div className="space-y-3">
                  <Button onClick={() => router.push("/")} className="w-full">
                    Create New Drop
                  </Button>
                  {!downloaded && (
                    <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                      Try Again
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!dropData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold">DropFade</h1>
            </div>
            <p className="text-muted-foreground">Secure one-time download</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {dropData.type === "file" ? (
                    <>
                      <span className="text-2xl">{getFileIcon(dropData.filename || "")}</span>
                      <span>File Ready</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5" />
                      <span>Secret Note</span>
                    </>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push(`/file/${code}`)} className="text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Full View
                </Button>
              </CardTitle>
              <CardDescription>
                Access Code: <span className="font-mono font-semibold">{code}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {dropData.type === "file" ? (
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border">
                    <div className="text-4xl mb-3">{getFileIcon(dropData.filename || "")}</div>
                    <h3 className="font-semibold text-lg mb-1">{dropData.filename}</h3>
                    <p className="text-sm text-muted-foreground mb-4">Ready for download</p>

                    {/* Preview Toggle for Images */}
                    {dropData.filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                      <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="mb-4">
                        {showPreview ? "Hide" : "Show"} Preview
                      </Button>
                    )}

                    {/* Image Preview */}
                    {showPreview && dropData.filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                      <div className="mb-4">
                        <img
                          src={dropData.content || "/placeholder.svg"}
                          alt={dropData.filename}
                          className="max-w-full max-h-48 mx-auto rounded border"
                        />
                      </div>
                    )}
                  </div>

                  {/* Download Button */}
                  <Button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full h-12 text-lg font-semibold"
                    size="lg"
                  >
                    <Download className="h-5 w-5 mr-3" />
                    {downloading ? "Downloading..." : "Download Now"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Text Preview */}
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">Secret Message</span>
                      <span className="text-xs text-muted-foreground">{dropData.content.length} characters</span>
                    </div>
                    <div className="bg-background p-3 rounded border max-h-32 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">{dropData.content}</pre>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={copyText} variant="outline" className="h-12 bg-transparent">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Text
                    </Button>
                    <Button onClick={handleDownload} disabled={downloading} className="h-12">
                      <Download className="h-4 w-4 mr-2" />
                      {downloading ? "Downloading..." : "Download as File"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Expiry Warning */}
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  <div className="flex justify-between items-center">
                    <span>
                      <strong>One-time access only!</strong> This {dropData.type} will be permanently deleted after
                      download.
                    </span>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Countdown Timer */}
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Expires in:</span>
                  <CountdownTimer expiresAt={dropData.expiresAt} onExpired={handleExpired} />
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-4 border-t">
                <Button variant="ghost" onClick={() => router.push("/")} className="text-sm">
                  Create your own secure drop →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
