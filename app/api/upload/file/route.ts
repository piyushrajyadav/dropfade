import { type NextRequest, NextResponse } from "next/server"
import { uploadFile } from "@/lib/cloudinary"
import { saveDropData } from "@/lib/redis"
import { generateCode, getExpirySeconds } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    console.log("File upload started")

    // Check environment variables
    const requiredEnvVars = [
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
      "UPSTASH_REDIS_REST_URL",
      "UPSTASH_REDIS_REST_TOKEN",
    ]

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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const expiry = formData.get("expiry") as string

    console.log("File details:", {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      expiry,
    })

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const maxSize = Number.parseInt(process.env.MAX_FILE_SIZE || "5242880")
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    console.log("Starting Cloudinary upload...")
    // Upload to Cloudinary
    const uploadResult = await uploadFile(file)
    console.log("Cloudinary upload success:", uploadResult.public_id)

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
      type: "file" as const,
      content: uploadResult.secure_url,
      filename: file.name, // Use the original file name from the upload
      expiresAt,
      hasDownloaded: false,
      createdAt: Date.now(),
    }

    console.log("Saving to Redis with key:", `drop:${code}`)
    const saved = await saveDropData(code, dropData, expirySeconds)
    console.log("Redis save result:", saved)

    if (!saved) {
      console.error("Failed to save to Redis")
      return NextResponse.json({ error: "Failed to save file data" }, { status: 500 })
    }

    console.log("File upload completed successfully")
    return NextResponse.json({
      success: true,
      code,
      type: "file",
      filename: uploadResult.original_filename,
    })
  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
