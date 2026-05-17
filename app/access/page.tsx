"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Lock, Shield, Zap } from "lucide-react"

export default function AccessPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
    setCode(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      toast.error("Please enter an access code")
      return
    }

    if (code.length !== 6) {
      toast.error("Code must be 6 characters")
      return
    }

    const cleanCode = code.trim().toUpperCase()
    setLoading(true)

    try {
      const response = await fetch(`/api/file/${cleanCode}`)
      const result = await response.json()

      if (result.success) {
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
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container px-4 py-16">
        <div className="mx-auto flex w-full max-w-lg flex-col justify-center space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 glow-accent">
              <Lock className="h-8 w-8 text-accent" />
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight">
              Access Your{" "}
              <span className="gradient-text">Drop</span>
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Enter the 6-character code to unlock your content
            </p>
          </div>

          {/* Access Card */}
          <Card className="gradient-card glow-accent border-accent/20 animate-fade-in-up">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="code" className="text-base font-semibold">
                    Access Code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="ABC123"
                    value={code}
                    onChange={handleInputChange}
                    className="text-center text-3xl font-mono tracking-[0.5em] uppercase h-16 bg-secondary/50 border-accent/20 focus:border-accent transition-all"
                    maxLength={6}
                    disabled={loading}
                    autoFocus
                    autoComplete="off"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    {code.length}/6 characters
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || code.length !== 6} 
                  className="w-full h-14 gradient-accent text-white font-bold text-lg hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Access Content
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Card className="border-accent/20 bg-card/80 backdrop-blur-xl p-4 hover:border-accent/40 transition-all">
              <div className="flex flex-col items-center space-y-2 text-center">
                <Zap className="h-6 w-6 text-accent" />
                <p className="text-xs text-muted-foreground">
                  Self-destructs after view
                </p>
              </div>
            </Card>
            
            <Card className="border-accent/20 bg-card/80 backdrop-blur-xl p-4 hover:border-accent/40 transition-all">
              <div className="flex flex-col items-center space-y-2 text-center">
                <Shield className="h-6 w-6 text-accent" />
                <p className="text-xs text-muted-foreground">
                  No tracking or logs
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
