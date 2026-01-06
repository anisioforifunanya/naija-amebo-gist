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
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [videoMetadataLoaded, setVideoMetadataLoaded] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt')

  // Handle when video metadata loads (has dimensions)
  const handleVideoMetadataLoaded = () => {
    console.log('📹 Video metadata loaded')
    console.log('Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
    setVideoMetadataLoaded(true)
  }

  // Check authentication on mount
  useEffect(() => {
    setIsMounted(true)
    const user = localStorage.getItem('naijaAmeboCurrentUser')
    if (user) {
      setCurrentUser(JSON.parse(user))
    }

    // Check initial camera permission status
    checkCameraPermission()

    // Cleanup: stop stream when component unmounts
    return () => {
      if (streamRef.current) {
        console.log('🛑 Stopping stream on unmount')
        streamRef.current.getTracks().forEach(track => {
          console.log('Stopping track:', track.kind)
          track.stop()
        })
        streamRef.current = null
      }
    }
  }, [])

  // Check camera permission status
  const checkCameraPermission = async () => {
    try {
      if (!navigator.permissions || !navigator.permissions.query) {
        // Browser doesn't support Permissions API, show prompt
        setPermissionStatus('prompt')
        return
      }

      const result = await navigator.permissions.query({ name: 'camera' as any })
      setPermissionStatus(result.state as any)

      // Listen for permission changes
      result.addEventListener('change', () => {
        setPermissionStatus(result.state as any)
      })
    } catch (err) {
      console.log('Permission check not available:', err)
      setPermissionStatus('prompt')
    }
  }

  // Request camera access and start stream
  const openCamera = async () => {
    setIsLoading(true)
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Camera API not available in your browser', {
          position: 'bottom-right',
          autoClose: 5000,
        })
        setIsLoading(false)
        return
      }

      console.log('Requesting camera access...')
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      console.log('✅ Camera permission granted')
      console.log('Stream active:', stream.active)
      console.log('Video tracks:', stream.getVideoTracks().length)

      // Store stream in ref so it doesn't get garbage collected
      streamRef.current = stream

      // Monitor stream tracks
      stream.getTracks().forEach(track => {
        track.onended = () => {
          console.log('⚠️ Track ended:', track.kind)
          setCameraActive(false)
          streamRef.current = null
        }
      })

      if (videoRef.current) {
        // Wait a tiny bit to ensure video element is ready
        setTimeout(() => {
          if (videoRef.current && streamRef.current) {
            console.log('Setting video stream...')
            console.log('Video element current:', videoRef.current)
            console.log('Stream tracks before setting:', streamRef.current.getTracks().length)
            
            videoRef.current.srcObject = streamRef.current
            console.log('Video srcObject set, waiting for play...')
            
            // Ensure video plays with proper error handling
            const playPromise = videoRef.current.play()
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log('✅ Video playing successfully')
                  console.log('Video element dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
                  console.log('Video readyState:', videoRef.current?.readyState)
                  console.log('Video networkState:', videoRef.current?.networkState)
                  setCameraActive(true)
                  setPermissionStatus('granted')
                  toast.success('Camera opened successfully', {
                    position: 'bottom-right',
                    autoClose: 3000,
                  })
                })
                .catch((err: any) => {
                  console.error('❌ Error playing video:', err)
                  console.error('Video element state at error:', {
                    readyState: videoRef.current?.readyState,
                    networkState: videoRef.current?.networkState,
                    videoWidth: videoRef.current?.videoWidth,
                    videoHeight: videoRef.current?.videoHeight,
                  })
                  toast.error(`Video playback error: ${err?.message || 'Unknown error'}`, {
                    position: 'bottom-right',
                    autoClose: 5000,
                  })
                  // Stop the stream if play fails
                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop())
                    streamRef.current = null
                  }
                  setCameraActive(false)
                })
            }
          }
        }, 100)
      }
    } catch (err: any) {
      console.error('Camera error:', err)
      
      let errorMessage = 'Failed to access camera.'
      
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission was denied. Please enable camera in your browser settings and try again.'
        setPermissionStatus('denied')
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera device found on this device.'
      } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
        errorMessage = 'Camera is in use by another application. Please close it and try again.'
      } else if (err?.name === 'SecurityError') {
        errorMessage = 'Camera access is blocked for security reasons. Please check your browser settings.'
      } else {
        errorMessage = `Camera error: ${err?.message || 'Unknown error'}`
      }
      
      toast.error(errorMessage, {
        position: 'bottom-right',
        autoClose: 6000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Reset camera and permission status
  const resetCamera = () => {
    console.log('Resetting camera...')
    if (streamRef.current) {
      console.log('Stopping all tracks...')
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind)
        track.stop()
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
    setStep('initial')
    setPermissionStatus('prompt')
    checkCameraPermission()
  }

  // Cancel camera (stop stream without resetting permission)
  const cancelCamera = () => {
    console.log('Canceling camera...')
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind)
        track.stop()
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
    setVideoMetadataLoaded(false)
  }

  // Capture photo from video stream
  const snapPhoto = () => {
    console.log('📸 Attempting to capture photo...')
    
    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ Missing video or canvas ref')
      toast.error('Camera not initialized', {
        position: 'bottom-right',
        autoClose: 3000,
      })
      return
    }

    // Check if video has valid dimensions
    console.log('Video element state:', {
      videoWidth: videoRef.current.videoWidth,
      videoHeight: videoRef.current.videoHeight,
      readyState: videoRef.current.readyState,
      networkState: videoRef.current.networkState,
    })

    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      console.error('❌ Video frame not ready yet')
      toast.error('Video is still loading. Please wait a moment and try again.', {
        position: 'bottom-right',
        autoClose: 3000,
      })
      return
    }

    try {
      const context = canvasRef.current.getContext('2d')
      if (!context) {
        console.error('❌ Failed to get canvas context')
        toast.error('Canvas error - please refresh and try again', {
          position: 'bottom-right',
          autoClose: 3000,
        })
        return
      }

      // Set canvas size to match video (actual display size, not native size)
      const displayWidth = videoRef.current.offsetWidth
      const displayHeight = videoRef.current.offsetHeight
      
      console.log('Canvas dimensions - Display:', displayWidth, 'x', displayHeight, 'Native:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight)
      
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

      console.log('✅ Frame drawn to canvas')

      // Convert canvas to blob (more reliable than base64)
      canvasRef.current.toBlob(
        (blob) => {
          if (blob) {
            console.log('✅ Canvas converted to blob, size:', blob.size, 'bytes')
            
            // Create object URL for preview
            const photoUrl = URL.createObjectURL(blob)
            setCapturedPhoto(photoUrl)
            
            // Store blob for submission
            localStorage.setItem('naijaAmeboPhotoBlobUrl', photoUrl)
            localStorage.setItem('naijaAmeboPhotoBlob', JSON.stringify({
              size: blob.size,
              type: blob.type,
              timestamp: new Date().toISOString(),
            }))

            console.log('✅ Photo saved to preview')

            // Stop camera stream
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => {
                console.log('Stopping track after capture:', track.kind)
                track.stop()
              })
              streamRef.current = null
            }
            if (videoRef.current) {
              videoRef.current.srcObject = null
            }
            setCameraActive(false)
            setStep('review')
            toast.success('Photo captured successfully', {
              position: 'bottom-right',
              autoClose: 3000,
            })
          } else {
            console.error('❌ Blob conversion failed')
            toast.error('Failed to capture photo', {
              position: 'bottom-right',
              autoClose: 3000,
            })
          }
        },
        'image/jpeg',
        0.95
      )
    } catch (error) {
      console.error('❌ Error during snap:', error)
      toast.error(`Capture error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        position: 'bottom-right',
        autoClose: 3000,
      })
    }
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

            {/* Camera Container - Simple white card with video */}
            {cameraActive ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl max-w-md mx-auto mb-8">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={handleVideoMetadataLoaded}
                  className="w-full rounded-2xl border-4 border-blue-500"
                  style={{ 
                    maxWidth: '100%',
                    transform: 'scaleX(-1)',
                    backgroundColor: '#000000',
                    display: 'block'
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Snap and Cancel Buttons */}
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={snapPhoto}
                    disabled={!videoMetadataLoaded}
                    className={`font-bold py-2 px-4 rounded-lg transition-all ${
                      videoMetadataLoaded
                        ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                        : 'bg-gray-400 text-white cursor-not-allowed opacity-50'
                    }`}
                  >
                    {videoMetadataLoaded ? '✓ Snap' : '⏳ Loading...'}
                  </button>
                  <button
                    onClick={cancelCamera}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                  >
                    ✕ Cancel
                  </button>
                </div>
                
                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500 p-3 rounded mt-4">
                  <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                    Position your face clearly and click Snap
                  </p>
                </div>
              </div>
            ) : (
              /* Picture Preview Area when camera is not active */
              <div className="flex flex-col items-center mb-8">
                <div className="w-full max-w-xs h-80 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                  {capturedPhoto ? (
                    <img
                      src={capturedPhoto}
                      alt="Captured photo"
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
            )}

            {/* Open Camera Button - Only show when not in camera mode */}
            {!cameraActive && step === 'initial' ? (
              <>
                {/* Permission Status Display */}
                {permissionStatus === 'denied' && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <p className="text-red-700 dark:text-red-300 text-sm font-semibold">
                      ❌ Camera Permission Denied
                    </p>
                    <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                      Please enable camera permissions in your browser settings to use facial verification.
                    </p>
                    <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                      <strong>Instructions:</strong> Click the camera icon or lock icon in your browser address bar, find "Camera" in permissions, and select "Allow".
                    </p>
                  </div>
                )}

                {/* Open Camera Button */}
                <button
                  onClick={openCamera}
                  disabled={isLoading}
                  className={`w-full font-bold py-3 px-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isLoading
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                      : permissionStatus === 'denied'
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 hover:scale-105 text-white'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Initializing Camera...
                    </>
                  ) : permissionStatus === 'denied' ? (
                    <>
                      🚫 Camera Blocked
                    </>
                  ) : (
                    <>
                      📷 Open Camera
                    </>
                  )}
                </button>

                <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
                  Ensure you're in a well-lit area with your face clearly visible
                </p>

                {permissionStatus === 'denied' && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={resetCamera}
                      className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg transition-all mb-4"
                    >
                      🔄 Reset & Retry
                    </button>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      Still not working? Try these steps:
                    </p>
                    <ol className="text-xs text-gray-600 dark:text-gray-400 list-decimal list-inside text-left max-w-sm mx-auto space-y-1">
                      <li>Refresh your browser page (F5 or Ctrl+R)</li>
                      <li>Check browser permissions in Settings</li>
                      <li>Try a different browser</li>
                      <li>Ensure your device has a working camera</li>
                      <li>Check if camera is used by another app</li>
                    </ol>
                  </div>
                )}
              </>
            ) : null}
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
