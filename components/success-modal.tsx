"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, QrCode } from "lucide-react"
import { toast } from "sonner"
import QRCode from "react-qr-code"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  code: string
  type: "file" | "text"
}

export function SuccessModal({ isOpen, onClose, code, type }: SuccessModalProps) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-xl font-bold text-green-600 dark:text-green-400">
            {type === "file" ? "File" : "Note"} uploaded successfully! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Access Code Section */}
          <div className="space-y-3">
            <Label htmlFor="code" className="text-base font-semibold">Access Code</Label>
            <div className="flex space-x-2">
              <Input 
                id="code" 
                value={code} 
                readOnly 
                className="font-mono text-lg text-center tracking-wider bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
              />
              <Button 
                size="sm" 
                onClick={() => copyToClipboard(code)} 
                variant="outline"
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 text-center font-medium">Share this code with anyone</p>
          </div>

          {/* Access Page Section */}
          <div className="space-y-3">
            <Label htmlFor="access-url" className="text-base font-semibold">Access Page</Label>
            <div className="flex space-x-2">
              <Input 
                id="access-url" 
                value={`${window.location.origin}/access`} 
                readOnly 
                className="text-sm bg-gray-50 dark:bg-slate-800"
              />
              <Button 
                size="sm" 
                onClick={() => copyToClipboard(`${window.location.origin}/access`)} 
                variant="outline"
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">Go here and enter the access code</p>
          </div>

          {/* QR Code Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Share via QR Code</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowQR(!showQR)}
                className="flex items-center space-x-2"
              >
                <QrCode className="h-4 w-4" />
                <span>{showQR ? "Hide" : "Show"} QR</span>
              </Button>
            </div>
            
            {showQR && (
              <div className="flex justify-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                <div className="text-center">
                  <div className="bg-white p-3 rounded-lg inline-block">
                    <QRCode value={`${window.location.origin}/access`} size={120} />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                    Scan to visit access page, then enter: <br />
                    <span className="font-mono font-bold text-green-600 dark:text-green-400">{code}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center pt-2">
            <Button 
              onClick={onClose}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </Button>
          </div>

          {/* Warning Section */}
          <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="font-bold text-orange-800 dark:text-orange-300 text-center mb-3">⚠️ ONE-TIME ACCESS ONLY!</p>
            <p className="text-orange-700 dark:text-orange-300 text-center mb-3 text-sm">
              This {type} will be <strong>permanently deleted</strong> after:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-orange-700 dark:text-orange-300">Someone downloads it once</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-orange-700 dark:text-orange-300">It expires</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-orange-700 dark:text-orange-300">You refresh this page</span>
              </div>
            </div>
            <p className="text-orange-800 dark:text-orange-300 font-bold text-center mt-3 text-sm">
              💡 Share the access code immediately!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
