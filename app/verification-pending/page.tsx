"use client";
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VerificationPendingPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [timeWaited, setTimeWaited] = useState(0)

  useEffect(() => {
    const user = localStorage.getItem('naijaAmeboCurrentUser')
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(JSON.parse(user))

    // Update time waited every second
    const interval = setInterval(() => {
      setTimeWaited((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [router])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md p-6 text-center">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          Amebo Connect
        </h1>
      </div>

      <div className="max-w-md mx-auto mt-24">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Pending Icon */}
          <div className="mb-6">
            <div className="inline-block bg-yellow-100 dark:bg-yellow-900 rounded-full p-6 mb-4">
              <svg
                className="w-16 h-16 text-yellow-600 dark:text-yellow-400 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Main Message */}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Verification in Progress
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Hello, <span className="font-semibold">{currentUser.firstName}!</span>
          </p>

          {/* Details */}
          <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your account is pending admin verification. Our team is reviewing:
            </p>
            <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Facial verification photo</span>
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Personal details accuracy</span>
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Account compliance</span>
              </li>
            </ul>
          </div>

          {/* Timeline */}
          <div className="bg-green-50 dark:bg-gray-700 border-l-4 border-green-500 p-4 rounded mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Expected Timeline:</span> 24 hours
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              We'll review and approve your account as soon as possible. You'll be notified via
              email.
            </p>
          </div>

          {/* Time Waited */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Time waiting</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatTime(timeWaited)}
            </p>
          </div>

          {/* What Happens Next */}
          <div className="text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
              What happens next?
            </h3>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex">
                <span className="font-bold mr-3 text-blue-500">1.</span>
                <span>Admin reviews your facial verification</span>
              </li>
              <li className="flex">
                <span className="font-bold mr-3 text-blue-500">2.</span>
                <span>We verify your personal details</span>
              </li>
              <li className="flex">
                <span className="font-bold mr-3 text-blue-500">3.</span>
                <span>Approval email is sent to you</span>
              </li>
              <li className="flex">
                <span className="font-bold mr-3 text-blue-500">4.</span>
                <span>You can access all platform features</span>
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Logout
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            If you're not approved within 24 hours, please contact support
          </p>
        </div>
      </div>
    </div>
  )
}
