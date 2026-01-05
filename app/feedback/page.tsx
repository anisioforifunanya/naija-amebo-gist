'use client'

import { useState } from 'react'

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'gossip',
    content: '',
    anonymous: false,
    attachmentUrl: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Here you would send the data to your backend
    console.log('Form submitted:', formData)

    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
      setFormData({
        name: '',
        email: '',
        type: 'gossip',
        content: '',
        anonymous: false,
        attachmentUrl: '',
      })

      setTimeout(() => setSubmitted(false), 5000)
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            📮 Send Us a Tip
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Got breaking gossip, exclusive news, or a story tip? Share it with us confidentially!
          </p>
        </div>

        {/* Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-bold mb-2">Confidential</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You can submit anonymously and we'll protect your identity
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold mb-2">Fast Response</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We investigate tips quickly and follow up with our sources
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold mb-2">Verified Info</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All tips are verified before being published on our platform
            </p>
          </div>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-8 bg-green-100 dark:bg-green-900 border-l-4 border-green-500 p-6 rounded">
            <p className="text-green-800 dark:text-green-200 font-bold">✓ Thank you for your tip!</p>
            <p className="text-green-700 dark:text-green-300 text-sm mt-1">
              We've received your submission and will investigate it. You'll hear from us soon if we need more
              information.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Name */}
            <div>
              <label className="block font-semibold mb-2 text-gray-900 dark:text-white">
                Full Name {!formData.anonymous && '*'}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={formData.anonymous}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                placeholder="Your name (optional for anonymous)"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold mb-2 text-gray-900 dark:text-white">
                Email {!formData.anonymous && '*'}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={formData.anonymous}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Type */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-900 dark:text-white">Type of Tip *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="gossip">Celebrity Gossip/Rumor</option>
              <option value="breaking-news">Breaking News</option>
              <option value="scandal">Scandal/Controversy</option>
              <option value="exclusive">Exclusive Story</option>
              <option value="correction">Correction/Fact-Check</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-900 dark:text-white">Your Story/Tip *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-40 resize-none"
              placeholder="Please provide as much detail as possible. Who? What? When? Where? Why?"
            />
          </div>

          {/* Attachments Info */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-900 dark:text-white">
              Attachment (Photos, Video Links, Documents)
            </label>
            <input
              type="url"
              name="attachmentUrl"
              value={formData.attachmentUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Paste link to photos, videos, or documents"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              You can use cloud storage links (Google Drive, Dropbox, etc.) to share files securely
            </p>
          </div>

          {/* Anonymous Checkbox */}
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              name="anonymous"
              checked={formData.anonymous}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="anonymous" className="ml-3 text-gray-900 dark:text-white">
              Submit anonymously (name and email will not be published)
            </label>
          </div>

          {/* Terms */}
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-xs text-blue-900 dark:text-blue-200">
              By submitting this form, you agree that:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All information you provide must be truthful to the best of your knowledge</li>
                <li>We will verify all tips before publication</li>
                <li>We reserve the right to edit content for clarity and length</li>
                <li>Your privacy will be protected if you choose to remain anonymous</li>
              </ul>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            {loading ? 'Submitting...' : 'Submit Tip Securely'}
          </button>
        </form>

        {/* Help Section */}
        <div className="mt-12 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Q: Will my identity be protected?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                A: Yes! You can submit anonymously and we use secure methods to protect sources. If you provide
                contact info, we only use it to follow up if needed.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Q: How long will verification take?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                A: Verification typically takes 2-7 business days. We'll contact you if we need more information.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Q: Can I provide evidence?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                A: Absolutely! Links to photos, videos, documents, or articles help us verify your story faster.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
