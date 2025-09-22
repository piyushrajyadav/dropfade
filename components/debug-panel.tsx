"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function DebugPanel() {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const testRedisConnection = async () => {
    setTesting(true)
    try {
      const response = await fetch("/api/test-redis")
      const result = await response.json()
      setTestResult(result)

      if (result.success) {
        toast.success("Redis connection working!")
      } else {
        toast.error("Redis connection failed")
      }
    } catch (error) {
      toast.error("Test failed")
      setTestResult({ error: "Network error" })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testRedisConnection} disabled={testing} variant="outline" size="sm">
          {testing ? "Testing..." : "Test Redis Connection"}
        </Button>

        {testResult && (
          <div className="text-xs space-y-2">
            <Badge variant={testResult.success ? "default" : "destructive"}>
              {testResult.success ? "Success" : "Failed"}
            </Badge>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
