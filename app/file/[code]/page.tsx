"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CountdownTimer } from "@/components/countdown-timer"
import { Download, Copy, FileText, AlertTriangle, Zap } from "lucide-react"
import { toast } from "sonner"
import { getFileIcon } from "@/lib/utils"
import type { DropData } from "@/lib/redis"

export default function FilePage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [dropData, setDropData] = useState<DropData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
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
    setError("This file has expired")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
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
                    <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                  </>
                )}
                <Button onClick={() => router.push("/")}>Create New Drop</Button>
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
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold">DropKey</h1>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
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
              </CardTitle>
              <CardDescription>This {dropData.type} will be deleted after access</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {dropData.type === "file" ? (
                <div className="space-y-4">
                  {/* File Preview Card */}
                  <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-dashed border-primary/20">
                    <div className="text-6xl mb-4">{getFileIcon(dropData.filename || "")}</div>
                    <h3 className="font-semibold text-lg mb-2">{dropData.filename}</h3>
                    <p className="text-sm text-muted-foreground mb-4">Ready for download</p>

                    {/* Large Download Button */}
                    <Button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="w-full h-12 text-lg font-semibold"
                      size="lg"
                    >
                      <Download className="h-5 w-5 mr-3" />
                      {downloading ? "Downloading..." : "Download File"}
                    </Button>
                  </div>

                  {/* Warning Message */}
                  <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 dark:text-orange-200">
                      <strong>Important:</strong> This file will be permanently deleted after you download it. Make sure
                      you're ready!
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Text Display */}
                  <div className="p-6 bg-muted/50 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Secret Note
                      </h3>
                      <Button onClick={copyText} variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-background p-4 rounded border">
                      <pre className="whitespace-pre-wrap text-sm font-mono">{dropData.content}</pre>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button onClick={copyText} variant="outline" className="flex-1 bg-transparent">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Text
                    </Button>
                    <Button onClick={handleDownload} disabled={downloading} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      {downloading ? "Downloading..." : "Download as File"}
                    </Button>
                  </div>

                  {/* Warning Message */}
                  <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 dark:text-orange-200">
                      <strong>Important:</strong> This note will be permanently deleted after you copy it or download
                      it.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-center">
                    <span>Expires in:</span>
                    <CountdownTimer expiresAt={dropData.expiresAt} onExpired={handleExpired} />
                  </div>
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <Button variant="ghost" onClick={() => router.push("/")} className="text-sm">
                  Create your own drop
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
