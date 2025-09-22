"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/file-upload"
import { TextInput } from "@/components/text-input"
import { ExpirySelect } from "@/components/expiry-select"
import { SuccessModal } from "@/components/success-modal"
import { Upload, MessageSquare, Zap, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { DebugPanel } from "@/components/debug-panel"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("file")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textContent, setTextContent] = useState("")
  const [expiry, setExpiry] = useState("1hour")
  const [isUploading, setIsUploading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    code: string
    type: "file" | "text"
  } | null>(null)

  const router = useRouter()

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

      const response = await fetch("/api/upload/file", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setUploadResult({ code: result.code, type: "file" })
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
        }),
      })

      const result = await response.json()

      if (result.success) {
        setUploadResult({ code: result.code, type: "text" })
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDA4IiBmaWxsLW9wYWNpdHk9IjAuMDIiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEuNSIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      
      <div className="relative container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6 group">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-105">
                <Image src="/dropfade-logo.png" alt="DropFade Logo" width={32} height={32} className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-700 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent leading-tight">
              DropFade
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mt-4 font-medium">
              Anonymous file & text sharing with one-time access
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No signup required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Auto-delete after access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Secure & private</span>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="max-w-2xl mx-auto">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-center bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  Share Files or Notes Securely
                </CardTitle>
                <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                  Upload a file or write a note. Get a unique code that works only once.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
                    <TabsTrigger 
                      value="file" 
                      className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-600 transition-all duration-200"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload File</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="text" 
                      className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-600 transition-all duration-200"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Write Note</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="file" className="space-y-6 mt-8">
                    <FileUpload onFileSelect={setSelectedFile} disabled={isUploading} />
                  </TabsContent>

                  <TabsContent value="text" className="space-y-6 mt-8">
                    <TextInput onTextChange={setTextContent} disabled={isUploading} />
                  </TabsContent>

                  <div className="space-y-6 mt-8">
                    <ExpirySelect onExpiryChange={setExpiry} disabled={isUploading} />

                    <Button
                      onClick={activeTab === "file" ? handleFileUpload : handleTextUpload}
                      disabled={!canSubmit || isUploading}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 hover:scale-[1.02] disabled:hover:scale-100"
                      size="lg"
                    >
                      {isUploading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Generating Code...</span>
                        </div>
                      ) : (
                        "Generate Access Code"
                      )}
                    </Button>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="group p-8 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl mb-4 transition-transform group-hover:scale-110">🔐</div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">One-Time Access</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Files auto-delete after being accessed once for maximum security</p>
            </div>
            <div className="group p-8 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl mb-4 transition-transform group-hover:scale-110">⏰</div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Time Expiry</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Choose when your files should expire for added control</p>
            </div>
            <div className="group p-8 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl mb-4 transition-transform group-hover:scale-110">🚫</div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">No Registration</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Completely anonymous, no account needed for privacy</p>
            </div>
          </div>

          {/* Access Section */}
          <div className="max-w-2xl mx-auto mt-16">
            <Card className="backdrop-blur-sm bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/80 border-0 shadow-xl shadow-gray-500/10 dark:shadow-gray-500/20">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="inline-flex p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                    <ArrowRight className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Have an Access Code?</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Enter your code to download files or view notes securely</p>
                  <Button 
                    onClick={() => router.push("/access")} 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto h-12 border-2 border-gray-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 rounded-xl font-semibold"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Enter Access Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Debug Panel - Remove in production */}
          {process.env.NODE_ENV === "development" && <DebugPanel />}
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
