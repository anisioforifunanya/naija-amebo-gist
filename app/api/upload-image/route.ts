import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Handle both File uploads and base64 strings
    let fileData: string | null = null
    
    // Check for File object first (from submit-news form)
    const file = formData.get('file')
    if (file instanceof File) {
      // Convert File to base64
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      // Convert bytes to binary string
      let binary = ''
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      fileData = 'data:' + file.type + ';base64,' + btoa(binary)
    } else {
      // Fallback to base64 string (from image migration)
      fileData = formData.get('base64') as string
    }

    if (!fileData) {
      return NextResponse.json(
        { error: 'No file or base64 data provided' },
        { status: 400 }
      )
    }

    // Get Cloudinary credentials from environment
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      console.error('Missing Cloudinary credentials')
      return NextResponse.json(
        { 
          error: 'Cloudinary not configured',
          details: `Cloud: ${!!cloudName}, Preset: ${!!uploadPreset}`
        },
        { status: 500 }
      )
    }

    // Upload to Cloudinary
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', fileData)
    cloudinaryFormData.append('upload_preset', uploadPreset)
    cloudinaryFormData.append('public_id', `naija-news-${Date.now()}`)

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: cloudinaryFormData,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Cloudinary error:', data)
      return NextResponse.json(
        { error: 'Upload failed', details: data.error?.message || JSON.stringify(data) },
        { status: 400 }
      )
    }

    return NextResponse.json({
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: String(error) },
      { status: 500 }
    )
  }
}
