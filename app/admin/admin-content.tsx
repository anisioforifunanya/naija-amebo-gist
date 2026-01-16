"use client";

import { createArticleFromAdmin, approveArticle, rejectArticle, removeArticle } from '@/lib/admin-article-handler';
import { saveArticle } from '@/lib/firebase-persistence';
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import LiveRecorder from '../../components/LiveRecorder'
import MarketplaceApprovalSection from '@/components/MarketplaceApprovalSection'
import VerificationApprovalSection from '@/components/VerificationApprovalSection'
import extendedNews from '@/data/extended-news.json'
import { StorageSync } from '@/lib/storageSync'
import { db } from '@/lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

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
  image?: string;
  video?: string;
  liveVideo?: string;
  liveAudio?: string;
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

export default function AdminContent() {
  const searchParams = useSearchParams()
  const queryTab = searchParams?.get('tab') as any || 'news'
  
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState<AdminData | null>(null)
  const [loginStep, setLoginStep] = useState<'email' | 'password'>('email')
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
    image: undefined as File | undefined,
    video: undefined as File | undefined,
    liveVideo: undefined as Blob | undefined,
    liveAudio: undefined as Blob | undefined
  })

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
    imageUrl: '',
    imageFile: undefined as File | undefined,
    videoFile: undefined as File | undefined,
  })
  const [activeTab, setActiveTab] = useState<'news' | 'news-management' | 'admins' | 'users' | 'all-users-admins' | 'analytics' | 'verification' | 'marketplace' | 'moderation' | 'settings'>(queryTab)
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

  useEffect(() => {
    if (queryTab && queryTab !== activeTab) {
      setActiveTab(queryTab)
    }
  }, [queryTab])

  const loadAllData = async () => {
    try {
      const { db } = await import('@/lib/firebase')
      const { collection, getDocs } = await import('firebase/firestore')
      const adminsSnapshot = await getDocs(collection(db, 'admins'))
      const admins = adminsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminData[]
      setAllAdmins(admins)
    } catch (error) {
      const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
      setAllAdmins(admins)
    }

    const requests = JSON.parse(localStorage.getItem('adminRequests') || '[]')
    setAdminRequests(requests)

    try {
      const { db } = await import('@/lib/firebase')
      const { collection, getDocs } = await import('firebase/firestore')
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]
      setAllUsers(users)
    } catch (error) {
      const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
      setAllUsers(users)
    }

    const messages = JSON.parse(localStorage.getItem('naijaAmeboChatMessages') || '[]')
    setAllMessages(messages)

    const staticNews = extendedNews.map((item: any) => ({
      id: item.id?.toString() || Math.random().toString(),
      title: item.title,
      description: item.excerpt || item.content,
      category: 'breaking-news',
      date: item.publishedAt || item.updatedAt || new Date().toISOString(),
      status: 'approved' as const,
      submittedBy: typeof item.author === 'object' ? item.author?.name || 'System' : (item.author || 'System'),
      submitterEmail: 'system@naijaamebogist.com',
      hashtags: item.tags || [],
      socialCaption: '',
      image: item.image,
      video: item.videoUrl,
    }))
    
    const loadedNews = await StorageSync.loadNews(staticNews)
    const uniqueNews = Array.from(
      new Map(loadedNews.map((item: any) => [item.title, item])).values()
    )
    
    setNews(uniqueNews)
    setAllNews(uniqueNews)
  }

  const forceRefreshRequests = () => {
    resetAdminSession()
  }

  const resetAdminSession = () => {
    const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
    const sessionAdmin = localStorage.getItem('naijaAmeboCurrentAdmin')
    
    if (sessionAdmin) {
      try {
        const admin = JSON.parse(sessionAdmin)
        const freshAdmin = admins.find((a: any) => a.id === admin.id || a.email === admin.email)
        
        if (freshAdmin) {
          let updatedAdmin = {
            ...admin,
            ...freshAdmin,
            isSuperAdmin: freshAdmin.isSuperAdmin === true
          }
          
          if (admin.email === 'ifunanya.anisiofor@gmail.com') {
            updatedAdmin = { ...updatedAdmin, isSuperAdmin: true }
          }
          
          setCurrentAdmin(updatedAdmin)
          localStorage.setItem('naijaAmeboCurrentAdmin', JSON.stringify(updatedAdmin))
          loadAllData()
          
          alert(`✓ Session Reset Complete!\n\nisSuperAdmin: ${updatedAdmin.isSuperAdmin ? '✓ TRUE' : '✗ FALSE'}\n\nRefresh page if needed.`)
        } else {
          alert('⚠ Error: Admin account not found in database. Please log in again.')
        }
      } catch (e) {
        alert('⚠ Error resetting session. Check console.')
      }
    }
  }

  useEffect(() => {
    const savedNews = localStorage.getItem('naijaAmeboNews')
    if (savedNews) {
      setNews(JSON.parse(savedNews))
      setAllNews(JSON.parse(savedNews))
    }

    const adminSession = localStorage.getItem('naijaAmeboCurrentAdmin')
    if (adminSession) {
      try {
        const admin = JSON.parse(adminSession)
        
        if (admin.id && admin.email && admin.role === 'admin') {
          let adminToUse = admin
          if (admin.email === 'ifunanya.anisiofor@gmail.com') {
            adminToUse = { ...admin, isSuperAdmin: true }
            localStorage.setItem('naijaAmeboCurrentAdmin', JSON.stringify(adminToUse))
          }
          
          setCurrentAdmin(adminToUse)
          setIsLoggedIn(true)
          loadAllData()
        } else {
          localStorage.removeItem('naijaAmeboCurrentAdmin')
          setIsLoggedIn(false)
        }
      } catch (e) {
        localStorage.removeItem('naijaAmeboCurrentAdmin')
        setIsLoggedIn(false)
      }
    } else {
      setIsLoggedIn(false)
    }

    const anonymousMode = localStorage.getItem('naijaAmeboAnonymousMode')
    setIsAnonymousMode(anonymousMode === 'true')
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (activeTab === 'admins' && isLoggedIn) {
      loadAllData()
      
      const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
      const sessionAdmin = localStorage.getItem('naijaAmeboCurrentAdmin')
      
      if (sessionAdmin && currentAdmin?.email) {
        try {
          const admin = JSON.parse(sessionAdmin)
          const freshAdmin = admins.find((a: any) => a.email === admin.email)
          
          if (freshAdmin && freshAdmin.isSuperAdmin && !admin.isSuperAdmin) {
            const updatedAdmin = { ...admin, isSuperAdmin: freshAdmin.isSuperAdmin }
            setCurrentAdmin(updatedAdmin)
            localStorage.setItem('naijaAmeboCurrentAdmin', JSON.stringify(updatedAdmin))
          }
        } catch (e) {
        }
      }
    }
  }, [activeTab, isLoggedIn, currentAdmin?.email])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loginStep === 'email') {
      if (!loginForm.email) {
        alert('Please enter your email or username')
        return
      }
      setLoginStep('password')
      return
    }

    if (loginStep === 'password') {
      if (!loginForm.password) {
        alert('Please enter your password')
        return
      }

      try {
        const { loginUserWithEmail } = await import('@/lib/firebaseUtils')
        const authUser = await loginUserWithEmail(loginForm.email, loginForm.password)
        
        const { db } = await import('@/lib/firebase')
        const { doc, getDoc } = await import('firebase/firestore')
        const adminDocRef = doc(db, 'admins', authUser.uid)
        const adminDocSnap = await getDoc(adminDocRef)
        
        if (adminDocSnap.exists()) {
          const adminData = adminDocSnap.data() as any
          const adminWithSuperAdminFlag: AdminData = {
            id: authUser.uid,
            email: authUser.email || '',
            password: '',
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
          
          setCurrentAdmin(adminWithSuperAdminFlag)
          setIsLoggedIn(true)
          setLoginStep('email')
          localStorage.setItem('naijaAmeboCurrentAdmin', JSON.stringify(adminWithSuperAdminFlag))
          await loadAllData()
        } else {
          alert('Admin profile not found. Please contact support.')
          setLoginForm({ ...loginForm, password: '' })
        }
      } catch (error: any) {
        alert('Invalid email or password. Please try again.')
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

  const cleanupUnverifiedUsers = () => {
    if (!confirm('⚠️ This will delete all users who haven\'t completed facial verification. This cannot be undone. Continue?')) {
      return
    }

    try {
      const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
      const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
      
      const adminIds = new Set(admins.map((a: any) => a.id))

      const verifiedUsers = users.filter((u: any) => 
        u.facialPhoto || adminIds.has(u.id)
      )

      const deletedCount = users.length - verifiedUsers.length

      localStorage.setItem('naijaAmeboUsers', JSON.stringify(verifiedUsers))

      alert(`✅ Cleaned up successfully!\n\nDeleted: ${deletedCount} unverified users\nRemaining: ${verifiedUsers.length} users`)
      
      loadAllData()
    } catch (error) {
      alert('❌ Error during cleanup. Please try again.')
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  const handleAddNews = async () => {
    try {
      if (!newNews.title || !newNews.description || !newNews.category) {
        alert('Please fill in all required fields')
        return
      }

      const articleId = await createArticleFromAdmin({
        title: newNews.title,
        description: newNews.description,
        category: newNews.category,
        hashtags: newNews.hashtags,
        socialCaption: newNews.socialCaption,
        image: newNews.image,
        video: newNews.video,
        liveVideo: newNews.liveVideo,
        liveAudio: newNews.liveAudio
      })

      const newsItem = {
        id: articleId,
        title: newNews.title,
        description: newNews.description,
        category: newNews.category,
        date: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }),
        status: 'approved' as const,
        submittedBy: 'admin',
        hashtags: newNews.hashtags.split(',').map(tag => tag.trim()),
        socialCaption: newNews.socialCaption,
        image: undefined,
        video: undefined
      }

      const updatedNews = [...news, newsItem]
      setNews(updatedNews)

      alert('✅ Article saved to Firebase!')

      setNewNews({
        title: '',
        description: '',
        category: 'breaking-news',
        hashtags: '',
        socialCaption: '',
        image: undefined,
        video: undefined,
        liveVideo: undefined,
        liveAudio: undefined
      })
      setShowAddForm(false)
    } catch (error) {
      alert('❌ Failed to save article: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleStatusChange = (id: string, status: 'approved' | 'rejected') => {
    const updatedNews = news.map(item =>
      item.id === id ? { ...item, status } : item
    )
    setNews(updatedNews)
  }

  const handleDelete = async (id: string) => {
    try {
      await removeArticle(id)
      const updatedNews = news.filter(item => item.id !== id)
      setNews(updatedNews)
      alert('✅ Article deleted from Firebase')
    } catch (error) {
      alert('❌ Failed to delete article: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleAddAdmin = () => {
    if (!currentAdmin?.isSuperAdmin) {
      alert('Only super admins can add new administrators')
      return
    }

    if (adminCreationMode === 'promote') {
      const user = allUsers.find(u => u.email === newAdminForm.email)
      if (!user) {
        alert('User not found. Please check the email address.')
        return
      }

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
      if (!newAdminForm.email || !newAdminForm.firstName || !newAdminForm.lastName) {
        alert('Please fill in all required fields')
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newAdminForm.email)) {
        alert('Please enter a valid email address')
        return
      }

      if (allAdmins.some(a => a.email === newAdminForm.email)) {
        alert('This email is already registered as an administrator')
        return
      }

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
      
      alert(`Administrator created successfully!\n\nEmail: ${newAdmin.email}\nTemporary Password: ${tempPassword}\n\n⚠️ IMPORTANT: Share this password securely with the new admin. They should change it immediately after first login.`)
    }
  }

  const approveAdminRequest = (request: AdminRequestData) => {
    if (!currentAdmin?.isSuperAdmin && currentAdmin?.email !== 'ifunanya.anisiofor@gmail.com') {
      alert('Only super admins can approve admin requests')
      return
    }

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
      permissions: ['moderate_content', 'manage_users']
    }

    const updatedAdmins = [...allAdmins, newAdmin]
    setAllAdmins(updatedAdmins)
    localStorage.setItem('naijaAmeboAdmins', JSON.stringify(updatedAdmins))

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

  const rejectAdminRequest = (request: AdminRequestData) => {
    if (!currentAdmin?.isSuperAdmin && currentAdmin?.email !== 'ifunanya.anisiofor@gmail.com') {
      alert('Only super admins can reject admin requests')
      return
    }

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
      const updatedUsers = allUsers.filter(user => user.id !== userId)
      setAllUsers(updatedUsers)
      localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))

      alert(`✅ User "${userName}" has been permanently deleted from the system.`)
    } catch (error) {
      alert('❌ Error deleting user. Please try again.')
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    const updatedMessages = allMessages.map(msg =>
      msg.id === messageId ? { ...msg, isDeleted: true } : msg
    )
    setAllMessages(updatedMessages)
    localStorage.setItem('naijaAmeboChatMessages', JSON.stringify(updatedMessages))
  }

  const handleAddNewsArticle = async () => {
    if (!newNewsForm.title.trim() || !newNewsForm.description.trim()) {
      alert('❌ Please fill in title and description')
      return
    }

    const currentAdmin = JSON.parse(localStorage.getItem('naijaAmeboCurrentAdmin') || '{}')
    
    let imageBase64: string | undefined = undefined
    if (newNewsForm.imageFile) {
      imageBase64 = await fileToBase64(newNewsForm.imageFile)
    } else if (newNewsForm.imageUrl.trim()) {
      imageBase64 = newNewsForm.imageUrl
    }

    let videoBase64: string | undefined = undefined
    if (newNewsForm.videoFile) {
      videoBase64 = await fileToBase64(newNewsForm.videoFile)
    }
    
    const newArticle: NewsItem = {
      id: Date.now().toString(),
      title: newNewsForm.title,
      description: newNewsForm.description,
      category: newNewsForm.category,
      status: newNewsForm.status,
      date: new Date().toLocaleString(),
      hashtags: newNewsForm.hashtags ? newNewsForm.hashtags.split(',').map(h => h.trim()) : [],
      image: imageBase64,
      video: videoBase64,
      submittedBy: currentAdmin.firstName ? `${currentAdmin.firstName} ${currentAdmin.lastName}` : 'Admin',
      submitterEmail: currentAdmin.email,
      socialCaption: '',
    }

    const updatedNews = [...allNews, newArticle]
    setAllNews(updatedNews)
    
    await StorageSync.saveNews(updatedNews)

    try {
      const firebaseArticle = {
        title: newArticle.title,
        description: newArticle.description,
        excerpt: newArticle.description.substring(0, 200),
        category: newArticle.category,
        status: newArticle.status,
        image: newArticle.image,
        video: newArticle.video,
        date: newArticle.date,
        submittedBy: newArticle.submittedBy,
        submitterEmail: newArticle.submitterEmail,
        hashtags: newArticle.hashtags || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
      await addDoc(collection(db, 'articles'), firebaseArticle)
    } catch (firebaseError) {
      alert('⚠️ News saved locally but failed to sync to database. Please try again.')
      return
    }

    setNewNewsForm({
      title: '',
      description: '',
      category: 'breaking-news',
      status: 'approved',
      hashtags: '',
      imageUrl: '',
      imageFile: undefined,
      videoFile: undefined,
    })
    setShowAddNewsForm(false)
    alert('✅ News article added successfully and published online!')
  }

  const handleEditNewsArticle = (newsId: string) => {
    const newsItem = allNews.find(n => n.id === newsId)
    if (newsItem) {
      setEditingNewsId(newsId)
      setEditingNewsForm(newsItem)
    }
  }

  const handleSaveNewsArticleEdit = async () => {
    if (!editingNewsForm.title?.trim() || !editingNewsForm.description?.trim()) {
      alert('❌ Please fill in title and description')
      return
    }

    try {
      await saveArticle({ id: editingNewsId, ...editingNewsForm } as any)
      
      const updatedNews = allNews.map(n =>
        n.id === editingNewsId ? { ...n, ...editingNewsForm } : n
      )
      setAllNews(updatedNews)
      setEditingNewsId(null)
      setEditingNewsForm({})
      alert('✅ News article updated in Firebase!')
    } catch (error) {
      alert('❌ Failed to update article: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDeleteNewsArticle = async (newsId: string, newsTitle: string) => {
    if (!window.confirm(`⚠️ Are you sure you want to DELETE the article "${newsTitle}"? This action cannot be undone!`)) {
      return
    }

    try {
      await removeArticle(newsId)
      const updatedNews = allNews.filter(n => n.id !== newsId)
      setAllNews(updatedNews)
      alert('✅ News article deleted from Firebase!')
    } catch (error) {
      alert('❌ Failed to delete article: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleApproveNewsArticle = async (newsId: string) => {
    try {
      await approveArticle(newsId)
      const updatedNews = allNews.map(n =>
        n.id === newsId ? { ...n, status: 'approved' as const } : n
      )
      setAllNews(updatedNews)
      alert('✅ Article approved in Firebase!')
    } catch (error) {
      alert('❌ Failed to approve article: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleRejectNewsArticle = async (newsId: string) => {
    try {
      await rejectArticle(newsId)
      const updatedNews = allNews.map(n =>
        n.id === newsId ? { ...n, status: 'rejected' as const } : n
      )
      setAllNews(updatedNews)
      alert('✅ Article rejected in Firebase!')
    } catch (error) {
      alert('❌ Failed to reject article: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
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
      {/* Keep the rest of the JSX exactly the same as in the original file */}
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

      {/* Rest of the dashboard JSX continues the same... */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total News</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{news.length}</p>
            <p className="text-xs text-gray-500 mt-1">{news.filter(n => n.status === 'pending').length} pending</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Administrators</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{allAdmins.length}</p>
            <p className="text-xs text-gray-500 mt-1">{allAdmins.filter(a => a.isSuperAdmin).length} super admins</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Users</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{allUsers.length}</p>
            <p className="text-xs text-gray-500 mt-1">{allUsers.filter(u => u.isBanned).length} banned</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{allMessages.length}</p>
            <p className="text-xs text-gray-500 mt-1">{allMessages.filter(m => m.isDeleted).length} deleted</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 overflow-x-auto py-4">
            {[
              { id: 'news', label: 'News Management', icon: '📰' },
              { id: 'news-management', label: 'News Control Center', icon: '🎛️' },
              { id: 'admins', label: 'Admin Management', icon: '👑' },
              { id: 'users', label: 'User Moderation', icon: '👥' },
              { id: 'all-users-admins', label: 'View All Users & Admins', icon: '📋' },
              { id: 'analytics', label: 'Analytics', icon: '📊' },
              { id: 'verification', label: 'Face Verification', icon: '🔐' },
              { id: 'marketplace', label: 'Product Approvals', icon: '🛍️' },
              { id: 'moderation', label: 'Content Moderation', icon: '🛡️' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/admin"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-semibold transition-all shadow-md"
            >
              <span className="text-lg">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/user-presence"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-all shadow-md"
            >
              <span className="text-lg">🟢</span>
              <span>User Presence</span>
            </Link>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-all shadow-md"
            >
              <span className="text-lg">📊</span>
              <span>Analytics</span>
            </Link>
            <Link
              href="/super-admin/geo-map"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-all shadow-md"
            >
              <span className="text-lg">🗺️</span>
              <span>Geo Map</span>
            </Link>
            <Link
              href="/admin/community-moderation"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-all shadow-md"
            >
              <span className="text-lg">🛡️</span>
              <span>Community</span>
            </Link>
            <Link
              href="/private-messages"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 font-semibold transition-all shadow-md"
            >
              <span className="text-lg">💬</span>
              <span>Messages</span>
            </Link>
            <Link
              href="/setup-demo"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold transition-all shadow-md"
            >
              <span className="text-lg">🚀</span>
              <span>Setup Demo</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'news' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">📰 News Management</h2>
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image Section */}
                    {item.image && (
                      <div className="w-full sm:w-40 h-40 sm:h-auto bg-gray-200 flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    {/* Content Section */}
                    <div className="flex-1 p-4 flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.description.substring(0, 120)}...</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">{item.category}</span>
                          <span>{item.date}</span>
                          <span className={`px-2 py-1 rounded font-semibold ${
                            item.status === 'approved' ? 'bg-green-100 text-green-800' :
                            item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(item.id)} className="ml-4 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 font-semibold flex-shrink-0">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'news-management' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🎛️ News Control Center</h2>
              <button
                onClick={() => setShowAddNewsForm(!showAddNewsForm)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold"
              >
                ➕ Add News Article
              </button>
            </div>

            {showAddNewsForm && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border-l-4 border-green-500">
                <h3 className="text-lg font-semibold mb-4">Create New Article</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Article Title"
                    value={newNewsForm.title}
                    onChange={(e) => setNewNewsForm({ ...newNewsForm, title: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                  <textarea
                    placeholder="Article Description"
                    value={newNewsForm.description}
                    onChange={(e) => setNewNewsForm({ ...newNewsForm, description: e.target.value })}
                    rows={4}
                    className="w-full p-2 border rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={newNewsForm.category}
                      onChange={(e) => setNewNewsForm({ ...newNewsForm, category: e.target.value })}
                      className="p-2 border rounded-lg"
                    >
                      <option value="breaking-news">Breaking News</option>
                      <option value="trending-stories">Trending Stories</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="gossip">Gossip</option>
                    </select>
                    <select
                      value={newNewsForm.status}
                      onChange={(e) => setNewNewsForm({ ...newNewsForm, status: e.target.value as any })}
                      className="p-2 border rounded-lg"
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Articles</p>
                <p className="text-2xl font-bold text-blue-600">{allNews.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{allNews.filter(n => n.status === 'approved').length}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{allNews.filter(n => n.status === 'pending').length}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{allNews.filter(n => n.status === 'rejected').length}</p>
              </div>
            </div>

            <div className="space-y-4">
              {allNews.map((newsItem) => (
                <div key={newsItem.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image Section */}
                    {newsItem.image && (
                      <div className="w-full sm:w-48 h-48 sm:h-auto bg-gray-200 flex-shrink-0">
                        <img 
                          src={newsItem.image} 
                          alt={newsItem.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    {/* Content Section */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{newsItem.title}</h3>
                        <div className="flex gap-2 mb-2 flex-wrap">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">📁 {newsItem.category}</span>
                          {newsItem.status === 'approved' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✅ Approved</span>}
                          {newsItem.status === 'pending' && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">⏳ Pending</span>}
                          {newsItem.status === 'rejected' && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">❌ Rejected</span>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{newsItem.description.substring(0, 150)}...</p>
                        <p className="text-xs text-gray-500">📅 {newsItem.date}</p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {newsItem.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveNewsArticle(newsItem.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 font-semibold"
                          >
                            ✅ Approve
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">👑 Admin Management</h2>
              <p className="text-sm text-gray-600">Manage administrators and their permissions</p>
            </div>

            {/* Admin Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Admins</p>
                <p className="text-2xl font-bold text-purple-600">{allAdmins.length}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Super Admins</p>
                <p className="text-2xl font-bold text-blue-600">{allAdmins.filter(a => a.isSuperAdmin).length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Regular Admins</p>
                <p className="text-2xl font-bold text-green-600">{allAdmins.filter(a => !a.isSuperAdmin).length}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-orange-600">{allAdmins.length}</p>
              </div>
            </div>

            {/* Filter Options */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
                  <select className="w-full p-2 border rounded-lg text-sm">
                    <option>All Admins</option>
                    <option>Super Admin</option>
                    <option>Regular Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <select className="w-full p-2 border rounded-lg text-sm">
                    <option>Most Recent</option>
                    <option>Oldest First</option>
                    <option>Alphabetical</option>
                    <option>Super Admin First</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Admin</label>
                  <input type="text" placeholder="Search by name or email" className="w-full p-2 border rounded-lg text-sm" />
                </div>
              </div>
            </div>

            {/* Admins List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Administrator Accounts</h3>
              {allAdmins.map((admin) => (
                <div key={admin.id} className={`border rounded-lg p-4 ${admin.isSuperAdmin ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'} transition-colors`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{admin.firstName} {admin.lastName}</h3>
                        {admin.isSuperAdmin && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">👑 Super Admin</span>}
                        {!admin.isSuperAdmin && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">⚙️ Admin</span>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{admin.email}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {admin.phone && <span>📱 {admin.phone}</span>}
                        {admin.createdAt && <span>📅 Joined {new Date(admin.createdAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Permissions/Bio */}
                  {admin.bio && (
                    <div className="bg-gray-100 p-3 rounded mb-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Bio:</span> {admin.bio}
                      </p>
                    </div>
                  )}

                  {/* Permissions List */}
                  {admin.permissions && admin.permissions.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-2">
                        {admin.permissions.map((perm, idx) => (
                          <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            ✓ {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 font-semibold">
                      ✏️ Edit Admin
                    </button>
                    <button className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 font-semibold">
                      🔐 Manage Permissions
                    </button>
                    {admin.isSuperAdmin ? (
                      <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 font-semibold">
                        ⬇️ Demote to Admin
                      </button>
                    ) : (
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 font-semibold">
                        ⬆️ Promote to Super Admin
                      </button>
                    )}
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 font-semibold">
                      🗑️ Remove Admin
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Admin Button */}
            <div className="mt-6 pt-6 border-t">
              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 font-bold text-lg transition-all shadow-lg">
                ➕ Add New Administrator
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">👥 User Moderation</h2>
              <p className="text-sm text-gray-600">Review and manage user accounts and activity</p>
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{allUsers.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{allUsers.filter(u => !u.isBanned).length}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Banned Users</p>
                <p className="text-2xl font-bold text-red-600">{allUsers.filter(u => u.isBanned).length}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Verified Users</p>
                <p className="text-2xl font-bold text-yellow-600">{allUsers.filter(u => u.isVerified).length}</p>
              </div>
            </div>

            {/* Filter Options */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                  <select className="w-full p-2 border rounded-lg text-sm">
                    <option>All Users</option>
                    <option>Active</option>
                    <option>Banned</option>
                    <option>Restricted</option>
                    <option>Verified</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <select className="w-full p-2 border rounded-lg text-sm">
                    <option>Most Recent</option>
                    <option>Oldest First</option>
                    <option>Alphabetical</option>
                    <option>Violations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search User</label>
                  <input type="text" placeholder="Search by name, email or username" className="w-full p-2 border rounded-lg text-sm" />
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Registered Users</h3>
              {allUsers.map((user) => (
                <div key={user.id} className={`border rounded-lg p-4 ${user.isBanned ? 'bg-red-50 border-red-300' : 'hover:bg-gray-50'} transition-colors`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h3>
                        {user.isVerified && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✅ Verified</span>}
                        {user.isBanned && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">🚫 Banned</span>}
                        {user.isRestricted && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">⚠️ Restricted</span>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">@{user.username} • {user.email}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📍 {user.location || 'Location not set'}</span>
                        <span>📱 {user.phone || 'Phone not provided'}</span>
                        {user.createdAt && <span>📅 Joined {new Date(user.createdAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Ban/Restriction Details */}
                  {user.isBanned && user.banReason && (
                    <div className="bg-red-100 border-l-4 border-red-500 p-3 rounded mb-3">
                      <p className="text-sm font-semibold text-red-700">Ban Reason:</p>
                      <p className="text-sm text-red-600">{user.banReason}</p>
                    </div>
                  )}
                  
                  {user.isRestricted && user.restrictionReason && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded mb-3">
                      <p className="text-sm font-semibold text-yellow-700">Restriction Reason:</p>
                      <p className="text-sm text-yellow-600">{user.restrictionReason}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {!user.isBanned && (
                      <>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 font-semibold">
                          🚫 Ban User
                        </button>
                        <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 font-semibold">
                          ⚠️ Restrict User
                        </button>
                      </>
                    )}
                    {user.isBanned && (
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 font-semibold">
                        ✅ Unban User
                      </button>
                    )}
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 font-semibold">
                      👁️ View Profile
                    </button>
                    <button className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 font-semibold">
                      💬 Send Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'all-users-admins' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">📋 All Users & Admins Directory</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">{allUsers.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Admins</p>
                <p className="text-3xl font-bold text-purple-600">{allAdmins.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Verified Users</p>
                <p className="text-3xl font-bold text-green-600">{allUsers.filter(u => u.isVerified).length}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Registered Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Name</th>
                      <th className="px-4 py-2 text-left font-semibold">Email</th>
                      <th className="px-4 py-2 text-left font-semibold">Username</th>
                      <th className="px-4 py-2 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{user.firstName} {user.lastName}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">@{user.username}</td>
                        <td className="px-4 py-3">
                          {user.isBanned ? (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">🚫 Banned</span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">✅ Active</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-4">Administrator Accounts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Name</th>
                      <th className="px-4 py-2 text-left font-semibold">Email</th>
                      <th className="px-4 py-2 text-left font-semibold">Role</th>
                      <th className="px-4 py-2 text-left font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAdmins.map((admin) => (
                      <tr key={admin.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 flex items-center gap-2">
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
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <VerificationApprovalSection />
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Platform Analytics</h2>
              <p className="text-sm text-gray-600">Monitor platform performance, user activity, and engagement metrics</p>
            </div>

            {/* Time Range Selector */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
              <div className="flex gap-2 flex-wrap">
                {['24h', '7d', '30d', '90d', '1y'].map((range) => (
                  <button key={range} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 text-sm font-semibold">
                    {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'Last Year'}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-blue-600">{allUsers.length * 12}</p>
                <p className="text-xs text-blue-500 mt-1">↑ 12% from last week</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600">{allUsers.filter(u => !u.isBanned).length}</p>
                <p className="text-xs text-green-500 mt-1">↑ 8% from last week</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total News Posts</p>
                <p className="text-3xl font-bold text-purple-600">{news.length}</p>
                <p className="text-xs text-purple-500 mt-1">↑ 24% from last week</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-3xl font-bold text-orange-600">78%</p>
                <p className="text-xs text-orange-500 mt-1">↑ 5% from last week</p>
              </div>
            </div>

            {/* User Activity Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 User Growth</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New Users (This Month)</span>
                    <span className="font-bold text-blue-600">{Math.floor(allUsers.length * 0.3)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Returning Users (30 Days)</span>
                    <span className="font-bold text-green-600">{Math.floor(allUsers.length * 0.7)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Content Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Page Views</span>
                    <span className="font-bold text-purple-600">{allUsers.length * 45}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '82%'}}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bounce Rate</span>
                    <span className="font-bold text-red-600">24%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{width: '24%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Category Performance */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📰 Content by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">5</p>
                  <p className="text-xs text-gray-600 mt-1">Breaking News</p>
                  <p className="text-xs text-gray-500">25% of total</p>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">8</p>
                  <p className="text-xs text-gray-600 mt-1">Trending Stories</p>
                  <p className="text-xs text-gray-500">40% of total</p>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">4</p>
                  <p className="text-xs text-gray-600 mt-1">Entertainment</p>
                  <p className="text-xs text-gray-500">20% of total</p>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-600">3</p>
                  <p className="text-xs text-gray-600 mt-1">Gossip</p>
                  <p className="text-xs text-gray-500">15% of total</p>
                </div>
              </div>
            </div>

            {/* Device & Browser Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Top Devices</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mobile</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700">65%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Desktop</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '30%'}}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700">30%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tablet</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '5%'}}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700">5%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🌐 Top Browsers</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Chrome</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '58%'}}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700">58%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Safari</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-600 h-2 rounded-full" style={{width: '25%'}}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Firefox</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{width: '12%'}}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700">12%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Other</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-400 h-2 rounded-full" style={{width: '5%'}}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700">5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'marketplace' && (
          <MarketplaceApprovalSection />
        )}

        {activeTab === 'moderation' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🛡️ Content Moderation</h2>
              <p className="text-sm text-gray-600">Review and moderate user-generated content</p>
            </div>

            {/* Moderation Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-red-600">{allMessages.filter(m => !m.isDeleted).length}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Flagged</p>
                <p className="text-2xl font-bold text-yellow-600">{Math.floor(allMessages.length * 0.15)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{Math.floor(allMessages.length * 0.7)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Removed</p>
                <p className="text-2xl font-bold text-purple-600">{allMessages.filter(m => m.isDeleted).length}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                  <select className="w-full p-2 border rounded-lg text-sm">
                    <option>All Messages</option>
                    <option>Pending Review</option>
                    <option>Approved</option>
                    <option>Flagged</option>
                    <option>Removed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                  <select className="w-full p-2 border rounded-lg text-sm">
                    <option>All Categories</option>
                    <option>Profanity</option>
                    <option>Harassment</option>
                    <option>Spam</option>
                    <option>Misinformation</option>
                    <option>Adult Content</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <select className="w-full p-2 border rounded-lg text-sm">
                    <option>Most Recent</option>
                    <option>Oldest First</option>
                    <option>Most Flagged</option>
                    <option>User Complaints</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Messages Pending Review</h3>
              {allMessages.filter(m => !m.isDeleted).length > 0 ? (
                allMessages.filter(m => !m.isDeleted).map((msg) => (
                  <div key={msg.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{msg.username}</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">👤 {msg.firstName} {msg.lastName}</span>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded mb-2">{msg.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📅 {new Date(msg.timestamp).toLocaleDateString()}</span>
                          <span>🕐 {new Date(msg.timestamp).toLocaleTimeString()}</span>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">⚠️ Pending</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-2xl">😊</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 font-semibold">
                        ✅ Approve
                      </button>
                      <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 font-semibold">
                        ⚠️ Flag for Review
                      </button>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 font-semibold">
                        🗑️ Remove
                      </button>
                      <button className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 font-semibold">
                        🚫 Ban User
                      </button>
                      <button className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 font-semibold">
                        💬 Send Warning
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">✨ All messages are clean! No moderation needed.</p>
                </div>
              )}
            </div>

            {/* Moderation Rules */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-4">📋 Moderation Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">🚫 Prohibited Content</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• Hate speech and discrimination</li>
                    <li>• Harassment and bullying</li>
                    <li>• Explicit/adult content</li>
                    <li>• Misinformation</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">⚠️ Caution Content</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Spam and self-promotion</li>
                    <li>• Commercial advertisements</li>
                    <li>• Excessive caps lock</li>
                    <li>• Repetitive posts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Admin Settings</h2>
            
            <div className="space-y-8">
              {/* Platform Settings */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Platform Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Maintenance Mode</p>
                      <p className="text-sm text-gray-600">Put site in maintenance mode</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">User Registration</p>
                      <p className="text-sm text-gray-600">Allow new user registrations</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 cursor-pointer" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Community Features</p>
                      <p className="text-sm text-gray-600">Enable user interactions</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 cursor-pointer" defaultChecked />
                  </div>
                </div>
              </div>

              {/* Content Moderation */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Content Moderation</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Auto-approve articles from verified users</label>
                    <select className="w-full p-2 border rounded-lg">
                      <option>Disabled</option>
                      <option selected>Enabled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content filter sensitivity</label>
                    <select className="w-full p-2 border rounded-lg">
                      <option>Low</option>
                      <option selected>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Profanity Filter</p>
                      <p className="text-sm text-gray-600">Filter offensive content</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 cursor-pointer" defaultChecked />
                  </div>
                </div>
              </div>

              {/* Email Settings */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📧 Email Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Notifications</label>
                    <select className="w-full p-2 border rounded-lg">
                      <option>All Events</option>
                      <option selected>Critical Only</option>
                      <option>Disabled</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Daily Report</p>
                      <p className="text-sm text-gray-600">Receive daily activity reports</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 cursor-pointer" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Newsletter Summary</p>
                      <p className="text-sm text-gray-600">Weekly content summary</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔔 Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-600">Enable browser notifications</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 cursor-pointer" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">User Reports</p>
                      <p className="text-sm text-gray-600">Notify on user reports</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 cursor-pointer" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Verification Pending</p>
                      <p className="text-sm text-gray-600">Notify on pending verifications</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 cursor-pointer" defaultChecked />
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔐 Security</h3>
                <div className="space-y-4">
                  <button className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold">
                    🔑 Change Password
                  </button>
                  <button className="w-full p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-semibold">
                    📝 Manage Two-Factor Authentication
                  </button>
                  <button className="w-full p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-semibold">
                    👤 View Active Sessions
                  </button>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Session Timeout</p>
                      <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
                    </div>
                    <select className="p-1 border rounded">
                      <option>15 min</option>
                      <option selected>30 min</option>
                      <option>1 hour</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💾 Data Management</h3>
                <div className="space-y-4">
                  <button className="w-full p-3 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 font-semibold">
                    📥 Export Analytics Data
                  </button>
                  <button className="w-full p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 font-semibold">
                    🗑️ Clear Cache
                  </button>
                  <button className="w-full p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-semibold">
                    ⚠️ Reset to Defaults
                  </button>
                </div>
              </div>

              {/* Admin Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ℹ️ Admin Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Admin Name</p>
                    <p className="font-semibold text-gray-900">{currentAdmin?.firstName} {currentAdmin?.lastName}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{currentAdmin?.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-semibold text-gray-900">{currentAdmin?.isSuperAdmin ? '👑 Super Admin' : '👤 Admin'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-semibold text-gray-900">{currentAdmin?.createdAt ? new Date(currentAdmin.createdAt).toLocaleDateString() : 'N/A'}</p>
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
