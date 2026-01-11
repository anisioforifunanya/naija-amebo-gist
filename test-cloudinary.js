#!/usr/bin/env node

/**
 * Test Cloudinary Image Upload
 * Run: node test-cloudinary.js
 */

async function testUpload() {
  console.log('🧪 Testing Cloudinary Upload...\n')

  // Create a test file (simple PNG)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  const buffer = Buffer.from(testImageBase64, 'base64')
  const blob = new Blob([buffer], { type: 'image/png' })

  try {
    // Convert blob to FormData
    const formData = new FormData()
    formData.append('file', blob, 'test.png')

    // Upload via our API
    const response = await fetch('http://localhost:3001/api/upload-image', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ Upload Successful!')
      console.log(`📸 Image URL: ${data.url}`)
      console.log(`📐 Dimensions: ${data.width}x${data.height}`)
    } else {
      console.log('❌ Upload Failed')
      console.log(`Error: ${data.error}`)
      console.log(`Details: ${data.details}`)
    }
  } catch (error) {
    console.log('❌ Error:', error)
  }
}

// Run test
testUpload()
