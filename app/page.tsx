"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/file-upload"
import { TextInput } from "@/components/text-input"
import { ExpirySelect } from "@/components/expiry-select"
import { DownloadLimitSelect } from "@/components/download-limit-select"
import { SuccessModal } from "@/components/success-modal"
import { Upload, FileText, Shield, Zap, Lock } from "lucide-react"
import { toast } from "sonner"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("file")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textContent, setTextContent] = useState("")
  const [expiry, setExpiry] = useState("1hour")
  const [maxDownloads, setMaxDownloads] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    code: string
    type: "file" | "text"
    maxDownloads: number
  } | null>(null)

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("expiry", expiry)
      formData.append("maxDownloads", maxDownloads.toString())

      const response = await fetch("/api/upload/file", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setUploadResult({ code: result.code, type: "file", maxDownloads })
        setShowSuccess(true)
        setSelectedFile(null)
        toast.success("File uploaded successfully!")
      } else {
        toast.error(result.error || "Upload failed")
      }
    } catch (error) {
      toast.error("Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleTextUpload = async () => {
    if (!textContent.trim()) {
      toast.error("Please enter some text")
      return
    }

    setIsUploading(true)

    try {
      const response = await fetch("/api/upload/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textContent,
          expiry,
          maxDownloads,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setUploadResult({ code: result.code, type: "text", maxDownloads })
        setShowSuccess(true)
        setTextContent("")
        toast.success("Note uploaded successfully!")
      } else {
        toast.error(result.error || "Upload failed")
      }
    } catch (error) {
      toast.error("Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const canSubmit = activeTab === "file" ? selectedFile : textContent.trim()

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="container mx-auto flex max-w-6xl flex-col items-center gap-8 py-12 md:py-16 lg:py-24 px-4">
        {/* Hero Section */}
        <div className="mx-auto flex max-w-4xl flex-col items-center space-y-6 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2 text-sm font-medium text-accent backdrop-blur-sm glow-border">
            <Shield className="h-4 w-4" />
            <span>100% Anonymous & Secure</span>
          </div>
          
          <h1 className="font-bold text-5xl leading-tight tracking-tight md:text-6xl lg:text-7xl xl:text-8xl">
            Share files{" "}
            <span className="gradient-text animate-gradient">
              anonymously
            </span>
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            No sign-ups. No tracking. Files self-destruct after one view.
            <br />
            <span className="text-accent font-medium">Complete privacy guaranteed.</span>
          </p>
        </div>

        {/* Upload Card */}
        <Card className="w-full max-w-3xl mt-4 gradient-card glow-accent border-accent/20 animate-fade-in-up">
          <div className="p-8 md:p-10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/80 p-1 h-auto backdrop-blur-sm">
                <TabsTrigger 
                  value="file" 
                  className="flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold text-foreground hover:bg-secondary/50 transition-all rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Upload className="h-5 w-5" />
                  <span>File Upload</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="text" 
                  className="flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold text-foreground hover:bg-secondary/50 transition-all rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <FileText className="h-5 w-5" />
                  <span>Text Note</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-8 space-y-6">
                {activeTab === "file" ? (
                  <div className="animate-fade-in-up space-y-6">
                    <FileUpload onFileSelect={setSelectedFile} disabled={isUploading} />
                  </div>
                ) : (
                  <div className="animate-fade-in-up space-y-6">
                    <TextInput onTextChange={setTextContent} disabled={isUploading} />
                  </div>
                )}

                <ExpirySelect onExpiryChange={setExpiry} disabled={isUploading} />
                
                <DownloadLimitSelect onLimitChange={setMaxDownloads} disabled={isUploading} />

                <Button
                  onClick={activeTab === "file" ? handleFileUpload : handleTextUpload}
                  disabled={!canSubmit || isUploading}
                  className="w-full h-14 gradient-accent text-white font-bold text-lg hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Generate Secure Code
                    </>
                  )}
                </Button>
              </div>
            </Tabs>
          </div>
        </Card>

        {/* Feature Cards */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3 mt-16 w-full animate-fade-in-up">
          <Card className="group relative overflow-hidden border-accent/20 bg-card/80 backdrop-blur-xl p-8 hover:border-accent/50 hover:bg-card/90 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 group-hover:from-accent/30 group-hover:to-accent/20 transition-all">
                <Lock className="h-7 w-7 text-accent" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl">100% Anonymous</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No accounts, no emails, no personal data. Share without revealing your identity.
                </p>
              </div>
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-accent/20 bg-card/80 backdrop-blur-xl p-8 hover:border-accent/50 hover:bg-card/90 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-500/10 group-hover:from-pink-500/30 group-hover:to-pink-500/20 transition-all">
                <Zap className="h-7 w-7 text-pink-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl">Self-Destruct</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Files vanish after one view or expiry time. No traces left behind.
                </p>
              </div>
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-accent/20 bg-card/80 backdrop-blur-xl p-8 hover:border-accent/50 hover:bg-card/90 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 group-hover:from-purple-500/30 group-hover:to-purple-500/20 transition-all">
                <Shield className="h-7 w-7 text-purple-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl">Zero Tracking</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No logs, no analytics, no surveillance. Your privacy is absolute.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {uploadResult && (
        <SuccessModal
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          code={uploadResult.code}
          type={uploadResult.type}
        />
      )}
    </div>
  )
}
