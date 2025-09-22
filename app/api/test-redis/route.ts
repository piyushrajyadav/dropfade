import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET() {
  try {
    console.log("Testing Redis connection...")

    // Test basic connection
    const pingResult = await redis.testConnection()
    console.log("Ping result:", pingResult)

    if (!pingResult) {
      return NextResponse.json(
        {
          error: "Redis connection failed",
          details: "PING command failed",
        },
        { status: 500 },
      )
    }

    // Test set/get operations
    const testKey = "test:connection"
    const testValue = "test-value-" + Date.now()

    console.log("Testing SET operation...")
    const setResult = await redis.set(testKey, testValue, 60) // 60 seconds TTL
    console.log("SET result:", setResult)

    if (!setResult) {
      return NextResponse.json(
        {
          error: "Redis SET operation failed",
        },
        { status: 500 },
      )
    }

    console.log("Testing GET operation...")
    const getValue = await redis.get(testKey)
    console.log("GET result:", getValue)

    if (getValue !== testValue) {
      return NextResponse.json(
        {
          error: "Redis GET operation failed",
          expected: testValue,
          actual: getValue,
        },
        { status: 500 },
      )
    }

    // Clean up
    await redis.del(testKey)

    return NextResponse.json({
      success: true,
      message: "Redis connection and operations working correctly",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Redis test error:", error)
    return NextResponse.json(
      {
        error: "Redis test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
