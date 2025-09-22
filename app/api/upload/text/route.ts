import { type NextRequest, NextResponse } from "next/server"
import { saveDropData } from "@/lib/redis"
import { generateCode, getExpirySeconds } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    console.log("Text upload started")

    // Check environment variables
    const requiredEnvVars = ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"]

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])
    if (missingVars.length > 0) {
      console.error("Missing environment variables:", missingVars)
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: `Missing: ${missingVars.join(", ")}`,
        },
        { status: 500 },
      )
    }

    const { text, expiry } = await request.json()

    console.log("Text details:", {
      length: text?.length,
      expiry,
    })

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    if (text.length > 1000) {
      return NextResponse.json({ error: "Text too long (max 1000 characters)" }, { status: 400 })
    }

    // Generate unique code
    const code = generateCode()
    console.log("Generated code:", code)

    // Calculate expiry
    const expirySeconds = getExpirySeconds(expiry)
    const expiresAt = Date.now() + expirySeconds * 1000

    console.log("Expiry details:", {
      expiry,
      expirySeconds,
      expiresAt: new Date(expiresAt).toISOString(),
    })

    // Save to Redis
    const dropData = {
      type: "text" as const,
      content: text,
      expiresAt,
      hasDownloaded: false,
      createdAt: Date.now(),
    }

    console.log("Saving to Redis with key:", `drop:${code}`)
    const saved = await saveDropData(code, dropData, expirySeconds)
    console.log("Redis save result:", saved)

    if (!saved) {
      console.error("Failed to save to Redis")
      return NextResponse.json({ error: "Failed to save text data" }, { status: 500 })
    }

    console.log("Text upload completed successfully")
    return NextResponse.json({
      success: true,
      code,
      type: "text",
    })
  } catch (error) {
    console.error("Text upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
