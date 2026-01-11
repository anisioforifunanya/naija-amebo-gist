"use client";
import { useState, useEffect } from 'react'
import Link from 'next/link'
import LiveRecorder from '../../components/LiveRecorder'
import NotificationToast from '../../components/NotificationToast'
import { createArticleInFirebase } from '@/lib/useArticles'

interface NewsSubmission {
  title: string
  description: string
  category: string
  hashtags: string
  socialCaption: string
  submitterName: string
  submitterEmail: string
  image?: File
  video?: File
  liveVideo?: Blob
  liveAudio?: Blob
}

export default function SubmitNews() {
  const [formData, setFormData] = useState<NewsSubmission>({
    title: '',
    description: '',
    category: 'breaking-news',
    hashtags: '',
    socialCaption: '',
    submitterName: '',
    submitterEmail: '',
    image: undefined,
    video: undefined,
    liveVideo: undefined,
    liveAudio: undefined
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  } | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Upload file to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.details || 'Upload failed')
    }

    const data = await response.json()
    
    // CRITICAL: Verify we got a Cloudinary URL, not base64
    if (!data.url) {
      throw new Error('No URL returned from Cloudinary - upload may have failed')
    }
    
    if (data.url.startsWith('data:')) {
      throw new Error('Upload failed: Image is base64, not Cloudinary URL. This means Cloudinary upload didn\'t work.')
    }
    
    // Verify it's a Cloudinary URL
    if (!data.url.includes('cloudinary.com') && !data.url.includes('res.cloudinary.com')) {
      throw new Error('Upload failed: URL is not from Cloudinary. Expected secure_url from Cloudinary API.')
    }
    
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setNotification({
      message: '⏳ Uploading your submission...',
      type: 'info'
    })

    try {
      let imageUrl = '';
      let videoUrl = '';

      // Upload image to Cloudinary if exists
      if (formData.image) {
        setNotification({
          message: '📸 Uploading image to Cloudinary...',
          type: 'info'
        })
        imageUrl = await uploadToCloudinary(formData.image)
      }

      // Upload video to Cloudinary if exists
      if (formData.video) {
        setNotification({
          message: '🎥 Uploading video to Cloudinary...',
          type: 'info'
        })
        videoUrl = await uploadToCloudinary(formData.video)
      }

      setNotification({
        message: '💾 Saving to Firebase database...',
        type: 'info'
      })

      // Create article in Firebase (not localStorage anymore!)
      const result = await createArticleInFirebase({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        submitterName: formData.submitterName,
        submitterEmail: formData.submitterEmail,
        image: imageUrl || undefined,
        video: videoUrl || undefined,
        hashtags: formData.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag),
        socialCaption: formData.socialCaption,
      })

      setIsSubmitting(false)
      setSubmitted(true)
      setNotification({
        message: `✓ Success! Your article "${formData.title}" has been saved to Firebase database. It's pending admin review.`,
        type: 'success'
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'breaking-news',
        hashtags: '',
        socialCaption: '',
        submitterName: '',
        submitterEmail: '',
        image: undefined,
        video: undefined,
        liveVideo: undefined,
        liveAudio: undefined
      })
    } catch (error) {
      setIsSubmitting(false)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setNotification({
        message: `✕ Error submitting news: ${errorMessage}`,
        type: 'error'
      })
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4">News Submitted Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Your news submission has been received and is pending admin approval.
            You'll receive updates via email once it's reviewed.
          </p>
          <div className="space-y-2">
            <Link href="/" className="block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Back to Homepage
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="block w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Submit Another News
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          duration={6000}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Your News</h1>
            <p className="text-gray-600">
              Share breaking news, celebrity gossip, or viral stories. All submissions are reviewed by our editorial team.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.submitterName}
                  onChange={(e) => setFormData({...formData, submitterName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.submitterEmail}
                  onChange={(e) => setFormData({...formData, submitterEmail: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                News Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a catchy headline"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="breaking-news">Breaking News</option>
                <option value="trending-stories">Trending Stories</option>
                <option value="celebrity-news">Celebrity News</option>
                <option value="entertainment">Entertainment</option>
                <option value="viral-content">Viral Content</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                News Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                placeholder="Provide detailed information about the news. Include sources, context, and any relevant background information."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hashtags (Optional)
              </label>
              <input
                type="text"
                value={formData.hashtags}
                onChange={(e) => setFormData({...formData, hashtags: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="celebrity, gossip, breaking, viral (comma separated)"
              />
              <p className="text-sm text-gray-500 mt-1">Separate multiple hashtags with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Media Caption (Optional)
              </label>
              <textarea
                value={formData.socialCaption}
                onChange={(e) => setFormData({...formData, socialCaption: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                placeholder="Create an engaging caption for social media sharing. Make it attention-grabbing!"
              />
              <p className="text-sm text-gray-500 mt-1">This will be used when sharing your news on social platforms</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({...formData, image: e.target.files?.[0]})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Supported formats: JPG, PNG, GIF, WebP (Max 10MB)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Video (Optional)
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFormData({...formData, video: e.target.files?.[0]})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Supported formats: MP4, WebM, AVI (Max 50MB)</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-md">
              <h3 className="font-semibold text-purple-900 mb-4">🎥 Live Video Recording</h3>
              <p className="text-sm text-purple-800 mb-4">
                Record live video directly from your device. Allow camera & microphone access when prompted.
              </p>
              <LiveRecorder type="video" onRecorded={(file) => setFormData({...formData, liveVideo: file.blob})} maxDurationSec={180} />
            </div>

            <div className="bg-purple-50 p-6 rounded-md">
              <h3 className="font-semibold text-purple-900 mb-4">🎤 Live Voice Recording</h3>
              <p className="text-sm text-purple-800 mb-4">
                Record live audio directly from your device. Allow microphone access when prompted.
              </p>
              <LiveRecorder type="audio" onRecorded={(file) => setFormData({...formData, liveAudio: file.blob})} maxDurationSec={300} />
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-semibold text-blue-900 mb-2">Submission Guidelines:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure your news is accurate and based on credible sources</li>
                <li>• Respect privacy and avoid harmful content</li>
                <li>• All submissions are reviewed before publication</li>
                <li>• You may be contacted for verification</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit News'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-500 hover:underline">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}