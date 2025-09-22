import { type NextRequest, NextResponse } from "next/server"
import { getDropData, deleteDropData } from "@/lib/redis"
import { deleteFile, getPublicIdFromUrl, fetchFileFromCloudinary } from "@/lib/cloudinary"

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    console.log("Download request for code:", code)

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
      console.log("File has expired, permanently deleting from all storage...")
      // Clean up expired data immediately
      await deleteDropData(code)
      if (dropData.type === "file") {
        const publicId = getPublicIdFromUrl(dropData.content)
        console.log("Deleting expired file from Cloudinary:", publicId)
        const deleted = await deleteFile(publicId)
        console.log("Expired file deletion result:", deleted)
      }
      return NextResponse.json({ error: "File has expired and has been permanently deleted" }, { status: 410 })
    }

    if (dropData.type === "text") {
      // For text, immediately delete and return content (One-time access only!)
      console.log("One-time text access - permanently deleting from Redis...")
      const deleted = await deleteDropData(code)
      console.log("Text deletion result:", deleted)

      return NextResponse.json({
        success: true,
        type: "text",
        content: dropData.content,
        filename: `note-${code}.txt`,
        message: "Text has been permanently deleted after this access"
      })
    }

    if (dropData.type === "file") {
      // IMMEDIATELY DELETE FROM STORAGE FIRST (One-time access only!)
      console.log("Starting one-time file access - deleting from storage immediately...")
      
      const publicId = getPublicIdFromUrl(dropData.content)
      console.log("Public ID for deletion:", publicId)
      
      // Delete from Redis first
      const redisDeleted = await deleteDropData(code)
      console.log("Redis deletion result:", redisDeleted)
      
      try {
        // Fetch the file using Cloudinary SDK
        console.log("Fetching file using Cloudinary SDK...")
        const fileData = await fetchFileFromCloudinary(publicId)
        
        // Delete from Cloudinary immediately after successful fetch
        console.log("File fetched successfully, now deleting from Cloudinary...")
        const cloudinaryDeleted = await deleteFile(publicId)
        console.log("Cloudinary deletion result:", cloudinaryDeleted)

        if (!cloudinaryDeleted) {
          console.warn("Failed to delete file from Cloudinary, but download will proceed")
        }

        // Return the file with proper headers
        const originalFilename = dropData.filename || "download"
        const fileExtension = originalFilename.split('.').pop()?.toLowerCase()
        
        // Set appropriate Content-Type based on file extension
        let contentType = "application/octet-stream"
        if (fileExtension === 'pdf') {
          contentType = "application/pdf"
        } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
          contentType = "image/jpeg"
        } else if (fileExtension === 'png') {
          contentType = "image/png"
        } else if (fileExtension === 'txt') {
          contentType = "text/plain"
        } else if (fileExtension === 'doc' || fileExtension === 'docx') {
          contentType = "application/msword"
        }
        
        const headers = new Headers()
        headers.set("Content-Type", contentType)
        headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(originalFilename)}"`)
        headers.set("Content-Length", fileData.byteLength.toString())

        console.log(`✅ One-time download completed successfully - "${originalFilename}" permanently deleted from all storage`)
        return new NextResponse(new Uint8Array(fileData), {
          status: 200,
          headers,
        })
      } catch (error) {
        console.error("Error during file download:", error)
        
        // Ensure cleanup even if download fails
        console.log("Download failed, ensuring file is deleted from Cloudinary...")
        await deleteFile(publicId)
        
        return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
      }
    }

    return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
