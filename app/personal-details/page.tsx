"use client";
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getAllStates, getLGAsByState, getUserGeolocation, findNearestState, formatLocationString } from '@/lib/nigeriaLocations'

export default function PersonalDetailsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Form fields
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState('')
  const [lga, setLga] = useState('')
  const [street, setStreet] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [gender, setGender] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [address, setAddress] = useState('')
  const [socialMedia, setSocialMedia] = useState<{ platform: string; handle: string }[]>([])
  const [socialInputs, setSocialInputs] = useState({ platform: '', handle: '' })
  const [bio, setBio] = useState('')
  const [workExperience, setWorkExperience] = useState('')

  // Dropdowns
  const [states, setStates] = useState<string[]>([])
  const [lgas, setLgas] = useState<string[]>([])
  const [useGeolocation, setUseGeolocation] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    setIsMounted(true)
    const user = localStorage.getItem('naijaAmeboCurrentUser')
    if (user) {
      const userData = JSON.parse(user)
      setCurrentUser(userData)
      setDisplayName(userData.firstName || '')
      setUsername(userData.username || '')
      setEmail(userData.email || '')
      setPhotoPreview(userData.facialPhoto || null)

      // Load states
      const allStates = getAllStates()
      setStates(allStates)

      // Try to get geolocation
      tryGeolocation()
    }
  }, [])

  // Update LGAs when state changes
  useEffect(() => {
    if (state) {
      const stateLgas = getLGAsByState(state)
      setLgas(stateLgas)
      setLga('') // Reset LGA selection
      setStreet('')
    }
  }, [state])

  const tryGeolocation = async () => {
    try {
      const { lat, lng } = await getUserGeolocation()
      const nearestState = findNearestState(lat, lng)
      if (nearestState) {
        setState(nearestState)
        setUseGeolocation(true)
        toast.info(`Location detected: ${nearestState}`, {
          position: 'bottom-right',
          autoClose: 3000,
        })
      }
    } catch (error) {
      console.log('Geolocation not available or denied')
    }
  }

  const addSocialMedia = () => {
    if (!socialInputs.platform || !socialInputs.handle) {
      toast.error('Please fill in both platform and handle', {
        position: 'bottom-right',
      })
      return
    }

    if (socialMedia.some(s => s.platform === socialInputs.platform)) {
      toast.error('This platform is already added', {
        position: 'bottom-right',
      })
      return
    }

    setSocialMedia([...socialMedia, socialInputs])
    setSocialInputs({ platform: '', handle: '' })
    toast.success('Social media link added', {
      position: 'bottom-right',
      autoClose: 2000,
    })
  }

  const removeSocialMedia = (index: number) => {
    setSocialMedia(socialMedia.filter((_, i) => i !== index))
  }

  const validateForm = (): boolean => {
    if (!displayName.trim()) {
      toast.error('Display Name is required', { position: 'bottom-right' })
      return false
    }
    if (!username.trim()) {
      toast.error('Username is required', { position: 'bottom-right' })
      return false
    }
    if (!state) {
      toast.error('State is required', { position: 'bottom-right' })
      return false
    }
    if (!lga) {
      toast.error('Local Government Area is required', { position: 'bottom-right' })
      return false
    }
    if (!phoneNumber.trim()) {
      toast.error('WhatsApp Phone Number is required', { position: 'bottom-right' })
      return false
    }
    if (!dateOfBirth) {
      toast.error('Date of Birth is required (18 and above)', { position: 'bottom-right' })
      return false
    }
    if (!address.trim()) {
      toast.error('Contact Address is required', { position: 'bottom-right' })
      return false
    }

    // Validate age (18+)
    const dob = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    if (age < 18) {
      toast.error('You must be 18 years or older', { position: 'bottom-right' })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const locationString = formatLocationString(state, lga, street)

      // Get all users
      const usersData = localStorage.getItem('naijaAmeboUsers')
      const users = usersData ? JSON.parse(usersData) : []

      // Update current user with personal details
      const updatedUsers = users.map((u: any) =>
        u.id === currentUser.id
          ? {
              ...u,
              displayName,
              username,
              location: locationString,
              phoneNumber,
              gender: gender || null,
              dateOfBirth,
              address,
              socialMedia,
              bio: bio || null,
              workExperience: workExperience || null,
              personalDetailsCompletedAt: new Date().toISOString(),
              accountStatus: 'pending_verification', // Waiting for admin approval
            }
          : u
      )

      // Save updated users
      localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))

      // Update current user in localStorage
      const updatedUser = {
        ...currentUser,
        displayName,
        username,
        location: locationString,
        phoneNumber,
        gender: gender || null,
        dateOfBirth,
        address,
        socialMedia,
        bio: bio || null,
        workExperience: workExperience || null,
        personalDetailsCompletedAt: new Date().toISOString(),
        accountStatus: 'pending_verification',
      }
      localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(updatedUser))
      setCurrentUser(updatedUser)

      toast.success('Personal details saved successfully!', {
        position: 'bottom-right',
        autoClose: 3000,
      })

      // Redirect to pending verification page
      setTimeout(() => {
        router.push('/verification-pending')
      }, 2000)
    } catch (error) {
      console.error('Error saving personal details:', error)
      toast.error('Failed to save personal details. Please try again.', {
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
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please complete facial verification first</p>
          <button
            onClick={() => router.push('/facial-verification')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Go to Facial Verification
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <ToastContainer />

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            Amebo Connect
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Personal Details Page</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Form Header */}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Complete Your Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Fields marked with an asterisk (<span className="text-red-500">*</span>) are required
          </p>

          {/* Profile Photo Section */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <img
                src={photoPreview || 'https://via.placeholder.com/200'}
                alt="Profile"
                className="w-40 h-40 rounded-full border-4 border-blue-500 object-cover"
              />
              <label
                htmlFor="photo-upload"
                className="absolute top-0 right-0 bg-blue-500 bg-opacity-60 hover:bg-opacity-100 backdrop-blur-md transition rounded-full text-white p-3 cursor-pointer"
              >
                ✏️
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      setPhotoPreview(event.target?.result as string)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Change picture</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Your display name"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="@username"
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-400 bg-gray-100 cursor-not-allowed focus:ring-2 focus:ring-blue-500 outline-none"
                title="You can't change your email here"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed after registration
              </p>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LGA <span className="text-red-500">*</span>
                </label>
                <select
                  value={lga}
                  onChange={(e) => setLga(e.target.value)}
                  disabled={!state}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select LGA</option>
                  {lgas.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Street (Optional)
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Street/Area name"
                />
              </div>
            </div>

            {/* WhatsApp Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                WhatsApp Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., 08143301814"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="male"
                    checked={gender === 'male'}
                    onChange={(e) => setGender(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Male</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="female"
                    checked={gender === 'female'}
                    onChange={(e) => setGender(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Female</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="other"
                    checked={gender === 'other'}
                    onChange={(e) => setGender(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Other</span>
                </label>
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth (18 and above) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Contact Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Your residential address"
                required
              />
            </div>

            {/* Social Media */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Social Media Links
              </label>
              <div className="space-y-2 mb-4">
                {socialMedia.map((social, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-blue-50 dark:bg-gray-700 p-3 rounded-lg"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {social.platform}: @{social.handle}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSocialMedia(index)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Platform (Twitter, Facebook, etc.)"
                  value={socialInputs.platform}
                  onChange={(e) =>
                    setSocialInputs({ ...socialInputs, platform: e.target.value })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Handle (@username)"
                  value={socialInputs.handle}
                  onChange={(e) =>
                    setSocialInputs({ ...socialInputs, handle: e.target.value })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={addSocialMedia}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-20"
                placeholder="Tell us about yourself..."
                spellCheck="false"
              />
            </div>

            {/* Work Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Work Experience
              </label>
              <textarea
                value={workExperience}
                onChange={(e) => setWorkExperience(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-20"
                placeholder="Your work experience..."
                spellCheck="false"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
              >
                {isLoading ? '⏳ Saving...' : '✓ Save & Continue'}
              </button>
            </div>
          </form>

          <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-6">
            You will receive approval from the admin before you can fully join the website
          </p>
        </div>
      </div>
    </div>
  )
}
