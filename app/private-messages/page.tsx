'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { addMessage, getMessages, updateConversation, getConversations } from '@/lib/firebaseUtils'

interface PrivateMessage {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  receiverName: string
  message: string
  timestamp: string
  isRead: boolean
  isAnonymous: boolean
  attachments?: {
    type: 'image' | 'file' | 'location' | 'poll' | 'contact' | 'music' | 'wallet' | 'video' | 'voice'
    data: any
  }[]
}

interface Conversation {
  id: string
  otherUserId: string
  otherUserName: string
  otherUserType: 'user' | 'admin'
  lastMessage: string
  lastTimestamp: string
  unreadCount: number
}

export default function PrivateMessages() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<PrivateMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewConversation, setShowNewConversation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if user or admin is logged in
    const userSession = localStorage.getItem('naijaAmeboCurrentUser')
    const adminSession = localStorage.getItem('naijaAmeboCurrentAdmin')
    
    if (!userSession && !adminSession) {
      window.location.href = '/login'
      return
    }

    const user = userSession ? JSON.parse(userSession) : JSON.parse(adminSession || '{}')
    setCurrentUser(user)

    // Anonymous users can't use private messaging
    if (user.isAnonymous) {
      alert('Private messaging is only available for registered users. Please create an account.')
      window.location.href = '/community'
      return
    }

    // Load all users and admins
    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
    const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
    const allUsersList = [...users, ...admins]
    setAllUsers(allUsersList)

    // Load conversations for this specific user with the users list
    loadConversations(user, allUsersList)
  }, [])

  const loadConversations = async (user: any, usersList?: any[]) => {
    const allUsersList = usersList || allUsers
    
    try {
      // Try loading from Firebase first
      const firebaseMessages = await getMessages('privateMessages');
      
      if (firebaseMessages && firebaseMessages.length > 0) {
        // Filter messages for current user
        const userMessages = firebaseMessages.filter(
          (msg: any) => msg.senderId === user.id || msg.receiverId === user.id
        );
        
        // Sync to localStorage
        const userMessagesKey = `naijaAmeboMessages_${user.id}`;
        localStorage.setItem(userMessagesKey, JSON.stringify(userMessages));
        
        processMessages(userMessages, user, allUsersList);
      } else {
        // Fallback to localStorage
        const userMessagesKey = `naijaAmeboMessages_${user.id}`;
        const userMessages = JSON.parse(localStorage.getItem(userMessagesKey) || '[]');
        processMessages(userMessages, user, allUsersList);
      }
    } catch (error) {
      console.log('Firebase loading:', error);
      // Fallback to localStorage
      const userMessagesKey = `naijaAmeboMessages_${user.id}`;
      const userMessages = JSON.parse(localStorage.getItem(userMessagesKey) || '[]');
      processMessages(userMessages, user, allUsersList);
    }
  };

  const processMessages = (userMessages: any[], user: any, allUsersList: any[]) => {
    console.log(`Loading conversations for ${user.id}`);
    console.log(`Found ${userMessages.length} messages`);

    const conversationMap = new Map<string, Conversation>();

    userMessages.forEach((msg: PrivateMessage) => {
      const otherUserId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      const otherUserName = msg.senderId === user.id ? msg.receiverName : msg.senderName;
      
      // Find the actual user object to get correct type
      const otherUser = allUsersList.find(u => u.id === otherUserId);
      const otherUserType = otherUser?.role === 'admin' ? 'admin' : 'user';

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          id: otherUserId,
          otherUserId,
          otherUserName,
          otherUserType,
          lastMessage: msg.message,
          lastTimestamp: msg.timestamp,
          unreadCount: 0
        })
      } else {
        // Update last message
        const conv = conversationMap.get(otherUserId)!
        if (new Date(msg.timestamp) > new Date(conv.lastTimestamp)) {
          conv.lastMessage = msg.message
          conv.lastTimestamp = msg.timestamp
        }
      }
    })

    // Count unread messages
    conversationMap.forEach((conv) => {
      const unread = userMessages.filter(
        (m: PrivateMessage) => m.receiverId === user.id && m.senderId === conv.otherUserId && !m.isRead
      ).length
      conv.unreadCount = unread
    })

    const conversations = Array.from(conversationMap.values()).sort((a, b) => 
      new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    )
    
    console.log(`Loaded ${conversations.length} conversations`)
    setConversations(conversations)
  }

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    // Load messages from user-specific storage key
    const userMessagesKey = `naijaAmeboMessages_${currentUser.id}`
    const allMessages = JSON.parse(localStorage.getItem(userMessagesKey) || '[]') as PrivateMessage[]
    const convMessages = allMessages.filter(
      (m: PrivateMessage) => (m.senderId === currentUser.id && m.receiverId === conversation.otherUserId) ||
           (m.senderId === conversation.otherUserId && m.receiverId === currentUser.id)
    )
    setMessages(convMessages)
    
    // Mark as read
    const updatedMessages = allMessages.map((m: PrivateMessage) => {
      if (m.receiverId === currentUser.id && m.senderId === conversation.otherUserId) {
        return { ...m, isRead: true }
      }
      return m
    })
    localStorage.setItem(userMessagesKey, JSON.stringify(updatedMessages))
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const receiverUser = allUsers.find(u => u.id === selectedConversation.otherUserId)
    
    const message: PrivateMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      receiverId: selectedConversation.otherUserId,
      receiverName: selectedConversation.otherUserName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      isAnonymous: isAnonymous && currentUser.role === 'admin'
    }

    // Store in current user's message storage
    const userMessagesKey = `naijaAmeboMessages_${currentUser.id}`
    const userMessages = JSON.parse(localStorage.getItem(userMessagesKey) || '[]')
    userMessages.push(message)
    localStorage.setItem(userMessagesKey, JSON.stringify(userMessages))

    // Also store in receiver's message storage
    const receiverMessagesKey = `naijaAmeboMessages_${selectedConversation.otherUserId}`
    const receiverMessages = JSON.parse(localStorage.getItem(receiverMessagesKey) || '[]')
    receiverMessages.push(message)
    localStorage.setItem(receiverMessagesKey, JSON.stringify(receiverMessages))
    
    // Save to Firebase (async, don't wait)
    try {
      addMessage(message, 'privateMessages');
    } catch (error) {
      console.log('Firebase save:', error);
    }

    console.log(`Message sent from ${currentUser.id} to ${selectedConversation.otherUserId}`)
    console.log(`Stored in ${userMessagesKey} and ${receiverMessagesKey}`)

    setMessages([...messages, message])
    setNewMessage('')
    loadConversations(currentUser, allUsers)
  }

  const startNewConversation = (userId: string) => {
    const user = allUsers.find(u => u.id === userId)
    if (user) {
      const conversation: Conversation = {
        id: userId,
        otherUserId: userId,
        otherUserName: `${user.firstName} ${user.lastName}`,
        otherUserType: user.role === 'admin' ? 'admin' : 'user',
        lastMessage: '',
        lastTimestamp: new Date().toISOString(),
        unreadCount: 0
      }
      setSelectedConversation(conversation)
      setShowNewConversation(false)
      setMessages([])
    }
  }

  const handleAttachment = (type: string) => {
    if (!selectedConversation || !currentUser) return

    switch(type) {
      case 'gallery':
        const imageInput = document.createElement('input')
        imageInput.type = 'file'
        imageInput.accept = 'image/*'
        imageInput.multiple = true
        imageInput.onchange = (e: any) => {
          const files = e.target.files
          if (files && files.length > 0) {
            Array.from(files).forEach((file: any) => {
              const reader = new FileReader()
              reader.onload = (event: any) => {
                const imageData = event.target.result
                const newMessage: PrivateMessage = {
                  id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  senderId: currentUser!.id,
                  senderName: `${currentUser!.firstName} ${currentUser!.lastName}`,
                  receiverId: selectedConversation.otherUserId,
                  receiverName: selectedConversation.otherUserName,
                  message: `📷 Image: ${file.name}`,
                  timestamp: new Date().toISOString(),
                  isRead: false,
                  isAnonymous: false,
                  attachments: [{ type: 'image', data: imageData }]
                }
                setMessages([...messages, newMessage])
              }
              reader.readAsDataURL(file)
            })
            alert(`✅ ${files.length} image(s) uploaded successfully!`)
          }
        }
        imageInput.click()
        break
      case 'wallet':
        const cryptoAmount = prompt('Enter crypto amount to transfer:')
        if (cryptoAmount) {
          const newMessage: PrivateMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId: currentUser!.id,
            senderName: `${currentUser!.firstName} ${currentUser!.lastName}`,
            receiverId: selectedConversation.otherUserId,
            receiverName: selectedConversation.otherUserName,
            message: `💳 Crypto transfer: ${cryptoAmount}`,
            timestamp: new Date().toISOString(),
            isRead: false,
            isAnonymous: false,
            attachments: [{ type: 'wallet', data: { amount: cryptoAmount } }]
          }
          setMessages([...messages, newMessage])
          alert(`✅ Crypto transfer of ${cryptoAmount} sent!`)
        }
        break
      case 'files':
        const fileInput = document.createElement('input')
        fileInput.type = 'file'
        fileInput.multiple = true
        fileInput.onchange = (e: any) => {
          const files = e.target.files
          if (files && files.length > 0) {
            Array.from(files).forEach((file: any) => {
              const reader = new FileReader()
              reader.onload = (event: any) => {
                const fileData = event.target.result
                const newMessage: PrivateMessage = {
                  id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  senderId: currentUser!.id,
                  senderName: `${currentUser!.firstName} ${currentUser!.lastName}`,
                  receiverId: selectedConversation.otherUserId,
                  receiverName: selectedConversation.otherUserName,
                  message: `📄 File: ${file.name}`,
                  timestamp: new Date().toISOString(),
                  isRead: false,
                  isAnonymous: false,
                  attachments: [{ type: 'file', data: fileData }]
                }
                setMessages([...messages, newMessage])
              }
              reader.readAsDataURL(file)
            })
            alert(`✅ ${files.length} file(s) uploaded successfully!`)
          }
        }
        fileInput.click()
        break
      case 'location':
        const locationMsg = prompt('Enter location (or coordinates):')
        if (locationMsg) {
          const newMessage: PrivateMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId: currentUser!.id,
            senderName: `${currentUser!.firstName} ${currentUser!.lastName}`,
            receiverId: selectedConversation.otherUserId,
            receiverName: selectedConversation.otherUserName,
            message: `📭 Location: ${locationMsg}`,
            timestamp: new Date().toISOString(),
            isRead: false,
            isAnonymous: false,
            attachments: [{ type: 'location', data: { location: locationMsg } }]
          }
          setMessages([...messages, newMessage])
          alert('✅ Location shared successfully!')
        }
        break
      case 'poll':
        const pollQuestion = prompt('Enter your poll question:')
        if (pollQuestion) {
          const newMessage: PrivateMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId: currentUser!.id,
            senderName: `${currentUser!.firstName} ${currentUser!.lastName}`,
            receiverId: selectedConversation.otherUserId,
            receiverName: selectedConversation.otherUserName,
            message: `📊 Poll: ${pollQuestion}`,
            timestamp: new Date().toISOString(),            isRead: false,
            isAnonymous: false,            attachments: [{ type: 'poll', data: { question: pollQuestion, options: ['Option 1', 'Option 2', 'Option 3'], votes: [0, 0, 0] } }]
          }
          setMessages([...messages, newMessage])
          alert('✅ Poll created successfully!')
        }
        break
      case 'contact':
        const contactName = prompt('Enter contact name:')
        if (contactName) {
          const newMessage: PrivateMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId: currentUser!.id,
            senderName: `${currentUser!.firstName} ${currentUser!.lastName}`,
            receiverId: selectedConversation.otherUserId,
            receiverName: selectedConversation.otherUserName,
            message: `👤 Contact shared: ${contactName}`,
            timestamp: new Date().toISOString(),
            isRead: false,
            isAnonymous: false,
            attachments: [{ type: 'contact', data: { name: contactName } }]
          }
          setMessages([...messages, newMessage])
          alert('✅ Contact shared successfully!')
        }
        break
      case 'music':
        const musicInput = document.createElement('input')
        musicInput.type = 'file'
        musicInput.accept = 'audio/*'
        musicInput.multiple = true
        musicInput.onchange = (e: any) => {
          const files = e.target.files
          if (files && files.length > 0) {
            Array.from(files).forEach((file: any) => {
              const reader = new FileReader()
              reader.onload = (event: any) => {
                const audioData = event.target.result
                const newMessage: PrivateMessage = {
                  id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  senderId: currentUser!.id,
                  senderName: `${currentUser!.firstName} ${currentUser!.lastName}`,
                  receiverId: selectedConversation.otherUserId,
                  receiverName: selectedConversation.otherUserName,
                  message: `🎵 Music: ${file.name}`,
                  timestamp: new Date().toISOString(),
                  isRead: false,
                  isAnonymous: false,
                  attachments: [{ type: 'music', data: audioData }]
                }
                setMessages([...messages, newMessage])
              }
              reader.readAsDataURL(file)
            })
            alert(`✅ ${files.length} audio file(s) uploaded successfully!`)
          }
        }
        musicInput.click()
        break
      case 'video':
        const videoInput = document.createElement('input')
        videoInput.type = 'file'
        videoInput.accept = 'video/*,.mp4,.webm,.avi,.mov,.mkv,.flv,.wmv'
        videoInput.multiple = true
        videoInput.onchange = (e: any) => {
          const files = e.target.files
          if (files && files.length > 0) {
            Array.from(files).forEach((file: any) => {
              const reader = new FileReader()
              reader.onload = (event: any) => {
                const videoData = event.target.result
                const newMessage: PrivateMessage = {
                  id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  senderId: currentUser!.id,
                  senderName: `${currentUser!.firstName} ${currentUser!.lastName}`,
                  receiverId: selectedConversation.otherUserId,
                  receiverName: selectedConversation.otherUserName,
                  message: `🎬 Video: ${file.name}`,
                  timestamp: new Date().toISOString(),
                  isRead: false,
                  isAnonymous: false,
                  attachments: [{ type: 'video', data: videoData }]
                }
                setMessages([...messages, newMessage])
              }
              reader.readAsDataURL(file)
            })
            alert(`✅ ${files.length} video(s) uploaded successfully! 🎬`)
          }
        }
        videoInput.click()
        break
    }
    setShowAttachmentMenu(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const filteredUsers = allUsers.filter(user =>
    user.id !== currentUser?.id &&
    (`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.username?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/community"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Community
          </Link>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <svg className="w-10 h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Private Messages
            </h1>
            <p className="text-white/90">Direct messaging with users and admins</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 h-[70vh]">
          {/* Conversations List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowNewConversation(!showNewConversation)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Message
              </button>

              {showNewConversation && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
                  {filteredUsers.map(user => {
                    const avatarInitials = `${user.firstName[0]}${user.lastName[0]}`
                    return (
                      <button
                        key={user.id}
                        onClick={() => startNewConversation(user.id)}
                        className="w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            avatarInitials
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            @{user.username || user.email?.split('@')[0]} {user.role === 'admin' && '👑'}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No conversations yet. Start a new message!
                </div>
              ) : (
                conversations.map(conv => {
                  const user = allUsers.find(u => u.id === conv.otherUserId)
                  const avatarInitials = conv.otherUserName.split(' ').map(n => n[0]).join('')
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={`w-full p-4 text-left border-b border-gray-200 dark:border-gray-700 transition-colors ${
                        selectedConversation?.id === conv.id
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            avatarInitials
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {conv.otherUserName} {conv.otherUserType === 'admin' && '👑'}
                            </p>
                            {conv.unreadCount > 0 && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {conv.lastMessage}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(conv.lastTimestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Messages View */}
          {selectedConversation ? (
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div 
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold cursor-pointer overflow-hidden"
                      onClick={() => window.location.href = `/profile/${selectedConversation.otherUserId}`}
                    >
                      {allUsers.find(u => u.id === selectedConversation.otherUserId)?.avatar ? (
                        <img 
                          src={allUsers.find(u => u.id === selectedConversation.otherUserId)?.avatar} 
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {selectedConversation.otherUserName.split(' ').map(n => n[0]).join('')}
                        </span>
                      )}
                    </div>
                    
                    {/* Name - clickable to profile */}
                    <button
                      onClick={() => window.location.href = `/profile/${selectedConversation.otherUserId}`}
                      className="text-left hover:opacity-80 transition-opacity"
                    >
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedConversation.otherUserName}
                        {selectedConversation.otherUserType === 'admin' && (
                          <span className="ml-2 text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                      </h2>
                    </button>
                  </div>
                  
                  {currentUser?.role === 'admin' && (
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Send Anonymous
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    Start the conversation!
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.senderId === currentUser?.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        {/* Display attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {msg.attachments.map((attachment, idx) => {
                              if (attachment.type === 'image' && attachment.data) {
                                return (
                                  <div key={idx} className="rounded-lg overflow-hidden max-w-xs">
                                    <img 
                                      src={attachment.data} 
                                      alt="Shared image" 
                                      className="w-full h-auto rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                                      onClick={() => window.open(attachment.data, '_blank')}
                                    />
                                  </div>
                                );
                              } else if (attachment.type === 'music' && attachment.data) {
                                return (
                                  <div key={idx} className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg">
                                    <audio 
                                      controls 
                                      className="w-full h-6"
                                      src={attachment.data}
                                    />
                                  </div>
                                );
                              } else if (attachment.type === 'voice' && attachment.data) {
                                return (
                                  <div key={idx} className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                    <span className="text-xs">Voice message</span>
                                  </div>
                                );
                              } else if (attachment.type === 'video' && attachment.data) {
                                // Check if it's a recorded video (has duration property) or uploaded video (is base64 string)
                                const isRecorded = typeof attachment.data === 'object' && attachment.data.duration;
                                if (isRecorded) {
                                  return (
                                    <div key={idx} className="bg-cyan-100 dark:bg-cyan-900/50 p-2 rounded-lg flex items-center space-x-2">
                                      <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                      </svg>
                                      <span className="text-xs">Video message</span>
                                    </div>
                                  );
                                } else {
                                  // Uploaded video file
                                  return (
                                    <div key={idx} className="rounded-lg overflow-hidden max-w-xs bg-black">
                                      <video 
                                        controls 
                                        className="w-full h-auto rounded-lg"
                                        src={attachment.data}
                                      />
                                    </div>
                                  );
                                }
                              } else if (attachment.type === 'file' && attachment.data) {
                                return (
                                  <div key={idx} className="bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-lg">
                                    <a 
                                      href={attachment.data} 
                                      download 
                                      className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300 text-xs hover:underline"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                      </svg>
                                      <span>Download file</span>
                                    </a>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        )}
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                          {msg.isAnonymous && ' (Anonymous)'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                  />
                  <div className="relative">
                    <button
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      📎
                    </button>
                    {showAttachmentMenu && (
                      <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 grid grid-cols-2 gap-2 w-48 z-50">
                        <button onClick={() => handleAttachment('gallery')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          🖼️ Gallery
                        </button>
                        <button onClick={() => handleAttachment('wallet')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          💳 Wallet
                        </button>
                        <button onClick={() => handleAttachment('files')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          📄 Files
                        </button>
                        <button onClick={() => handleAttachment('location')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          📍 Location
                        </button>
                        <button onClick={() => handleAttachment('poll')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          📊 Poll
                        </button>
                        <button onClick={() => handleAttachment('contact')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          👤 Contact
                        </button>
                        <button onClick={() => handleAttachment('music')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          🎵 Music
                        </button>
                        <button onClick={() => handleAttachment('video')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          🎬 Video
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={sendMessage}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedConversation || !currentUser) return
                      const newCallMessage: PrivateMessage = {
                        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        senderId: currentUser!.id,
                        senderName: `${currentUser!.firstName} ${currentUser!.lastName}`,
                        receiverId: selectedConversation.otherUserId,
                        receiverName: selectedConversation.otherUserName,
                        message: `📞 Started a voice call`,
                        timestamp: new Date().toISOString(),
                        isRead: false,
                        isAnonymous: false
                      }
                      setMessages([...messages, newCallMessage])
                      alert(`📞 Voice call initiated with ${selectedConversation.otherUserName}!`)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                    title="Start Voice Call"
                  >
                    📞
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedConversation || !currentUser) return
                      const newCallMessage: PrivateMessage = {
                        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        senderId: currentUser!.id,
                        senderName: `${currentUser!.firstName} ${currentUser!.lastName}`,
                        receiverId: selectedConversation.otherUserId,
                        receiverName: selectedConversation.otherUserName,
                        message: `📹 Started a video call`,
                        timestamp: new Date().toISOString(),
                        isRead: false,
                        isAnonymous: false
                      }
                      setMessages([...messages, newCallMessage])
                      alert(`📹 Video call initiated with ${selectedConversation.otherUserName}!`)
                    }}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold transition-colors"
                    title="Start Video Call"
                  >
                    📹
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-xl">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
