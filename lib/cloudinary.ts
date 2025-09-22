import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  public_id: string
  secure_url: string
  original_filename: string
  format: string
  bytes: number
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Determine the appropriate resource type based on file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  const isDocument = ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar', 'xlsx', 'pptx'].includes(fileExtension || '')
  const resourceType = isDocument ? 'raw' : 'auto'
  
  console.log("Upload details:", {
    filename: file.name,
    extension: fileExtension,
    isDocument,
    resourceType
  })

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: resourceType,
          folder: "dropfade",
          use_filename: true,
          unique_filename: true,
          type: "upload", // Ensure it's a public upload
          access_mode: "public", // Make sure the file is publicly accessible
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              original_filename: result.original_filename || file.name,
              format: result.format,
              bytes: result.bytes,
            })
          } else {
            reject(new Error("Upload failed"))
          }
        },
      )
      .end(buffer)
  })
}

export async function deleteFile(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === "ok"
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error)
    return false
  }
}

export async function fetchFileFromCloudinary(publicId: string): Promise<Uint8Array> {
  try {
    console.log("Fetching file from Cloudinary using SDK for publicId:", publicId)
    
    // First, get the resource details to determine the correct resource type
    const resourceDetails = await cloudinary.api.resource(publicId, {
      resource_type: "image", // Try image first
    }).catch(async () => {
      // If image fails, try raw
      return await cloudinary.api.resource(publicId, {
        resource_type: "raw",
      })
    }).catch(async () => {
      // If both fail, try video
      return await cloudinary.api.resource(publicId, {
        resource_type: "video",
      })
    })

    console.log("Resource details:", resourceDetails)
    
    // Check if this is a document/PDF that should NOT be transformed
    const isDocument = resourceDetails.format && ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar'].includes(resourceDetails.format.toLowerCase())
    
    console.log("Is document file:", isDocument, "Format:", resourceDetails.format)
    
    // Since the file is public, try direct download with different approaches
    const urls = [
      resourceDetails.secure_url,
      resourceDetails.url,
      // Generate a fresh URL without version - NO TRANSFORMATIONS for documents
      cloudinary.url(publicId, {
        resource_type: resourceDetails.resource_type,
        type: 'upload',
        secure: true
      })
    ]
    
    for (const url of urls) {
      try {
        console.log("Trying to fetch from URL:", url)
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
            'Cache-Control': 'no-cache'
          }
        })
        
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer()
          console.log("File fetched successfully from URL:", url, "size:", arrayBuffer.byteLength)
          return new Uint8Array(arrayBuffer)
        } else {
          console.log("Failed to fetch from URL:", url, "Status:", response.status)
        }
      } catch (error) {
        console.log("Error fetching from URL:", url, error)
        continue
      }
    }
    
    // If all direct URLs fail, try using different resource types
    if (!isDocument) {
      // Only use transformations for actual images
      try {
        const transformedUrl = cloudinary.url(publicId, {
          resource_type: resourceDetails.resource_type,
          type: 'upload',
          secure: true,
          fetch_format: 'auto',
          quality: 'auto'
        })
        
        console.log("Trying transformed URL (images only):", transformedUrl)
        const response = await fetch(transformedUrl)
        
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer()
          console.log("File fetched successfully via transformation, size:", arrayBuffer.byteLength)
          return new Uint8Array(arrayBuffer)
        }
      } catch (error) {
        console.log("Transformation URL also failed:", error)
      }
    } else {
      // For documents, try the raw resource type URL specifically
      try {
        const rawUrl = cloudinary.url(publicId, {
          resource_type: 'raw',
          type: 'upload',
          secure: true
        })
        
        console.log("Trying raw resource URL for document:", rawUrl)
        const response = await fetch(rawUrl)
        
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer()
          console.log("Document fetched successfully via raw URL, size:", arrayBuffer.byteLength)
          return new Uint8Array(arrayBuffer)
        }
      } catch (error) {
        console.log("Raw URL also failed:", error)
      }
    }
    
    throw new Error("All download methods failed")
    
  } catch (error) {
    console.error("Error fetching file from Cloudinary:", error)
    throw new Error("Failed to fetch file from Cloudinary")
  }
}

export function getPublicIdFromUrl(url: string): string {
  const parts = url.split("/")
  const filename = parts[parts.length - 1]
  const publicId = filename.split(".")[0]
  return `dropfade/${publicId}`
}
