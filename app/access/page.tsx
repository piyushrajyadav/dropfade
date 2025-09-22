"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export default function AccessPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setCode(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      toast.error("Please enter an access code")
      return
    }

    const cleanCode = code.trim().toUpperCase()
    setLoading(true)

    try {
      // Test if the code exists
      const response = await fetch(`/api/file/${cleanCode}`)
      const result = await response.json()

      if (result.success) {
        // Redirect to download page
        router.push(`/download/${cleanCode}`)
      } else {
        toast.error(result.error || "Invalid access code")
      }
    } catch (error) {
      toast.error("Failed to verify code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDA4IiBmaWxsLW9wYWNpdHk9IjAuMDIiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEuNSIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      
      <div className="relative container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6 group">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-105">
                <Image src="/dropfade-logo.png" alt="DropFade Logo" width={32} height={32} className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-700 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent leading-tight">
              DropFade
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mt-4 font-medium">Enter your access code</p>
          </div>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-center bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Access Secure Content
              </CardTitle>
              <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                Enter the 6-character code you received to download your file or note
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="code" className="text-lg font-semibold text-gray-900 dark:text-white">
                    Access Code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="X7BG23"
                    value={code}
                    onChange={handleInputChange}
                    className="text-center text-2xl font-mono tracking-[0.5em] h-16 border-2 border-gray-200 dark:border-slate-700 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    maxLength={6}
                    disabled={loading}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !code.trim()} 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 hover:scale-[1.02] disabled:hover:scale-100" 
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Access Content</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">Don't have a code?</p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/")} 
                  className="w-full h-12 border-2 border-gray-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 rounded-xl font-semibold"
                >
                  Create New Drop
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-lg">
              <p className="font-bold text-blue-800 dark:text-blue-300 mb-4 text-lg">📋 How it works</p>
              <div className="text-blue-700 dark:text-blue-300 space-y-2 leading-relaxed">
                <p>• Enter the 6-character code you received</p>
                <p>• Content is deleted after one download</p>
                <p>• Codes expire based on sender's settings</p>
                <p>• Use QR code to share access with others</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
