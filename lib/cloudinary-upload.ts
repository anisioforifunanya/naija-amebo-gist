/**
 * CLOUDINARY UPLOAD HELPER
 * =========================
 * Upload images/videos to Cloudinary (NOT localStorage)
 */

export async function uploadToCloudinary(file: File | Blob, folder: string = 'naija-amebo'): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'naija-amebo-upload')
    formData.append('folder', folder)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('[Cloudinary] Upload success:', data.secure_url)
    return data.secure_url
  } catch (error) {
    console.error('[Cloudinary] Upload error:', error)
    throw error
  }
}

/**
 * Convert file to base64 (for metadata/preview only, NOT for storage)
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

/**
 * Convert blob to base64 (for metadata/preview only, NOT for storage)
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

export default {
  uploadToCloudinary,
  fileToBase64,
  blobToBase64
}
