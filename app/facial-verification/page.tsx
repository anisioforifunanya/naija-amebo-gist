"use client";
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type VerificationStep = 'initial' | 'camera' | 'review' | 'submitted'

export default function FacialVerificationPage() {
  const router = useRouter()
  const [step, setStep] = useState<VerificationStep>('initial')
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    setIsMounted(true)
    const user = localStorage.getItem('naijaAmeboCurrentUser')
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
    // Don't redirect, allow access to this page
  }, [])

  // Request camera access and start stream
  const openCamera = async () => {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Camera API not available in your browser', {
          position: 'bottom-right',
          autoClose: 5000,
        })
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
        setStep('camera')
        toast.success('Camera opened successfully', {
          position: 'bottom-right',
          autoClose: 3000,
        })
      }
    } catch (err: any) {
      console.error('Camera error:', err)
      const errorMessage = err?.name === 'NotAllowedError' 
        ? 'Camera permission was denied. Please allow camera access in your browser settings.'
        : err?.name === 'NotFoundError'
        ? 'No camera device found. Please check your device.'
        : 'Failed to access camera. Please check permissions and try again.'
      
      toast.error(errorMessage, {
        position: 'bottom-right',
        autoClose: 5000,
      })
    }
  }

  // Capture photo from video stream
  const snapPhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        // Set canvas size to match video
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight

        // Mirror the image horizontally (like a selfie)
        context.scale(-1, 1)
        context.drawImage(
          videoRef.current,
          -canvasRef.current.width,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        )

        // Convert to base64
        const photoData = canvasRef.current.toDataURL('image/jpeg', 0.95)
        setCapturedPhoto(photoData)

        // Stop camera stream
        if (videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
          tracks.forEach(track => track.stop())
        }
        setCameraActive(false)
        setStep('review')
        toast.success('Photo captured successfully', {
          position: 'bottom-right',
          autoClose: 3000,
        })
      }
    }
  }

  // Cancel camera and go back
  const cancelCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
    setCameraActive(false)
    setStep('initial')
  }

  // Retake photo
  const retakePhoto = () => {
    setCapturedPhoto(null)
    setStep('initial')
  }

  // Submit facial verification
  const submitVerification = async () => {
    if (!capturedPhoto || !currentUser) {
      toast.error('Photo is required', {
        position: 'bottom-right',
      })
      return
    }

    setIsLoading(true)
    try {
      // Get all users
      const usersData = localStorage.getItem('naijaAmeboUsers')
      const users = usersData ? JSON.parse(usersData) : []

      // Update current user with verification photo
      const updatedUsers = users.map((u: any) =>
        u.id === currentUser.id
          ? {
              ...u,
              facialPhoto: capturedPhoto,
              verificationStatus: 'pending',
              verificationSubmittedAt: new Date().toISOString(),
            }
          : u
      )

      // Save updated users
      localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))

      // Update current user in localStorage
      const updatedUser = {
        ...currentUser,
        facialPhoto: capturedPhoto,
        verificationStatus: 'pending',
        verificationSubmittedAt: new Date().toISOString(),
      }
      localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(updatedUser))
      setCurrentUser(updatedUser)

      toast.success('Facial verification submitted successfully!', {
        position: 'bottom-right',
        autoClose: 3000,
      })

      setStep('submitted')

      // Redirect to personal details after 2 seconds
      setTimeout(() => {
        router.push('/personal-details')
      }, 2000)
    } catch (error) {
      console.error('Error submitting verification:', error)
      toast.error('Failed to submit verification. Please try again.', {
        position: 'bottom-right',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) {
    return null // Loading state
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to continue</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <ToastContainer />

      {/* Header with Logo */}
      <div className="bg-white dark:bg-gray-800 shadow-md p-6 text-center">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
          Amebo Connect
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Welcome, {currentUser.firstName}! Let's verify your identity
        </p>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Initial Step - Welcome & Picture Preview */}
        {step === 'initial' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">
              Facial Verification Module
            </h2>

            <div className="bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500 p-4 rounded mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Welcome to Amebo Connect! To maintain safety and deter scammers, we require you to
                complete your registration by uploading a clear photo of your face in good
                lighting and updating your personal details on the next page.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your submission will undergo screening. If deemed appropriate it will be approved
                within 24 hours.
              </p>
            </div>

            {/* Picture Preview */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-full max-w-xs h-80 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                {capturedPhoto ? (
                  <img
                    src={capturedPhoto}
                    alt="Picture preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="https://placehold.co/600x400/EEE/31343C?font=raleway&text=Picture%20preview"
                    alt="Picture preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Open Camera Button */}
            <button
              onClick={openCamera}
              className="w-full bg-blue-500 hover:bg-blue-600 hover:scale-105 transition-all text-white font-bold py-3 px-4 rounded-lg shadow-lg"
            >
              📷 Open Camera
            </button>

            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
              Ensure you're in a well-lit area with your face clearly visible
            </p>
          </div>
        )}

        {/* Camera Step */}
        {step === 'camera' && cameraActive && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              📸 Take Your Photo
            </h2>

            <div className="relative mb-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-2xl border-4 border-blue-500 scale-x-[-1] object-cover"
                style={{ maxWidth: '100%', maxHeight: '500px' }}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Camera Controls */}
            <div className="flex gap-4 justify-center mb-6">
              <button
                onClick={snapPhoto}
                className="bg-green-500 hover:bg-green-600 hover:scale-105 transition-all text-white font-bold py-3 px-8 rounded-lg shadow-lg"
              >
                ✓ Snap
              </button>
              <button
                onClick={cancelCamera}
                className="bg-red-500 hover:bg-red-600 hover:scale-105 transition-all text-white font-bold py-3 px-8 rounded-lg shadow-lg"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                Position your face clearly in the center and press Snap
              </p>
            </div>
          </div>
        )}

        {/* Review Step - Confirm Photo */}
        {step === 'review' && capturedPhoto && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">
              Confirm Verification Picture
            </h2>

            <div className="bg-amber-50 dark:bg-gray-700 border-l-4 border-amber-500 p-4 rounded mb-6">
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Confirm your picture is clear and shows your full uncovered face.
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold mt-2">
                ⚠️ You cannot change your verification picture once you've submitted
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <img
                src={capturedPhoto}
                alt="Verification preview"
                className="max-w-xs max-h-96 rounded-xl border-4 border-blue-500 shadow-lg object-cover"
              />
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={retakePhoto}
                className="bg-gray-500 hover:bg-gray-600 hover:scale-105 transition-all text-white font-bold py-3 px-8 rounded-lg shadow-lg"
              >
                🔄 Retake Photo
              </button>
              <button
                onClick={submitVerification}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg shadow-lg"
              >
                {isLoading ? '⏳ Submitting...' : '✓ Submit Photo'}
              </button>
            </div>
          </div>
        )}

        {/* Submitted Step - Success Message */}
        {step === 'submitted' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-fade-in text-center">
            <div className="mb-6">
              <div className="inline-block bg-green-100 dark:bg-green-900 rounded-full p-4 mb-4">
                <span className="text-4xl">✓</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
              Verification Successful!
            </h2>

            <div className="bg-green-50 dark:bg-gray-700 border-l-4 border-green-500 p-4 rounded mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                Your facial verification photo has been submitted successfully. Our admin team
                will review your submission within 24 hours.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                While you wait for approval, let's complete your personal details.
              </p>
            </div>

            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Redirecting to personal details page...
            </p>

            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-blue-600 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}
