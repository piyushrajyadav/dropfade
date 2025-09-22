import { type NextRequest, NextResponse } from "next/server"
import { getDropData, deleteDropData } from "@/lib/redis"
import { deleteFile, getPublicIdFromUrl } from "@/lib/cloudinary"

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const dropData = await getDropData(code)

    if (!dropData) {
      return NextResponse.json({ error: "File not found or expired" }, { status: 404 })
    }

    // Check if already downloaded
    if (dropData.hasDownloaded) {
      return NextResponse.json({ error: "File has already been accessed" }, { status: 410 })
    }

    // Check if expired
    if (Date.now() > dropData.expiresAt) {
      // Clean up expired data
      await deleteDropData(code)
      if (dropData.type === "file") {
        const publicId = getPublicIdFromUrl(dropData.content)
        await deleteFile(publicId)
      }
      return NextResponse.json({ error: "File has expired" }, { status: 410 })
    }

    return NextResponse.json({
      success: true,
      data: dropData,
    })
  } catch (error) {
    console.error("Get file error:", error)
    return NextResponse.json({ error: "Failed to retrieve file" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params
    const { action } = await request.json()

    if (action === "download") {
      const dropData = await getDropData(code)

      if (!dropData) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }

      if (dropData.hasDownloaded) {
        return NextResponse.json({ error: "File already accessed" }, { status: 410 })
      }

      // Mark as downloaded and delete
      await deleteDropData(code)

      // If it's a file, also delete from Cloudinary
      if (dropData.type === "file") {
        const publicId = getPublicIdFromUrl(dropData.content)
        await deleteFile(publicId)
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("File action error:", error)
    return NextResponse.json({ error: "Action failed" }, { status: 500 })
  }
}
