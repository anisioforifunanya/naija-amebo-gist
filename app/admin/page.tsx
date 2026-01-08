"use client";
import { useState, useEffect } from 'react'
import Link from 'next/link'
import LiveRecorder from '../../components/LiveRecorder'
import MarketplaceApprovalSection from '@/components/MarketplaceApprovalSection'
import VerificationApprovalSection from '@/components/VerificationApprovalSection'

interface AdminData {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  avatar?: string;
  role: 'admin';
  createdAt: string;
  isSuperAdmin?: boolean;
  permissions?: string[];
}

interface AdminRequestData {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  avatar?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface NewsItem {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submitterEmail?: string;
  hashtags: string[];
  socialCaption: string;
  image?: string; // base64 encoded image
  video?: string; // base64 encoded video or video URL
  liveVideo?: string; // base64 encoded live video recording
  liveAudio?: string; // base64 encoded live audio recording
  imageFile?: File;
  videoFile?: File;
}

interface UserData {
  id: string;
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  location: string;
  bio: string;
  interests: string[];
  avatar?: string;
  role: 'user';
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  isBanned?: boolean;
  banReason?: string;
  isRestricted?: boolean;
  restrictionReason?: string;
  restrictionExpires?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  message: string;
  timestamp: string;
  reactions: { [emoji: string]: string[] };
  isDeleted?: boolean;
}

export default function AdminDashboard() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState<AdminData | null>(null)
  const [loginStep, setLoginStep] = useState<'email' | 'password'>('email') // Multi-step login
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNews, setNewNews] = useState({
    title: '',
    description: '',
    category: 'breaking-news',
    hashtags: '',
    socialCaption: '',
    image: null as File | null,
    video: null as File | null,
    liveVideo: null as Blob | null,
    liveAudio: null as Blob | null
  })

  // New state for admin management
  const [allAdmins, setAllAdmins] = useState<AdminData[]>([])
  const [adminRequests, setAdminRequests] = useState<AdminRequestData[]>([])
  const [allUsers, setAllUsers] = useState<UserData[]>([])
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([])
  const [allNews, setAllNews] = useState<NewsItem[]>([])
  const [newsSearchTerm, setNewsSearchTerm] = useState('')
  const [newsCategoryFilter, setNewsCategoryFilter] = useState('')
  const [newsStatusFilter, setNewsStatusFilter] = useState('')
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null)
  const [editingNewsForm, setEditingNewsForm] = useState<Partial<NewsItem>>({})
  const [showAddNewsForm, setShowAddNewsForm] = useState(false)
  const [newNewsForm, setNewNewsForm] = useState({
    title: '',
    description: '',
    category: 'breaking-news',
    status: 'approved' as const,
    hashtags: '',
    image: '',
  })
  const [activeTab, setActiveTab] = useState<'news' | 'news-management' | 'admins' | 'users' | 'all-users-admins' | 'verification' | 'marketplace' | 'moderation' | 'settings'>('news')
  const [isAnonymousMode, setIsAnonymousMode] = useState(false)
  const [showAddAdminForm, setShowAddAdminForm] = useState(false)
  const [adminCreationMode, setAdminCreationMode] = useState<'create' | 'promote'>('create')
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    avatar: '',
    permissions: ['moderate_users', 'manage_content'] as string[]
  })
  const [isMounted, setIsMounted] = useState(false)

  const loadAllData = async () => {
    try {
      // Load admins from Firebase Firestore
      const { db } = await import('@/lib/firebase')
      const { collection, getDocs } = await import('firebase/firestore')
      const adminsSnapshot = await getDocs(collection(db, 'admins'))
      const admins = adminsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminData[]
      console.log('[AdminDashboard] All admins from Firebase:', admins)
      setAllAdmins(admins)
    } catch (error) {
      console.error('[AdminDashboard] Error loading admins from Firebase:', error)
      // Fallback to localStorage
      const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
      setAllAdmins(admins)
    }

    // Load admin requests - FORCE RELOAD
    const requests = JSON.parse(localStorage.getItem('adminRequests') || '[]')
    console.log('[AdminDashboard] FORCE LOADED admin requests:', requests)
    console.log('[AdminDashboard] Number of pending requests:', requests.filter((r: any) => r.status === 'pending').length)
    setAdminRequests(requests)

    // Load users from Firebase Firestore
    try {
      const { db } = await import('@/lib/firebase')
      const { collection, getDocs } = await import('firebase/firestore')
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]
      console.log('[AdminDashboard] All users from Firebase:', users)
      setAllUsers(users)
    } catch (error) {
      console.error('[AdminDashboard] Error loading users from Firebase:', error)
      // Fallback to localStorage
      const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
      setAllUsers(users)
    }

    // Load messages
    const messages = JSON.parse(localStorage.getItem('naijaAmeboChatMessages') || '[]')
    setAllMessages(messages)
  }

  const forceRefreshRequests = () => {
    console.log('[AdminDashboard] FORCE REFRESH triggered by user')
    resetAdminSession()
  }

  const resetAdminSession = () => {
    console.log('[AdminDashboard] HARD RESET: Clearing and reloading admin session')
    
    // Load fresh admin data from admins.json (localStorage)
    const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
    const sessionAdmin = localStorage.getItem('naijaAmeboCurrentAdmin')
    
    if (sessionAdmin) {
      try {
        const admin = JSON.parse(sessionAdmin)
        console.log('[AdminDashboard] Current session admin ID:', admin.id)
        console.log('[AdminDashboard] Current session admin email:', admin.email)
        
        // Find matching admin in the fresh admin list
        const freshAdmin = admins.find((a: any) => a.id === admin.id || a.email === admin.email)
        
        if (freshAdmin) {
          console.log('[AdminDashboard] Found fresh admin data:', freshAdmin)
          // Create updated admin with all fresh properties
          let updatedAdmin = {
            ...admin,
            ...freshAdmin, // Override with fresh data
            isSuperAdmin: freshAdmin.isSuperAdmin === true
          }
          
          // FORCE SET isSuperAdmin to true if this is ifunanya.anisiofor@gmail.com
          if (admin.email === 'ifunanya.anisiofor@gmail.com') {
            console.log('[AdminDashboard] DETECTED IFUNANYA ACCOUNT IN RESET - FORCE SETTING isSuperAdmin to TRUE')
            updatedAdmin = { ...updatedAdmin, isSuperAdmin: true }
          }
          
          console.log('[AdminDashboard] Updated admin with isSuperAdmin:', updatedAdmin.isSuperAdmin)
          setCurrentAdmin(updatedAdmin)
          localStorage.setItem('naijaAmeboCurrentAdmin', JSON.stringify(updatedAdmin))
          loadAllData()
          
          alert(`✓ Session Reset Complete!\n\nisSuperAdmin: ${updatedAdmin.isSuperAdmin ? '✓ TRUE' : '✗ FALSE'}\n\nRefresh page if needed.`)
        } else {
          console.error('[AdminDashboard] Could not find matching admin in database')
          alert('⚠ Error: Admin account not found in database. Please log in again.')
        }
      } catch (e) {
        console.error('[AdminDashboard] Error in resetAdminSession:', e)
        alert('⚠ Error resetting session. Check console.')
      }
    }
  }

  useEffect(() => {
    // Load news from localStorage
    const savedNews = localStorage.getItem('naijaAmeboNews')
    if (savedNews) {
      setNews(JSON.parse(savedNews))
      setAllNews(JSON.parse(savedNews))
    }

    // Check if admin is logged in - must have valid admin session
    const adminSession = localStorage.getItem('naijaAmeboCurrentAdmin')
    if (adminSession) {
      try {
        const admin = JSON.parse(adminSession)
        console.log('[Initial Load] Raw admin from session:', { email: admin.email, isSuperAdmin: admin.isSuperAdmin, id: admin.id })
        
        // Verify admin has required fields
        if (admin.id && admin.email && admin.role === 'admin') {
          // FORCE SET isSuperAdmin to true if this is ifunanya.anisiofor@gmail.com
          let adminToUse = admin
          if (admin.email === 'ifunanya.anisiofor@gmail.com') {
            console.log('[Initial Load] DETECTED IFUNANYA ACCOUNT - FORCE SETTING isSuperAdmin to TRUE')
            adminToUse = { ...admin, isSuperAdmin: true }
            localStorage.setItem('naijaAmeboCurrentAdmin', JSON.stringify(adminToUse))
          }
          
          console.log('[Initial Load] Final admin session - isSuperAdmin:', adminToUse.isSuperAdmin)
          setCurrentAdmin(adminToUse)
          setIsLoggedIn(true)
          loadAllData()
        } else {
          // Invalid session - clear it
          console.log('[Initial Load] Invalid admin session - clearing')
          localStorage.removeItem('naijaAmeboCurrentAdmin')
          setIsLoggedIn(false)
        }
      } catch (e) {
        // Session corrupted - clear it
        console.error('[Initial Load] Session parsing error:', e)
        localStorage.removeItem('naijaAmeboCurrentAdmin')
        setIsLoggedIn(false)
      }
    } else {
      console.log('[Initial Load] No admin session found')
      setIsLoggedIn(false)
    }

    // Load anonymous mode setting
    const anonymousMode = localStorage.getItem('naijaAmeboAnonymousMode')
    setIsAnonymousMode(anonymousMode === 'true')
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Refresh admin requests when switching to admins tab
  useEffect(() => {
    if (activeTab === 'admins' && isLoggedIn) {
      // Load all data first
      loadAllData()
      
      // Then ensure currentAdmin has the latest isSuperAdmin status from database
      const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
      const sessionAdmin = localStorage.getItem('naijaAmeboCurrentAdmin')
      
      if (sessionAdmin && currentAdmin?.email) {
        try {
          const admin = JSON.parse(sessionAdmin)
          const freshAdmin = admins.find((a: any) => a.email === admin.email)
          
          if (freshAdmin && freshAdmin.isSuperAdmin && !admin.isSuperAdmin) {
            console.log('[AdminDashboard Tab Switch] AUTO-UPDATING isSuperAdmin to TRUE')
            const updatedAdmin = { ...admin, isSuperAdmin: freshAdmin.isSuperAdmin }
            setCurrentAdmin(updatedAdmin)
            localStorage.setItem('naijaAmeboCurrentAdmin', JSON.stringify(updatedAdmin))
          }
        } catch (e) {
          console.error('[AdminDashboard Tab Switch] Error:', e)
        }
      }
    }
  }, [activeTab, isLoggedIn, currentAdmin?.email])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Step 1: Email/Username validation
    if (loginStep === 'email') {
      if (!loginForm.email) {
        alert('Please enter your email or username')
        return
      }
      // Move to password step
      setLoginStep('password')
      return
    }

    // Step 2: Password validation and login
    if (loginStep === 'password') {
      if (!loginForm.password) {
        alert('Please enter your password')
        return
      }

      try {
        // Try Firebase authentication first
        const { loginUserWithEmail } = await import('@/lib/firebaseUtils')
        const authUser = await loginUserWithEmail(loginForm.email, loginForm.password)
        
        // Get admin data from Firestore
        const { db } = await import('@/lib/firebase')
        const { doc, getDoc } = await import('firebase/firestore')
        const adminDocRef = doc(db, 'admins', authUser.uid)
        const adminDocSnap = await getDoc(adminDocRef)
        
        if (adminDocSnap.exists()) {
          const adminData = adminDocSnap.data() as any
          const adminWithSuperAdminFlag: AdminData = {
            id: authUser.uid,
            email: authUser.email || '',
            password: '', // Firebase handles password, not stored in Firestore
            firstName: adminData?.firstName || '',
            lastName: adminData?.lastName || '',
            phone: adminData?.phone || '',
            bio: adminData?.bio || '',
            avatar: adminData?.avatar,
            role: 'admin',
            createdAt: adminData?.createdAt || new Date().toISOString(),
            isSuperAdmin: adminData?.isSuperAdmin === true,
            permissions: adminData?.permissions || []
          }
          
          console.log('[Login] Admin logged in with isSuperAdmin:', adminWithSuperAdminFlag.isSuperAdmin)
          setCurrentAdmin(adminWithSuperAdminFlag)
          setIsLoggedIn(true)
          setLoginStep('email') // Reset for next session
          localStorage.setItem('naijaAmeboCurrentAdmin', JSON.stringify(adminWithSuperAdminFlag))
          await loadAllData()
        } else {
          alert('Admin profile not found. Please contact support.')
          setLoginForm({ ...loginForm, password: '' })
        }
      } catch (error: any) {
        console.error('Login error:', error)
        alert('Invalid email or password. Please try again.')
        // Clear the password field for security
        setLoginForm({ ...loginForm, password: '' })
      }
    }
  }

  const handleBackToEmail = () => {
    setLoginStep('email')
    setLoginForm({ ...loginForm, password: '' })
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentAdmin(null)
    localStorage.removeItem('naijaAmeboCurrentAdmin')
  }

  // Cleanup unverified users
  const cleanupUnverifiedUsers = () => {
    if (!confirm('⚠️ This will delete all users who haven\'t completed facial verification. This cannot be undone. Continue?')) {
      return
    }

    try {
      const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
      const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
      
      // Get all admin IDs
      const adminIds = new Set(admins.map((a: any) => a.id))

      // Filter users: keep only those with facialPhoto OR those who are admins
      const verifiedUsers = users.filter((u: any) => 
        u.facialPhoto || adminIds.has(u.id)
      )

      const deletedCount = users.length - verifiedUsers.length

      // Save cleaned up users
      localStorage.setItem('naijaAmeboUsers', JSON.stringify(verifiedUsers))

      alert(`✅ Cleaned up successfully!\n\nDeleted: ${deletedCount} unverified users\nRemaining: ${verifiedUsers.length} users`)
      
      // Reload data
      loadAllData()
    } catch (error) {
      console.error('Error during cleanup:', error)
      alert('❌ Error during cleanup. Please try again.')
    }
  }

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Helper function to convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  const handleAddNews = async () => {
    let imageBase64 = '';
    let videoBase64 = '';
    let liveVideoBase64 = '';
    let liveAudioBase64 = '';

    // Convert image to base64 if exists
    if (newNews.image) {
      imageBase64 = await fileToBase64(newNews.image);
    }

    // Convert video to base64 if exists
    if (newNews.video) {
      videoBase64 = await fileToBase64(newNews.video);
    }

    // Convert live video to base64 if exists
    if (newNews.liveVideo) {
      liveVideoBase64 = await blobToBase64(newNews.liveVideo);
    }

    // Convert live audio to base64 if exists
    if (newNews.liveAudio) {
      liveAudioBase64 = await blobToBase64(newNews.liveAudio);
    }

    const newsItem: NewsItem = {
      id: Date.now().toString(),
      title: newNews.title,
      description: newNews.description,
      category: newNews.category,
      date: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }),
      status: 'approved', // Admin-added news is auto-approved
      submittedBy: 'admin',
      hashtags: newNews.hashtags.split(',').map(tag => tag.trim()),
      socialCaption: newNews.socialCaption,
      image: imageBase64 || undefined,
      video: videoBase64 || undefined,
      liveVideo: liveVideoBase64 || undefined,
      liveAudio: liveAudioBase64 || undefined
    }

    const updatedNews = [...news, newsItem]
    setNews(updatedNews)
    localStorage.setItem('naijaAmeboNews', JSON.stringify(updatedNews))

    // Reset form
    setNewNews({
      title: '',
      description: '',
      category: 'breaking-news',
      hashtags: '',
      socialCaption: '',
      image: null,
      video: null,
      liveVideo: null,
      liveAudio: null
    })
    setShowAddForm(false)
  }

  const handleStatusChange = (id: string, status: 'approved' | 'rejected') => {
    const updatedNews = news.map(item =>
      item.id === id ? { ...item, status } : item
    )
    setNews(updatedNews)
    localStorage.setItem('naijaAmeboNews', JSON.stringify(updatedNews))
  }

  const handleDelete = (id: string) => {
    const updatedNews = news.filter(item => item.id !== id)
    setNews(updatedNews)
    localStorage.setItem('naijaAmeboNews', JSON.stringify(updatedNews))
  }

  // Admin Management Functions
  const handleAddAdmin = () => {
    if (!currentAdmin?.isSuperAdmin) {
      alert('Only super admins can add new administrators')
      return
    }

    if (adminCreationMode === 'promote') {
      // Promote existing user to admin
      const user = allUsers.find(u => u.email === newAdminForm.email)
      if (!user) {
        alert('User not found. Please check the email address.')
        return
      }

      // Check if already an admin
      if (allAdmins.some(a => a.email === newAdminForm.email)) {
        alert('This user is already an administrator')
        return
      }

      const newAdmin: AdminData = {
        id: user.id,
        email: user.email,
        password: user.password,
        firstName: newAdminForm.firstName || user.firstName,
        lastName: newAdminForm.lastName || user.lastName,
        phone: user.phone,
        bio: user.bio,
        role: 'admin',
        createdAt: new Date().toISOString(),
        isSuperAdmin: false,
        permissions: newAdminForm.permissions
      }

      const updatedAdmins = [...allAdmins, newAdmin]
      setAllAdmins(updatedAdmins)
      localStorage.setItem('naijaAmeboAdmins', JSON.stringify(updatedAdmins))

      setNewAdminForm({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        avatar: '',
        permissions: ['moderate_users', 'manage_content']
      })
      setShowAddAdminForm(false)
      alert(`${user.firstName} ${user.lastName} has been promoted to administrator!`)
    } else {
      // Create new admin account directly
      // Validate form
      if (!newAdminForm.email || !newAdminForm.firstName || !newAdminForm.lastName) {
        alert('Please fill in all required fields')
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newAdminForm.email)) {
        alert('Please enter a valid email address')
        return
      }

      // Check if email already exists as admin
      if (allAdmins.some(a => a.email === newAdminForm.email)) {
        alert('This email is already registered as an administrator')
        return
      }

      // Generate secure temporary password
      const tempPassword = 'Admin' + Math.random().toString(36).slice(-8).toUpperCase() + Math.floor(Math.random() * 100)

      const newAdmin: AdminData = {
        id: Date.now().toString(),
        email: newAdminForm.email,
        password: tempPassword,
        firstName: newAdminForm.firstName,
        lastName: newAdminForm.lastName,
        phone: newAdminForm.phone || '',
        avatar: newAdminForm.avatar || '',
        bio: '',
        role: 'admin',
        createdAt: new Date().toISOString(),
        isSuperAdmin: false,
        permissions: newAdminForm.permissions
      }

      const updatedAdmins = [...allAdmins, newAdmin]
      setAllAdmins(updatedAdmins)
      localStorage.setItem('naijaAmeboAdmins', JSON.stringify(updatedAdmins))

      setNewAdminForm({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        avatar: '',
        permissions: ['moderate_users', 'manage_content']
      })
      setShowAddAdminForm(false)
      
      // Show temporary password to super admin
      alert(`Administrator created successfully!\n\nEmail: ${newAdmin.email}\nTemporary Password: ${tempPassword}\n\n⚠️ IMPORTANT: Share this password securely with the new admin. They should change it immediately after first login.`)
    }
  }

  // Handle admin request approval
  const approveAdminRequest = (request: AdminRequestData) => {
    if (!currentAdmin?.isSuperAdmin && currentAdmin?.email !== 'ifunanya.anisiofor@gmail.com') {
      alert('Only super admins can approve admin requests')
      return
    }

    // Create admin account from request
    const newAdmin: AdminData = {
      id: Date.now().toString(),
      email: request.email,
      password: request.password,
      firstName: request.firstName,
      lastName: request.lastName,
      phone: request.phone,
      bio: request.bio,
      avatar: request.avatar,
      role: 'admin',
      createdAt: new Date().toISOString(),
      isSuperAdmin: false,
      permissions: ['moderate_content', 'manage_users'] // Default permissions for approved admins
    }

    // Add to admins
    const updatedAdmins = [...allAdmins, newAdmin]
    setAllAdmins(updatedAdmins)
    localStorage.setItem('naijaAmeboAdmins', JSON.stringify(updatedAdmins))

    // Update request status
    const updatedRequest: AdminRequestData = {
      ...request,
      status: 'approved',
      reviewedBy: currentAdmin.email,
      reviewedAt: new Date().toISOString()
    }

    const updatedRequests = adminRequests.map(r => r.id === request.id ? updatedRequest : r)
    setAdminRequests(updatedRequests)
    localStorage.setItem('adminRequests', JSON.stringify(updatedRequests))

    alert(`Admin request from ${request.firstName} ${request.lastName} has been approved!`)
  }

  // Handle admin request rejection
  const rejectAdminRequest = (request: AdminRequestData) => {
    if (!currentAdmin?.isSuperAdmin && currentAdmin?.email !== 'ifunanya.anisiofor@gmail.com') {
      alert('Only super admins can reject admin requests')
      return
    }

    // Update request status
    const updatedRequest: AdminRequestData = {
      ...request,
      status: 'rejected',
      reviewedBy: currentAdmin.email,
      reviewedAt: new Date().toISOString()
    }

    const updatedRequests = adminRequests.map(r => r.id === request.id ? updatedRequest : r)
    setAdminRequests(updatedRequests)
    localStorage.setItem('adminRequests', JSON.stringify(updatedRequests))

    alert(`Admin request from ${request.firstName} ${request.lastName} has been rejected.`)
  }

  const handleRemoveAdmin = (adminId: string) => {
    if (!currentAdmin?.isSuperAdmin && currentAdmin?.email !== 'ifunanya.anisiofor@gmail.com') {
      alert('Only super admins can remove administrators')
      return
    }

    if (adminId === currentAdmin.id) {
      alert('You cannot remove yourself')
      return
    }

    const updatedAdmins = allAdmins.filter(a => a.id !== adminId)
    setAllAdmins(updatedAdmins)
    localStorage.setItem('naijaAmeboAdmins', JSON.stringify(updatedAdmins))
    alert('Administrator removed successfully!')
  }

  // User Moderation Functions
  const handleBanUser = (userId: string, reason: string) => {
    const updatedUsers = allUsers.map(user =>
      user.id === userId
        ? { ...user, isBanned: true, banReason: reason }
        : user
    )
    setAllUsers(updatedUsers)
    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))
  }

  const handleUnbanUser = (userId: string) => {
    const updatedUsers = allUsers.map(user =>
      user.id === userId
        ? { ...user, isBanned: false, banReason: undefined }
        : user
    )
    setAllUsers(updatedUsers)
    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))
  }

  const handleRestrictUser = (userId: string, reason: string, duration: number) => {
    const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
    const updatedUsers = allUsers.map(user =>
      user.id === userId
        ? { ...user, isRestricted: true, restrictionReason: reason, restrictionExpires: expiresAt }
        : user
    )
    setAllUsers(updatedUsers)
    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))
  }

  const handleUnrestrictUser = (userId: string) => {
    const updatedUsers = allUsers.map(user =>
      user.id === userId
        ? { ...user, isRestricted: false, restrictionReason: undefined, restrictionExpires: undefined }
        : user
    )
    setAllUsers(updatedUsers)
    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))
  }

  const handleDeleteUser = (userId: string, userName: string) => {
    if (!window.confirm(`⚠️ Are you sure you want to DELETE user "${userName}"? This action cannot be undone!`)) {
      return
    }

    try {
      // Remove from users
      const updatedUsers = allUsers.filter(user => user.id !== userId)
      setAllUsers(updatedUsers)
      localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))

      alert(`✅ User "${userName}" has been permanently deleted from the system.`)
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('❌ Error deleting user. Please try again.')
    }
  }

  // Content Moderation Functions
  const handleDeleteMessage = (messageId: string) => {
    const updatedMessages = allMessages.map(msg =>
      msg.id === messageId ? { ...msg, isDeleted: true } : msg
    )
    setAllMessages(updatedMessages)
    localStorage.setItem('naijaAmeboChatMessages', JSON.stringify(updatedMessages))
  }

  // News Control Center Functions
  const handleAddNewsArticle = () => {
    if (!newNewsForm.title.trim() || !newNewsForm.description.trim()) {
      alert('❌ Please fill in title and description')
      return
    }

    const currentAdmin = JSON.parse(localStorage.getItem('naijaAmeboCurrentAdmin') || '{}')
    
    const newArticle: NewsItem = {
      id: Date.now().toString(),
      title: newNewsForm.title,
      description: newNewsForm.description,
      category: newNewsForm.category,
      status: newNewsForm.status,
      date: new Date().toLocaleString(),
      hashtags: newNewsForm.hashtags ? newNewsForm.hashtags.split(',').map(h => h.trim()) : [],
      image: newNewsForm.image || undefined,
      submittedBy: currentAdmin.firstName ? `${currentAdmin.firstName} ${currentAdmin.lastName}` : 'Admin',
      submitterEmail: currentAdmin.email,
      socialCaption: '',
    }

    const updatedNews = [...allNews, newArticle]
    setAllNews(updatedNews)
    localStorage.setItem('naijaAmeboNews', JSON.stringify(updatedNews))

    setNewNewsForm({
      title: '',
      description: '',
      category: 'breaking-news',
      status: 'approved',
      hashtags: '',
      image: '',
    })
    setShowAddNewsForm(false)
    alert('✅ News article added successfully!')
  }

  const handleEditNewsArticle = (newsId: string) => {
    const newsItem = allNews.find(n => n.id === newsId)
    if (newsItem) {
      setEditingNewsId(newsId)
      setEditingNewsForm(newsItem)
    }
  }

  const handleSaveNewsArticleEdit = () => {
    if (!editingNewsForm.title?.trim() || !editingNewsForm.description?.trim()) {
      alert('❌ Please fill in title and description')
      return
    }

    const updatedNews = allNews.map(n =>
      n.id === editingNewsId ? { ...n, ...editingNewsForm } : n
    )
    setAllNews(updatedNews)
    localStorage.setItem('naijaAmeboNews', JSON.stringify(updatedNews))
    setEditingNewsId(null)
    setEditingNewsForm({})
    alert('✅ News article updated successfully!')
  }

  const handleDeleteNewsArticle = (newsId: string, newsTitle: string) => {
    if (!window.confirm(`⚠️ Are you sure you want to DELETE the article "${newsTitle}"? This action cannot be undone!`)) {
      return
    }

    const updatedNews = allNews.filter(n => n.id !== newsId)
    setAllNews(updatedNews)
    localStorage.setItem('naijaAmeboNews', JSON.stringify(updatedNews))
    alert('✅ News article deleted successfully!')
  }

  const handleApproveNewsArticle = (newsId: string) => {
    const updatedNews = allNews.map(n =>
      n.id === newsId ? { ...n, status: 'approved' as const } : n
    )
    setAllNews(updatedNews)
    localStorage.setItem('naijaAmeboNews', JSON.stringify(updatedNews))
    alert('✅ Article approved!')
  }

  const handleRejectNewsArticle = (newsId: string) => {
    const updatedNews = allNews.map(n =>
      n.id === newsId ? { ...n, status: 'rejected' as const } : n
    )
    setAllNews(updatedNews)
    localStorage.setItem('naijaAmeboNews', JSON.stringify(updatedNews))
    alert('✅ Article rejected!')
  }

  const handlePendingNewsArticle = (newsId: string) => {
    const updatedNews = allNews.map(n =>
      n.id === newsId ? { ...n, status: 'pending' as const } : n
    )
    setAllNews(updatedNews)
    localStorage.setItem('naijaAmeboNews', JSON.stringify(updatedNews))
    alert('✅ Article set to pending!')
  }

  const handleToggleAnonymousMode = () => {
    const newMode = !isAnonymousMode
    setIsAnonymousMode(newMode)
    localStorage.setItem('naijaAmeboAnonymousMode', newMode.toString())
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Sign in to manage the platform
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              {/* Step 1: Email/Username */}
              {loginStep === 'email' && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email or Username
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoFocus
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter your admin email or username"
                  />
                </div>
              )}

              {/* Step 2: Password */}
              {loginStep === 'password' && (
                <>
                  <div>
                    <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email: <span className="font-semibold text-purple-600">{loginForm.email}</span>
                    </p>
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      autoFocus
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter your password"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              {loginStep === 'password' && (
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="flex-1 flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {loginStep === 'email' ? 'Next' : 'Sign in as Admin'}
              </button>
            </div>

            <div className="text-center space-y-2">
              <div>
                <Link
                  href="/admin-register"
                  className="text-sm text-purple-600 hover:text-purple-500"
                >
                  Don't have an admin account? Register
                </Link>
              </div>
              <div>
                <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-500">
                  ← Back to Home
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin Dashboard
              </h1>
              <p className="text-purple-100 mt-1 flex items-center">
                Welcome back, 
                <span className="font-semibold ml-2">
                  {isAnonymousMode ? '🕵️ Anonymous Admin' : `${currentAdmin?.firstName} ${currentAdmin?.lastName}`}
                </span>
                {currentAdmin?.isSuperAdmin && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-purple-900 rounded-full text-xs font-bold flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Super Admin
                  </span>
                )}
              </p>
              <p className="text-purple-200 text-sm mt-1">{currentAdmin?.email}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleAnonymousMode}
                className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-lg transition-all duration-200 ${
                  isAnonymousMode
                    ? 'bg-white text-purple-600 hover:bg-gray-100'
                    : 'bg-purple-800 text-white hover:bg-purple-900'
                }`}
              >
                <span className="flex items-center">
                  {isAnonymousMode ? '🕵️ Anonymous Mode ON' : '👤 Anonymous Mode OFF'}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 font-semibold shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total News</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{news.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {news.filter(n => n.status === 'pending').length} pending
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Administrators</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{allAdmins.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {allAdmins.filter(a => a.isSuperAdmin).length} super admins
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{allUsers.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {allUsers.filter(u => u.isBanned).length} banned
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{allMessages.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {allMessages.filter(m => m.isDeleted).length} deleted
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                <svg className="w-8 h-8 text-orange-600 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 py-4">
            <nav className="flex space-x-4 overflow-x-auto flex-1">
              {[
                { id: 'news', label: 'News Management', icon: '📰' },
                { id: 'news-management', label: 'News Control Center', icon: '🎛️' },
                { id: 'admins', label: 'Admin Management', icon: '👑' },
                { id: 'users', label: 'User Moderation', icon: '👥' },
                { id: 'all-users-admins', label: 'View All Users & Admins', icon: '📋' },
                { id: 'verification', label: 'Face Verification', icon: '🔐' },
                { id: 'marketplace', label: 'Product Approvals', icon: '🛍️' },
                { id: 'moderation', label: 'Content Moderation', icon: '🛡️' },
                { id: 'settings', label: 'Settings', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-4 border-b-2 font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                </button>
              ))}
            </nav>

            {/* Quick Links */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Link
                href="/admin/community-moderation"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 font-semibold transition-all shadow-md hover:shadow-lg"
              >
                <span className="text-lg">🛡️</span>
                <span>Community</span>
              </Link>
              <Link
                href="/private-messages"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 font-semibold transition-all shadow-md hover:shadow-lg"
              >
                <span className="text-lg">💬</span>
                <span>Messages</span>
              </Link>
              <Link
                href="/setup-demo"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 font-semibold transition-all shadow-md hover:shadow-lg"
              >
                <span className="text-lg">🚀</span>
                <span>Setup Demo</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'news' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">News Management</h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  {showAddForm ? 'Cancel' : 'Add News'}
                </button>
              </div>

              {showAddForm && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-md font-medium mb-4">Add New News</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="text"
                      placeholder="News Title"
                      value={newNews.title}
                      onChange={(e) => setNewNews({...newNews, title: e.target.value})}
                      className="border rounded px-3 py-2"
                    />
                    <textarea
                      placeholder="News Description"
                      value={newNews.description}
                      onChange={(e) => setNewNews({...newNews, description: e.target.value})}
                      className="border rounded px-3 py-2"
                      rows={3}
                    />
                    <select
                      value={newNews.category}
                      onChange={(e) => setNewNews({...newNews, category: e.target.value})}
                      className="border rounded px-3 py-2"
                    >
                      <option value="breaking-news">Breaking News</option>
                      <option value="trending-stories">Trending Stories</option>
                      <option value="celebrity-news">Celebrity News</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="viral-content">Viral Content</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Hashtags (comma separated)"
                      value={newNews.hashtags}
                      onChange={(e) => setNewNews({...newNews, hashtags: e.target.value})}
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Social Media Caption"
                      value={newNews.socialCaption}
                      onChange={(e) => setNewNews({...newNews, socialCaption: e.target.value})}
                      className="border rounded px-3 py-2"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image (optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewNews({...newNews, image: e.target.files?.[0] || null})}
                        className="border rounded px-3 py-2 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upload Video (optional)</label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setNewNews({...newNews, video: e.target.files?.[0] || null})}
                        className="border rounded px-3 py-2 w-full"
                      />
                    </div>

                    <div className="mt-6">
                      <h4 className="text-md font-medium mb-4">🎥 Live Video Recording (Optional)</h4>
                      <LiveRecorder type="video" onRecorded={(file) => setNewNews({...newNews, liveVideo: file.blob})} maxDurationSec={300} />
                    </div>

                    <div className="mt-6">
                      <h4 className="text-md font-medium mb-4">🎤 Live Voice Recording (Optional)</h4>
                      <LiveRecorder type="audio" onRecorded={(file) => setNewNews({...newNews, liveAudio: file.blob})} maxDurationSec={600} />
                    </div>

                    <button
                      onClick={handleAddNews}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Add News
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {news.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        {item.image && (
                          <div className="mt-2">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="max-w-full h-48 object-cover rounded"
                            />
                          </div>
                        )}
                        {item.video && (
                          <div className="mt-2">
                            <video
                              controls
                              className="max-w-full h-48 rounded"
                            >
                              <source src={item.video} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}
                        {item.liveVideo && (
                          <div className="mt-2">
                            <p className="text-sm text-purple-600 mb-1">🎥 Live Video Recording:</p>
                            <video
                              controls
                              className="max-w-full h-48 rounded"
                            >
                              <source src={item.liveVideo} type="video/webm" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}
                        {item.liveAudio && (
                          <div className="mt-2">
                            <p className="text-sm text-purple-600 mb-1">🎤 Live Audio Recording:</p>
                            <audio
                              controls
                              className="w-full"
                            >
                              <source src={item.liveAudio} type="audio/webm" />
                              Your browser does not support the audio tag.
                            </audio>
                          </div>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{item.category}</span>
                          <span>{item.date}</span>
                          <span>By: {item.submittedBy}</span>
                          <span className={`px-2 py-1 rounded ${
                            item.status === 'approved' ? 'bg-green-100 text-green-800' :
                            item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(item.id, 'approved')}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(item.id, 'rejected')}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {news.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No news items yet. Add your first news!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Admin Management</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadAllData()}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                    title="Refresh to see latest admin requests"
                  >
                    🔄 Refresh
                  </button>
                  <button
                    onClick={forceRefreshRequests}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                    title="Force refresh all admin data including requests"
                  >
                    🔄 Force Refresh
                  </button>
                  <Link
                    href="/debug-admin-requests"
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm"
                    title="Debug: View admin requests data"
                  >
                    🐛 Debug
                  </Link>
                  {currentAdmin?.isSuperAdmin && (
                    <button
                      onClick={() => setShowAddAdminForm(!showAddAdminForm)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      {showAddAdminForm ? 'Cancel' : 'Add Admin'}
                    </button>
                  )}
                </div>
              </div>

              {/* Pending Admin Requests Section */}
              {(currentAdmin?.isSuperAdmin || currentAdmin?.email === 'ifunanya.anisiofor@gmail.com') ? (
                <div className="mb-8 p-4 border-2 border-green-300 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-200 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    ✓ Super Admin Confirmed - Pending Admin Requests ({adminRequests?.filter(r => r?.status === 'pending')?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {!adminRequests || adminRequests.filter(r => r?.status === 'pending').length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-400 text-center py-4">No pending admin requests at this time. {adminRequests?.length || 0} total in storage.</p>
                    ) : (
                      adminRequests.filter(r => r?.status === 'pending').map(request => (
                        <div key={request.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center justify-between border-l-4 border-green-500">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{request.firstName} {request.lastName}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{request.email}</p>
                            <p className="text-xs text-gray-500 mt-1">Phone: {request.phone}</p>
                            <p className="text-xs text-gray-500">Requested: {new Date(request.requestedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveAdminRequest(request)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => rejectAdminRequest(request)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-4 border-2 border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101a.75.75 0 10-1.06-1.061l-1.102 1.101a2.5 2.5 0 01-3.536-3.536l4-4a2.5 2.5 0 013.536 0l.102.102a.75.75 0 101.06-1.06l-.102-.102zM6.172 9.828a4 4 0 015.656 0l4 4a4 4 0 00-5.656 5.656l-1.102-1.101a.75.75 0 111.06-1.061l1.102 1.101a2.5 2.5 0 003.536-3.536l-4-4a2.5 2.5 0 00-3.536 0l-.102.102a.75.75 0 11-1.06-1.06l.102-.102z" clipRule="evenodd" />
                    </svg>
                    ⚠ Permission Denied - You are not a Super Admin
                  </h3>
                  <p className="text-red-800 dark:text-red-200 text-sm mb-3">
                    Only Super Admins can view and approve pending admin requests.
                    <br />
                    Current: isSuperAdmin = {currentAdmin?.isSuperAdmin === true ? '✓ TRUE' : '✗ FALSE'}
                    <br />
                    Current Admin Email: {currentAdmin?.email || 'Not loaded'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={forceRefreshRequests}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      🔄 Force Refresh
                    </button>
                    <button
                      onClick={resetAdminSession}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm font-medium"
                    >
                      🔐 Reset Session
                    </button>
                  </div>
                </div>
              )}

              {showAddAdminForm && currentAdmin?.isSuperAdmin && (
                <div className="mb-6 p-6 border-2 border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">Add Administrator</h3>
                    </div>
                    {/* Mode Toggle */}
                    <div className="flex bg-white dark:bg-gray-700 rounded-lg p-1 shadow-inner">
                      <button
                        onClick={() => setAdminCreationMode('create')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          adminCreationMode === 'create'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        Create New
                      </button>
                      <button
                        onClick={() => setAdminCreationMode('promote')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          adminCreationMode === 'promote'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        Promote User
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {adminCreationMode === 'create' 
                      ? 'Create a brand new admin account with a secure temporary password.'
                      : 'Promote an existing registered user to administrator status.'
                    }
                  </p>
                  
                  {/* Avatar Upload */}
                  {adminCreationMode === 'create' && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                        Profile Picture
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                          {newAdminForm.avatar ? (
                            <img src={newAdminForm.avatar} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span>
                              {newAdminForm.firstName && newAdminForm.lastName
                                ? `${newAdminForm.firstName[0]}${newAdminForm.lastName[0]}`
                                : 'AD'}
                            </span>
                          )}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = 'image/*'
                              input.onchange = (e: any) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    setNewAdminForm({...newAdminForm, avatar: reader.result as string})
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }
                              input.click()
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                          >
                            Choose Photo
                          </button>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            JPG, PNG or GIF (Max 5MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={adminCreationMode === 'promote' ? 'md:col-span-2' : 'md:col-span-2'}>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                        {adminCreationMode === 'promote' ? 'User Email' : 'Email Address'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder={adminCreationMode === 'promote' ? 'user@example.com (must be registered)' : 'admin@example.com'}
                        value={newAdminForm.email}
                        onChange={(e) => setNewAdminForm({...newAdminForm, email: e.target.value})}
                        className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    
                    {adminCreationMode === 'create' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="John"
                            value={newAdminForm.firstName}
                            onChange={(e) => setNewAdminForm({...newAdminForm, firstName: e.target.value})}
                            className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Doe"
                            value={newAdminForm.lastName}
                            onChange={(e) => setNewAdminForm({...newAdminForm, lastName: e.target.value})}
                            className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                            Phone Number (Optional)
                          </label>
                          <input
                            type="tel"
                            placeholder="+234 800 000 0000"
                            value={newAdminForm.phone}
                            onChange={(e) => setNewAdminForm({...newAdminForm, phone: e.target.value})}
                            className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </>
                    )}
                    
                    {adminCreationMode === 'promote' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                            First Name Override (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="Leave blank to use user's name"
                            value={newAdminForm.firstName}
                            onChange={(e) => setNewAdminForm({...newAdminForm, firstName: e.target.value})}
                            className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                            Last Name Override (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="Leave blank to use user's name"
                            value={newAdminForm.lastName}
                            onChange={(e) => setNewAdminForm({...newAdminForm, lastName: e.target.value})}
                            className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">
                        Administrator Permissions <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        {[
                          { id: 'manage_news', label: 'Manage News', desc: 'Approve, reject, and moderate news posts', icon: '📰' },
                          { id: 'moderate_users', label: 'Moderate Users', desc: 'Ban, restrict, and manage user accounts', icon: '👥' },
                          { id: 'manage_content', label: 'Manage Content', desc: 'Moderate comments and community messages', icon: '🛡️' },
                          { id: 'manage_admins', label: 'Manage Admins', desc: 'View and manage other administrators', icon: '👑' },
                          { id: 'view_analytics', label: 'View Analytics', desc: 'Access dashboard statistics and reports', icon: '📊' },
                          { id: 'system_settings', label: 'System Settings', desc: 'Modify global website settings', icon: '⚙️' }
                        ].map((perm) => (
                          <label key={perm.id} className="flex items-start p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-purple-200">
                            <input
                              type="checkbox"
                              checked={newAdminForm.permissions.includes(perm.id)}
                              onChange={(e) => {
                                const perms = e.target.checked
                                  ? [...newAdminForm.permissions, perm.id]
                                  : newAdminForm.permissions.filter(p => p !== perm.id)
                                setNewAdminForm({...newAdminForm, permissions: perms})
                              }}
                              className="mt-1 mr-3 w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white flex items-center">
                                <span className="mr-2">{perm.icon}</span>
                                {perm.label}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{perm.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2 flex space-x-3">
                      <button
                        onClick={handleAddAdmin}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>{adminCreationMode === 'create' ? 'Create Administrator' : 'Promote to Admin'}</span>
                      </button>
                      <button
                        onClick={() => setShowAddAdminForm(false)}
                        className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>{adminCreationMode === 'create' ? 'Security Note:' : 'Promotion Note:'}</strong> 
                        {adminCreationMode === 'create' 
                          ? ' A secure temporary password will be automatically generated and displayed after creating the account. Make sure to save it securely and share it with the new administrator through a secure channel.'
                          : ' The user will keep their existing login credentials but gain administrator privileges. They can access the admin dashboard immediately after promotion.'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {allAdmins.map((admin) => (
                  <div key={admin.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {admin.firstName} {admin.lastName}
                          {admin.isSuperAdmin && <span className="text-purple-600 ml-2">👑 Super Admin</span>}
                        </h3>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                        <p className="text-sm text-gray-500">Joined: {new Date(admin.createdAt).toLocaleDateString()}</p>
                        <div className="mt-2">
                          <p className="text-sm font-medium">Permissions:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {admin.permissions?.map((perm) => (
                              <span key={perm} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {perm.replace('_', ' ')}
                              </span>
                            )) || <span className="text-gray-500 text-xs">No permissions set</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {currentAdmin?.isSuperAdmin && admin.id !== currentAdmin.id && (
                          <button
                            onClick={() => handleRemoveAdmin(admin.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Remove Admin
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">User Moderation</h2>
              <div className="space-y-4">
                {allUsers.map((user) => (
                  <div key={user.id} className={`border rounded-lg p-4 ${user.isBanned ? 'bg-red-50 border-red-200' : user.isRestricted ? 'bg-yellow-50 border-yellow-200' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {user.firstName} {user.lastName}
                          {user.isBanned && <span className="text-red-600 ml-2">🚫 BANNED</span>}
                          {user.isRestricted && <span className="text-yellow-600 ml-2">⚠️ RESTRICTED</span>}
                        </h3>
                        <p className="text-sm text-gray-600">@{user.username} • {user.email}</p>
                        <p className="text-sm text-gray-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                        {user.lastLogin && (
                          <p className="text-sm text-gray-500">Last Login: {new Date(user.lastLogin).toLocaleDateString()}</p>
                        )}
                        {user.isBanned && user.banReason && (
                          <p className="text-sm text-red-600 mt-1">Ban Reason: {user.banReason}</p>
                        )}
                        {user.isRestricted && user.restrictionReason && (
                          <p className="text-sm text-yellow-600 mt-1">
                            Restriction: {user.restrictionReason}
                            {user.restrictionExpires && ` (Expires: ${new Date(user.restrictionExpires).toLocaleDateString()})`}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {user.isBanned ? (
                          <button
                            onClick={() => handleUnbanUser(user.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Unban
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                const reason = prompt('Ban reason:')
                                if (reason) handleBanUser(user.id, reason)
                              }}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Ban
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Restriction reason:')
                                const duration = parseInt(prompt('Duration in days:') || '7')
                                if (reason && duration) handleRestrictUser(user.id, reason, duration)
                              }}
                              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                            >
                              Restrict
                            </button>
                          </>
                        )}
                        {user.isRestricted && (
                          <button
                            onClick={() => handleUnrestrictUser(user.id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            Unrestrict
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                          className="bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-800 font-semibold"
                          title="Permanently delete this user"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {allUsers.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No users registered yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'all-users-admins' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">📋 All Users & Admins Directory</h2>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Users</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{allUsers.length}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Admins</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]').length}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Verified Users</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{allUsers.filter(u => u.isVerified).length}</p>
                </div>
              </div>

              {/* Users List */}
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Approved Users ({allUsers.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">Name</th>
                        <th className="px-4 py-2 text-left font-semibold">Email</th>
                        <th className="px-4 py-2 text-left font-semibold">Username</th>
                        <th className="px-4 py-2 text-left font-semibold">Joined</th>
                        <th className="px-4 py-2 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 font-medium">{user.firstName} {user.lastName}</td>
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3">@{user.username}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            {user.isBanned ? (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">🚫 Banned</span>
                            ) : user.isRestricted ? (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">⚠️ Restricted</span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">✅ Active</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {allUsers.length === 0 && <p className="text-center text-gray-500 py-8">No users found</p>}
                </div>
              </div>

              {/* Admins List */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">Administrator Accounts</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">Name</th>
                        <th className="px-4 py-2 text-left font-semibold">Email</th>
                        <th className="px-4 py-2 text-left font-semibold">Role</th>
                        <th className="px-4 py-2 text-left font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]').map((admin: AdminData) => (
                        <tr key={admin.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 font-medium flex items-center gap-2">
                            {admin.firstName} {admin.lastName}
                            {admin.isSuperAdmin && <span className="text-lg">👑</span>}
                          </td>
                          <td className="px-4 py-3">{admin.email}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                              {admin.isSuperAdmin ? '🛡️ Super Admin' : '👑 Admin'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{new Date(admin.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]').length === 0 && <p className="text-center text-gray-500 py-8">No admins found</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'news-management' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">🎛️ News Control Center</h2>
                  <button
                    onClick={() => setShowAddNewsForm(!showAddNewsForm)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold"
                  >
                    ➕ Add News Article
                  </button>
                </div>

                {/* Add News Form */}
                {showAddNewsForm && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 border-l-4 border-green-500">
                    <h3 className="text-lg font-semibold mb-4">Create New Article</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Article Title"
                        value={newNewsForm.title}
                        onChange={(e) => setNewNewsForm({ ...newNewsForm, title: e.target.value })}
                        className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                      />
                      <textarea
                        placeholder="Article Description"
                        value={newNewsForm.description}
                        onChange={(e) => setNewNewsForm({ ...newNewsForm, description: e.target.value })}
                        rows={4}
                        className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <select
                          value={newNewsForm.category}
                          onChange={(e) => setNewNewsForm({ ...newNewsForm, category: e.target.value })}
                          className="p-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                        >
                          <option value="breaking-news">Breaking News</option>
                          <option value="trending-stories">Trending Stories</option>
                          <option value="celebrity-news">Celebrity News</option>
                          <option value="entertainment">Entertainment</option>
                          <option value="gossip">Gossip</option>
                        </select>
                        <select
                          value={newNewsForm.status}
                          onChange={(e) => setNewNewsForm({ ...newNewsForm, status: e.target.value as any })}
                          className="p-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                        >
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder="Hashtags (comma-separated, e.g: #news,#breaking)"
                        value={newNewsForm.hashtags}
                        onChange={(e) => setNewNewsForm({ ...newNewsForm, hashtags: e.target.value })}
                        className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                      />
                      <input
                        type="url"
                        placeholder="Image URL (optional)"
                        value={newNewsForm.image}
                        onChange={(e) => setNewNewsForm({ ...newNewsForm, image: e.target.value })}
                        className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddNewsArticle}
                          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold"
                        >
                          ✅ Publish Article
                        </button>
                        <button
                          onClick={() => setShowAddNewsForm(false)}
                          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-semibold"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="🔍 Search articles..."
                    value={newsSearchTerm}
                    onChange={(e) => setNewsSearchTerm(e.target.value)}
                    className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <select
                    value={newsCategoryFilter}
                    onChange={(e) => setNewsCategoryFilter(e.target.value)}
                    className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    <option value="breaking-news">Breaking News</option>
                    <option value="trending-stories">Trending Stories</option>
                    <option value="celebrity-news">Celebrity News</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="gossip">Gossip</option>
                  </select>
                  <select
                    value={newsStatusFilter}
                    onChange={(e) => setNewsStatusFilter(e.target.value)}
                    className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Status</option>
                    <option value="approved">Approved ✅</option>
                    <option value="pending">Pending ⏳</option>
                    <option value="rejected">Rejected ❌</option>
                  </select>
                  <button
                    onClick={() => {
                      setNewsSearchTerm('')
                      setNewsCategoryFilter('')
                      setNewsStatusFilter('')
                    }}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                  >
                    🔄 Reset Filters
                  </button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Articles</p>
                    <p className="text-2xl font-bold text-blue-600">{allNews.length}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{allNews.filter(n => n.status === 'approved').length}</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{allNews.filter(n => n.status === 'pending').length}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{allNews.filter(n => n.status === 'rejected').length}</p>
                  </div>
                </div>
              </div>

              {/* News Articles List */}
              <div className="space-y-4">
                {allNews
                  .filter(news => {
                    const matchesSearch = news.title.toLowerCase().includes(newsSearchTerm.toLowerCase()) ||
                                        news.description.toLowerCase().includes(newsSearchTerm.toLowerCase())
                    const matchesCategory = !newsCategoryFilter || news.category === newsCategoryFilter
                    const matchesStatus = !newsStatusFilter || news.status === newsStatusFilter
                    return matchesSearch && matchesCategory && matchesStatus
                  })
                  .map((newsItem) => (
                    <div
                      key={newsItem.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      {editingNewsId === newsItem.id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingNewsForm.title || ''}
                            onChange={(e) => setEditingNewsForm({ ...editingNewsForm, title: e.target.value })}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white font-bold text-lg"
                          />
                          <textarea
                            value={editingNewsForm.description || ''}
                            onChange={(e) => setEditingNewsForm({ ...editingNewsForm, description: e.target.value })}
                            rows={3}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <select
                              value={editingNewsForm.category || ''}
                              onChange={(e) => setEditingNewsForm({ ...editingNewsForm, category: e.target.value })}
                              className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                            >
                              <option value="breaking-news">Breaking News</option>
                              <option value="trending-stories">Trending Stories</option>
                              <option value="celebrity-news">Celebrity News</option>
                              <option value="entertainment">Entertainment</option>
                              <option value="gossip">Gossip</option>
                            </select>
                            <select
                              value={editingNewsForm.status || ''}
                              onChange={(e) => setEditingNewsForm({ ...editingNewsForm, status: e.target.value as any })}
                              className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                            >
                              <option value="approved">Approved</option>
                              <option value="pending">Pending</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveNewsArticleEdit}
                              className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 font-semibold"
                            >
                              ✅ Save Changes
                            </button>
                            <button
                              onClick={() => {
                                setEditingNewsId(null)
                                setEditingNewsForm({})
                              }}
                              className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 font-semibold"
                            >
                              ❌ Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-1">{newsItem.title}</h3>
                              <div className="flex gap-2 mb-2">
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">📁 {newsItem.category}</span>
                                {newsItem.status === 'approved' && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✅ Approved</span>
                                )}
                                {newsItem.status === 'pending' && (
                                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">⏳ Pending</span>
                                )}
                                {newsItem.status === 'rejected' && (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">❌ Rejected</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{newsItem.description.substring(0, 150)}...</p>
                              <p className="text-xs text-gray-500">📅 {newsItem.date}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <button
                              onClick={() => handleEditNewsArticle(newsItem.id)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 font-semibold"
                            >
                              ✏️ Edit
                            </button>
                            {newsItem.status !== 'approved' && (
                              <button
                                onClick={() => handleApproveNewsArticle(newsItem.id)}
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 font-semibold"
                              >
                                ✅ Approve
                              </button>
                            )}
                            {newsItem.status !== 'pending' && (
                              <button
                                onClick={() => handlePendingNewsArticle(newsItem.id)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 font-semibold"
                              >
                                ⏳ Pending
                              </button>
                            )}
                            {newsItem.status !== 'rejected' && (
                              <button
                                onClick={() => handleRejectNewsArticle(newsItem.id)}
                                className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 font-semibold"
                              >
                                🚫 Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNewsArticle(newsItem.id, newsItem.title)}
                              className="bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-800 font-semibold"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                {allNews.filter(n => {
                  const matchesSearch = n.title.toLowerCase().includes(newsSearchTerm.toLowerCase()) ||
                                      n.description.toLowerCase().includes(newsSearchTerm.toLowerCase())
                  const matchesCategory = !newsCategoryFilter || n.category === newsCategoryFilter
                  const matchesStatus = !newsStatusFilter || n.status === newsStatusFilter
                  return matchesSearch && matchesCategory && matchesStatus
                }).length === 0 && (
                  <p className="text-center text-gray-500 py-8">No articles found matching your filters</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Content Moderation</h2>
              <div className="space-y-4">
                {allMessages.filter(msg => !msg.isDeleted).map((message) => {
                  const user = allUsers.find(u => u.id === message.userId)
                  return (
                    <div key={message.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">{message.firstName} {message.lastName}</span>
                            <span className="text-sm text-gray-500">@{message.username}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(message.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{message.message}</p>
                          {Object.keys(message.reactions).length > 0 && (
                            <div className="mt-2 text-sm text-gray-500">
                              Reactions: {Object.entries(message.reactions).map(([emoji, users]) =>
                                `${emoji}(${users.length})`
                              ).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {allMessages.filter(msg => !msg.isDeleted).length === 0 && (
                  <p className="text-center text-gray-500 py-8">No messages to moderate.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <VerificationApprovalSection />
        )}

        {activeTab === 'marketplace' && (
          <MarketplaceApprovalSection />
        )}

        {activeTab === 'settings' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Admin Settings</h2>
              <div className="space-y-6">
                <div className="border-b pb-6">
                  <h3 className="text-md font-medium mb-2 text-red-600">⚠️ Cleanup Unverified Users</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Remove all users who haven't completed facial verification. Admin accounts will be preserved.
                  </p>
                  <button
                    onClick={cleanupUnverifiedUsers}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                  >
                    🗑️ Delete Unverified Users
                  </button>
                </div>

                <div>
                  <h3 className="text-md font-medium mb-2">Anonymous Mode</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    When enabled, your identity will be hidden from users and other admins will see you as "Anonymous Admin".
                  </p>
                  <button
                    onClick={handleToggleAnonymousMode}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      isAnonymousMode
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {isAnonymousMode ? 'Disable Anonymous Mode' : 'Enable Anonymous Mode'}
                  </button>
                </div>

                <div>
                  <h3 className="text-md font-medium mb-2">Admin Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Name:</strong> {currentAdmin?.firstName} {currentAdmin?.lastName}</p>
                    <p><strong>Email:</strong> {currentAdmin?.email}</p>
                    <p><strong>Role:</strong> {currentAdmin?.isSuperAdmin ? 'Super Administrator' : 'Administrator'}</p>
                    <p><strong>Joined:</strong> {currentAdmin?.createdAt ? new Date(currentAdmin.createdAt).toLocaleDateString() : 'N/A'}</p>
                    {currentAdmin?.permissions && (
                      <p><strong>Permissions:</strong> {currentAdmin.permissions.join(', ')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium mb-2">System Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{allUsers.length}</div>
                      <div className="text-sm text-blue-600">Total Users</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{allAdmins.length}</div>
                      <div className="text-sm text-green-600">Administrators</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{news.length}</div>
                      <div className="text-sm text-purple-600">News Items</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">{allMessages.filter(m => !m.isDeleted).length}</div>
                      <div className="text-sm text-orange-600">Chat Messages</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}