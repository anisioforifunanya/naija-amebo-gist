"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import LocationTracker from '@/components/LocationTracker';
import { addMessage, getMessages, getCurrentUser, setCurrentUser } from '@/lib/firebaseUtils';

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
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  message: string;
  timestamp: string;
  reactions: { [emoji: string]: string[] }; // emoji -> array of userIds
  isDeleted?: boolean;
  attachments?: {
    type: 'image' | 'file' | 'location' | 'poll' | 'contact' | 'music' | 'voice' | 'video';
    data: any;
  }[];
}

export default function Community() {
  const [currentUser, setCurrentUser] = useState<UserData | AdminData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<UserData[]>([]);
  const [allAdmins, setAllAdmins] = useState<AdminData[]>([]);
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'voice' | 'video'>('voice');
  const [isRecording, setIsRecording] = useState(false);
  const [showLocationTracker, setShowLocationTracker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if user or admin is logged in
    let userSession = localStorage.getItem('naijaAmeboCurrentUser');
    let adminSession = localStorage.getItem('naijaAmeboCurrentAdmin');
    
    if (!userSession && !adminSession) {
      window.location.href = '/login';
      return;
    }

    // Use either user or admin session
    let user = userSession ? JSON.parse(userSession) : adminSession ? JSON.parse(adminSession) : null;

    if (!user) {
      window.location.href = '/login';
      return;
    }

    // Check if user is banned (only applicable to regular users, not admins)
    if (userSession && user.isBanned) {
      alert('Your account has been banned. Reason: ' + (user.banReason || 'No reason provided'));
      localStorage.removeItem('naijaAmeboCurrentUser');
      window.location.href = '/login';
      return;
    }

    // Check if user has completed facial verification and been approved (only for regular users, not admins)
    if (userSession && user.role !== 'admin') {
      if (user.verificationStatus !== 'approved' || user.accountStatus !== 'approved') {
        alert('⚠️ Your account is awaiting admin verification. You cannot access community features yet.');
        window.location.href = '/verification-pending';
        return;
      }
    }

    // Check if user is restricted (only applicable to regular users, not admins)
    if (userSession && user.isRestricted) {
      const now = new Date();
      const expiresAt = user.restrictionExpires ? new Date(user.restrictionExpires) : null;
      if (!expiresAt || now < expiresAt) {
        alert('Your account is restricted. Reason: ' + (user.restrictionReason || 'No reason provided'));
        localStorage.removeItem('naijaAmeboCurrentUser');
        window.location.href = '/login';
        return;
      } else {
        // Restriction expired, remove it
        user.isRestricted = false;
        user.restrictionReason = undefined;
        user.restrictionExpires = undefined;
        localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(user));
        // Update in users list
        const allUsers = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]');
        const userIndex = allUsers.findIndex((u: UserData) => u.id === user.id);
        if (userIndex > -1) {
          allUsers[userIndex] = user;
          localStorage.setItem('naijaAmeboUsers', JSON.stringify(allUsers));
        }
      }
    }

    setCurrentUser(user);
    
    // Save current user to Firebase
    try {
      setCurrentUser(user);
    } catch (error) {
      console.log('Firebase sync:', error);
    }

    // Load messages from Firebase
    const loadMessages = async () => {
      try {
        const firebaseMessages = await getMessages('messages');
        if (firebaseMessages && firebaseMessages.length > 0) {
          setMessages(firebaseMessages as ChatMessage[]);
          // Sync to localStorage as backup
          localStorage.setItem('naijaAmeboChatMessages', JSON.stringify(firebaseMessages));
        } else {
          // Fallback to localStorage
          const savedMessages = localStorage.getItem('naijaAmeboChatMessages');
          if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
          }
        }
      } catch (error) {
        console.log('Loading messages:', error);
        // Fallback to localStorage
        const savedMessages = localStorage.getItem('naijaAmeboChatMessages');
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      }
    };

    loadMessages();

    // Load online users (simulated - in production this would be real-time)
    const allUsers = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]');
    setOnlineUsers(allUsers.slice(0, 5)); // Show first 5 users as "online" for demo

    // Load admins
    const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]');
    setAllAdmins(admins);
    
    // Add admins to online users list
    const combinedOnlineUsers = [...allUsers.slice(0, 3), ...admins.slice(0, 2)];
    setOnlineUsers(combinedOnlineUsers);

    // Load anonymous mode
    const anonymousMode = localStorage.getItem('naijaAmeboAnonymousMode');
    setIsAnonymousMode(anonymousMode === 'true');
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser!.id,
      // For users, use username; for admins, use firstName + lastName with 👑
      username: (currentUser as any).username 
        ? (currentUser as any).username 
        : `${currentUser!.firstName} ${currentUser!.lastName}${currentUser!.role === 'admin' ? ' 👑' : ''}`,
      firstName: currentUser!.firstName,
      lastName: currentUser!.lastName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      reactions: {}
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    
    // Save to both localStorage and Firebase
    localStorage.setItem('naijaAmeboChatMessages', JSON.stringify(updatedMessages));
    
    // Save to Firebase (async, don't wait)
    try {
      addMessage(message, 'messages');
    } catch (error) {
      console.log('Firebase save:', error);
    }
    
    setNewMessage('');
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!currentUser) return;

    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        if (!reactions[emoji]) {
          reactions[emoji] = [];
        }

        const userIndex = reactions[emoji].indexOf(currentUser!.id);
        if (userIndex > -1) {
          // Remove reaction
          reactions[emoji].splice(userIndex, 1);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
        } else {
          // Add reaction
          reactions[emoji].push(currentUser!.id);
        }

        return { ...msg, reactions };
      }
      return msg;
    });

    setMessages(updatedMessages);
    localStorage.setItem('naijaAmeboChatMessages', JSON.stringify(updatedMessages));
  };

  const handleLogout = () => {
    localStorage.removeItem('naijaAmeboCurrentUser');
    localStorage.removeItem('naijaAmeboCurrentAdmin');
    window.location.href = '/';
  };

  const handleAttachment = (type: string) => {
    if (!currentUser) return; // Guard clause
    
    switch(type) {
      case 'gallery':
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = 'image/*';
        imageInput.multiple = true;
        imageInput.onchange = (e: any) => {
          const files = e.target.files;
          if (files && files.length > 0 && currentUser) {
            Array.from(files).forEach((file: any) => {
              const reader = new FileReader();
              reader.onload = (event: any) => {
                const imageData = event.target.result;
                const newMessage: ChatMessage = {
                  id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  userId: currentUser!.id,
                  username: (currentUser as any).username || 'anonymous',
                  firstName: currentUser!.firstName,
                  lastName: currentUser!.lastName,
                  message: `📷 Image: ${file.name}`,
                  timestamp: new Date().toISOString(),
                  reactions: {},
                  attachments: [{
                    type: 'image',
                    data: imageData
                  }]
                };
                setMessages([...messages, newMessage]);
              };
              reader.readAsDataURL(file);
            });
            alert(`✅ ${files.length} image(s) uploaded successfully!`);
          }
        };
        imageInput.click();
        break;
      case 'wallet':
        alert('💳 Crypto transfer is only available in private chats. Feature coming soon!');
        break;
      case 'files':
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.onchange = (e: any) => {
          const files = e.target.files;
          if (files && files.length > 0 && currentUser) {
            Array.from(files).forEach((file: any) => {
              const reader = new FileReader();
              reader.onload = (event: any) => {
                const fileData = event.target.result;
                const newMessage: ChatMessage = {
                  id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  userId: currentUser!.id,
                  username: (currentUser as any).username || 'anonymous',
                  firstName: currentUser!.firstName,
                  lastName: currentUser!.lastName,
                  message: `📄 File: ${file.name}`,
                  timestamp: new Date().toISOString(),
                  reactions: {},
                  attachments: [{
                    type: 'file',
                    data: fileData
                  }]
                };
                setMessages([...messages, newMessage]);
              };
              reader.readAsDataURL(file);
            });
            alert(`✅ ${files.length} file(s) uploaded successfully!`);
          }
        };
        fileInput.click();
        break;
      case 'location':
        setShowLocationTracker(true);
        setShowAttachmentMenu(false);
        break;
      case 'poll':
        const pollQuestion = prompt('Enter your poll question:');
        if (pollQuestion) {
          const newMessage: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: currentUser!.id,
            username: (currentUser as any).username || 'anonymous',
            firstName: currentUser!.firstName,
            lastName: currentUser!.lastName,
            message: `📊 Poll: ${pollQuestion}`,
            timestamp: new Date().toISOString(),
            reactions: {},
            attachments: [{
              type: 'poll',
              data: { question: pollQuestion, options: ['Option 1', 'Option 2', 'Option 3'], votes: [0, 0, 0] }
            }]
          };
          setMessages([...messages, newMessage]);
          alert('✅ Poll created successfully!');
        }
        break;
      case 'contact':
        const contactName = prompt('Enter contact name:');
        if (contactName) {
          const newMessage: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: currentUser!.id,
            username: (currentUser as any).username || 'anonymous',
            firstName: currentUser!.firstName,
            lastName: currentUser!.lastName,
            message: `👤 Contact shared: ${contactName}`,
            timestamp: new Date().toISOString(),
            reactions: {},
            attachments: [{
              type: 'contact',
              data: { name: contactName }
            }]
          };
          setMessages([...messages, newMessage]);
          alert('✅ Contact shared successfully!');
        }
        break;
      case 'music':
        const musicInput = document.createElement('input');
        musicInput.type = 'file';
        musicInput.accept = 'audio/*';
        musicInput.multiple = true;
        musicInput.onchange = (e: any) => {
          const files = e.target.files;
          if (files && files.length > 0 && currentUser) {
            Array.from(files).forEach((file: any) => {
              const reader = new FileReader();
              reader.onload = (event: any) => {
                const audioData = event.target.result;
                const newMessage: ChatMessage = {
                  id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  userId: currentUser!.id,
                  username: (currentUser as any).username || 'anonymous',
                  firstName: currentUser!.firstName,
                  lastName: currentUser!.lastName,
                  message: `🎵 Music: ${file.name}`,
                  timestamp: new Date().toISOString(),
                  reactions: {},
                  attachments: [{
                    type: 'music',
                    data: audioData
                  }]
                };
                setMessages([...messages, newMessage]);
              };
              reader.readAsDataURL(file);
            });
            alert(`✅ ${files.length} audio file(s) uploaded successfully!`);
          }
        };
        musicInput.click();
        break;
      case 'video':
        const videoInput = document.createElement('input');
        videoInput.type = 'file';
        videoInput.accept = 'video/*,.mp4,.webm,.avi,.mov,.mkv,.flv,.wmv';
        videoInput.multiple = true;
        videoInput.onchange = (e: any) => {
          const files = e.target.files;
          if (files && files.length > 0 && currentUser) {
            Array.from(files).forEach((file: any) => {
              const reader = new FileReader();
              reader.onload = (event: any) => {
                const videoData = event.target.result;
                const newMessage: ChatMessage = {
                  id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  userId: currentUser!.id,
                  username: (currentUser as any).username || 'anonymous',
                  firstName: currentUser!.firstName,
                  lastName: currentUser!.lastName,
                  message: `🎬 Video: ${file.name}`,
                  timestamp: new Date().toISOString(),
                  reactions: {},
                  attachments: [{
                    type: 'video',
                    data: videoData
                  }]
                };
                setMessages([...messages, newMessage]);
              };
              reader.readAsDataURL(file);
            });
            alert(`✅ ${files.length} video(s) uploaded successfully! 🎬`);
          }
        };
        videoInput.click();
        break;
    }
    setShowAttachmentMenu(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (!currentUser) return;
      const recordingType = recordingMode === 'voice' ? '🎤 Voice' : '📹 Video';
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: currentUser!.id,
        username: (currentUser as any).username || 'anonymous',
        firstName: currentUser!.firstName,
        lastName: currentUser!.lastName,
        message: `${recordingType} message recorded`,
        timestamp: new Date().toISOString(),
        reactions: {},
        attachments: [{
          type: recordingMode === 'voice' ? 'voice' : 'video',
          data: { duration: '0:30', timestamp: new Date().toISOString() }
        }]
      };
      setMessages([...messages, newMessage]);
      alert(`✅ ${recordingMode === 'voice' ? 'Voice' : 'Video'} recording uploaded successfully!`);
    } else {
      setIsRecording(true);
      alert(`🔴 ${recordingMode === 'voice' ? 'Voice' : 'Video'} recording started. Click again to stop.`);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {currentUser.role === 'admin' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  title="Back to Admin Dashboard"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
              )}
              <Link href="/" className="text-xl font-bold text-purple-600">
                Naija Amebo Gist
              </Link>
              <span className="text-gray-500 dark:text-gray-400">|</span>
              <span className="text-gray-600 dark:text-gray-300">Community Chat</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {currentUser.firstName}!
              </span>
              {currentUser.role === 'admin' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-pink-600 font-semibold transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Dashboard</span>
                </Link>
              )}
              <Link
                href="/private-messages"
                className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded-lg hover:from-blue-600 hover:to-cyan-600 font-semibold transition-all"
              >
                <span>💬</span>
                <span>Messages</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Community Discussion
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect with fellow gossip lovers and share the latest buzz!
                </p>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p>No messages yet. Be the first to start the conversation!</p>
                  </div>
                ) : (
                  messages
                    .filter(msg => !msg.isDeleted)
                    .map((msg) => {
                      const isAdmin = allAdmins.find((u: AdminData) => u.id === msg.userId)?.role === 'admin';
                      const userOrAdmin = allAdmins.find((u: AdminData) => u.id === msg.userId) || onlineUsers.find(u => u.id === msg.userId);
                      const avatarInitials = `${msg.firstName[0]}${msg.lastName[0]}`;
                      
                      return (
                        <div key={msg.id} className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${
                                isAdmin ? 'bg-purple-500' : 'bg-blue-500'
                              }`}
                              onClick={() => window.location.href = `/profile/${msg.userId}`}
                            >
                              {userOrAdmin?.avatar ? (
                                <img src={userOrAdmin.avatar} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white text-sm font-medium">
                                  {avatarInitials}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => window.location.href = `/profile/${msg.userId}`}
                                className="text-sm font-medium text-gray-900 dark:text-white hover:underline cursor-pointer text-left"
                              >
                                {isAnonymousMode && isAdmin ? 'Anonymous Admin' : `${msg.firstName} ${msg.lastName}`}
                                {isAdmin && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded ml-2">Admin</span>}
                              </button>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                @{isAnonymousMode && isAdmin ? 'admin' : msg.username}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(msg.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {msg.message}
                            </p>
                            {/* Display attachments */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {msg.attachments.map((attachment, idx) => {
                                  if (attachment.type === 'image' && attachment.data) {
                                    return (
                                      <div key={idx} className="rounded-lg overflow-hidden max-w-xs">
                                        <img 
                                          src={attachment.data} 
                                          alt="Shared image" 
                                          className="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                          onClick={() => window.open(attachment.data, '_blank')}
                                        />
                                      </div>
                                    );
                                  } else if (attachment.type === 'music' && attachment.data) {
                                    return (
                                      <div key={idx} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-3 rounded-lg">
                                        <audio 
                                          controls 
                                          className="w-full"
                                          src={attachment.data}
                                        />
                                      </div>
                                    );
                                  } else if (attachment.type === 'voice' && attachment.data) {
                                    return (
                                      <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                          </svg>
                                          <span className="text-sm text-blue-700 dark:text-blue-300">Voice message • {attachment.data.duration}</span>
                                        </div>
                                      </div>
                                    );
                                  } else if (attachment.type === 'video' && attachment.data) {
                                    // Check if it's a recorded video (has duration property) or uploaded video (is base64 string)
                                    const isRecorded = typeof attachment.data === 'object' && attachment.data.duration;
                                    if (isRecorded) {
                                      return (
                                        <div key={idx} className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 p-3 rounded-lg">
                                          <div className="flex items-center space-x-2">
                                            <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                            </svg>
                                            <span className="text-sm text-cyan-700 dark:text-cyan-300">Video message • {attachment.data.duration}</span>
                                          </div>
                                        </div>
                                      );
                                    } else {
                                      // Uploaded video file
                                      return (
                                        <div key={idx} className="rounded-lg overflow-hidden max-w-md bg-black">
                                          <video 
                                            controls 
                                            className="w-full h-auto rounded-lg shadow-md"
                                            src={attachment.data}
                                          />
                                        </div>
                                      );
                                    }
                                  } else if (attachment.type === 'file' && attachment.data) {
                                    return (
                                      <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
                                        <a 
                                          href={attachment.data} 
                                          download 
                                          className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200"
                                        >
                                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                          </svg>
                                          <span className="text-sm underline">Download file</span>
                                        </a>
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            )}
                            {/* Reactions */}
                            {Object.keys(msg.reactions).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReaction(msg.id, emoji)}
                                    className={`text-xs px-2 py-1 rounded-full border ${
                                      userIds.includes(currentUser.id)
                                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                                        : 'bg-gray-100 border-gray-300 text-gray-700'
                                    }`}
                                  >
                                    {emoji} {userIds.length}
                                  </button>
                                ))}
                              </div>
                            )}
                            {/* Add reaction buttons */}
                            <div className="flex gap-1 mt-2">
                              {['👍', '❤️', '😂', '😮', '😢'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(msg.id, emoji)}
                                  className="text-xs hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <div className="flex items-end space-x-2">
                    {/* Attachment Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                        className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Attachments"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </button>

                      {/* Attachment Menu */}
                      {showAttachmentMenu && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-3 w-80">
                          <div className="grid grid-cols-5 gap-3">
                            {/* Gallery */}
                            <button
                              type="button"
                              onClick={() => handleAttachment('gallery')}
                              className="flex flex-col items-center p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
                            >
                              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Gallery</span>
                            </button>

                            {/* Wallet */}
                            <button
                              type="button"
                              onClick={() => handleAttachment('wallet')}
                              className="flex flex-col items-center p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                            >
                              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                              </div>
                              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Wallet</span>
                            </button>

                            {/* Files */}
                            <button
                              type="button"
                              onClick={() => handleAttachment('files')}
                              className="flex flex-col items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                            >
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Files</span>
                            </button>

                            {/* Location */}
                            <button
                              type="button"
                              onClick={() => handleAttachment('location')}
                              className="flex flex-col items-center p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                            >
                              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Location</span>
                            </button>

                            {/* Poll */}
                            <button
                              type="button"
                              onClick={() => handleAttachment('poll')}
                              className="flex flex-col items-center p-3 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors group"
                            >
                              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                              </div>
                              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Poll</span>
                            </button>

                            {/* Contact */}
                            <button
                              type="button"
                              onClick={() => handleAttachment('contact')}
                              className="flex flex-col items-center p-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
                            >
                              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-2 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Contact</span>
                            </button>

                            {/* Music */}
                            <button
                              type="button"
                              onClick={() => handleAttachment('music')}
                              className="flex flex-col items-center p-3 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors group"
                            >
                              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-2 group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors">
                                <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                              </div>
                              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Music</span>
                            </button>

                            {/* Video */}
                            <button
                              type="button"
                              onClick={() => handleAttachment('video')}
                              className="flex flex-col items-center p-3 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
                            >
                              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-2 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Video</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      maxLength={500}
                    />

                    {/* Voice/Video Toggle */}
                    <button
                      type="button"
                      onClick={() => setRecordingMode(recordingMode === 'voice' ? 'video' : 'voice')}
                      className={`p-2.5 rounded-lg transition-all ${
                        isRecording 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={`Switch to ${recordingMode === 'voice' ? 'Video' : 'Voice'} Note`}
                    >
                      {recordingMode === 'voice' ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>

                    {/* Record Button */}
                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={`p-2.5 rounded-lg transition-all ${
                        isRecording
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                      title={isRecording ? 'Stop Recording' : `Start ${recordingMode === 'voice' ? 'Voice' : 'Video'} Recording`}
                    >
                      {isRecording ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 6h12v12H6z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="8" />
                        </svg>
                      )}
                    </button>

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-all duration-200 hover:shadow-xl disabled:hover:shadow-lg"
                    >
                      Send
                    </button>

                    {/* Voice Call Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const newCallMessage: ChatMessage = {
                          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                          userId: currentUser.id,
                          username: (currentUser as any).username || 'anonymous',
                          firstName: currentUser.firstName,
                          lastName: currentUser.lastName,
                          message: `📞 Started a voice call in the community`,
                          timestamp: new Date().toISOString(),
                          reactions: {}
                        };
                        setMessages([...messages, newCallMessage]);
                        alert(`📞 Voice call initiated! All community members are invited.`);
                      }}
                      className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
                      title="Start Voice Call"
                    >
                      📞 Call
                    </button>

                    {/* Video Call Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const newCallMessage: ChatMessage = {
                          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                          userId: currentUser.id,
                          username: (currentUser as any).username || 'anonymous',
                          firstName: currentUser.firstName,
                          lastName: currentUser.lastName,
                          message: `📹 Started a video call in the community`,
                          timestamp: new Date().toISOString(),
                          reactions: {}
                        };
                        setMessages([...messages, newCallMessage]);
                        alert(`📹 Video call initiated! All community members are invited.`);
                      }}
                      className="px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
                      title="Start Video Call"
                    >
                      📹 Video
                    </button>
                  </div>
                  {isRecording && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                        Recording {recordingMode === 'voice' ? 'voice' : 'video'} note...
                      </span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Online Users */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Online Members ({onlineUsers.length})
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {onlineUsers.map((user) => {
                    const currentUser = JSON.parse(localStorage.getItem('naijaAmeboCurrentUser') || '{}')
                    const isCurrentUserProfile = currentUser?.id === user.id
                    const isFollowing = currentUser?.following?.includes(user.id) || false
                    const isSubscribed = currentUser?.subscribers?.includes(user.id) || false
                    
                    const handleFollow = () => {
                      if (currentUser.id === user.id) {
                        alert('You cannot follow yourself!')
                        return
                      }
                      
                      const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
                      const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
                      
                      const updatedUsers = users.map((u: any) => {
                        if (u.id === currentUser.id) {
                          const following = u.following || []
                          if (!following.includes(user.id)) following.push(user.id)
                          return { ...u, following }
                        }
                        return u
                      })
                      
                      const updatedProfileUsers = [...updatedUsers].map((u: any) => {
                        if (u.id === user.id) {
                          const followers = u.followers || []
                          if (!followers.includes(currentUser.id)) followers.push(currentUser.id)
                          return { ...u, followers }
                        }
                        return u
                      })
                      
                      const updatedAdmins = admins.map((a: any) => {
                        if (a.id === user.id) {
                          const followers = a.followers || []
                          if (!followers.includes(currentUser.id)) followers.push(currentUser.id)
                          return { ...a, followers }
                        }
                        return a
                      })
                      
                      localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedProfileUsers))
                      localStorage.setItem('naijaAmeboAdmins', JSON.stringify(updatedAdmins))
                      localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(updatedUsers[0] || currentUser))
                      alert('You are now following this user!')
                      window.location.reload()
                    }
                    
                    const handleUnfollow = () => {
                      const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
                      const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
                      
                      const updatedUsers = users.map((u: any) => {
                        if (u.id === currentUser.id) {
                          const following = (u.following || []).filter((id: string) => id !== user.id)
                          return { ...u, following }
                        }
                        return u
                      })
                      
                      const updatedProfileUsers = [...updatedUsers].map((u: any) => {
                        if (u.id === user.id) {
                          const followers = (u.followers || []).filter((id: string) => id !== currentUser.id)
                          return { ...u, followers }
                        }
                        return u
                      })
                      
                      const updatedAdmins = admins.map((a: any) => {
                        if (a.id === user.id) {
                          const followers = (a.followers || []).filter((id: string) => id !== currentUser.id)
                          return { ...a, followers }
                        }
                        return a
                      })
                      
                      localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedProfileUsers))
                      localStorage.setItem('naijaAmeboAdmins', JSON.stringify(updatedAdmins))
                      localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(updatedUsers[0] || currentUser))
                      alert('You unfollowed this user!')
                      window.location.reload()
                    }
                    
                    const handleSubscribe = () => {
                      if (currentUser.id === user.id) {
                        alert('You cannot subscribe to yourself!')
                        return
                      }
                      
                      const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
                      const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
                      
                      const updatedProfileUsers = users.map((u: any) => {
                        if (u.id === user.id) {
                          const subscribers = u.subscribers || []
                          if (!subscribers.includes(currentUser.id)) subscribers.push(currentUser.id)
                          return { ...u, subscribers }
                        }
                        return u
                      })
                      
                      const updatedAdmins = admins.map((a: any) => {
                        if (a.id === user.id) {
                          const subscribers = a.subscribers || []
                          if (!subscribers.includes(currentUser.id)) subscribers.push(currentUser.id)
                          return { ...a, subscribers }
                        }
                        return a
                      })
                      
                      localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedProfileUsers))
                      localStorage.setItem('naijaAmeboAdmins', JSON.stringify(updatedAdmins))
                      alert('You subscribed to this user!')
                      window.location.reload()
                    }
                    
                    const handleUnsubscribe = () => {
                      const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
                      const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
                      
                      const updatedProfileUsers = users.map((u: any) => {
                        if (u.id === user.id) {
                          const subscribers = (u.subscribers || []).filter((id: string) => id !== currentUser.id)
                          return { ...u, subscribers }
                        }
                        return u
                      })
                      
                      const updatedAdmins = admins.map((a: any) => {
                        if (a.id === user.id) {
                          const subscribers = (a.subscribers || []).filter((id: string) => id !== currentUser.id)
                          return { ...a, subscribers }
                        }
                        return a
                      })
                      
                      localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedProfileUsers))
                      localStorage.setItem('naijaAmeboAdmins', JSON.stringify(updatedAdmins))
                      alert('You unsubscribed from this user!')
                      window.location.reload()
                    }

                    const handleSendMessage = () => {
                      const conversations = JSON.parse(localStorage.getItem('naijaAmeboConversations') || '[]')
                      
                      let conversationId = conversations.find((conv: any) => {
                        const participantIds = [conv.participantId1, conv.participantId2].sort()
                        const currentIds = [currentUser.id, user.id].sort()
                        return participantIds[0] === currentIds[0] && participantIds[1] === currentIds[1]
                      })?.id

                      if (!conversationId) {
                        conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                        conversations.push({
                          id: conversationId,
                          participantId1: currentUser.id,
                          participantId2: user.id,
                          participant1Name: `${currentUser.firstName} ${currentUser.lastName}`,
                          participant2Name: `${user.firstName} ${user.lastName}`,
                          createdAt: new Date().toISOString(),
                          messages: []
                        })
                        localStorage.setItem('naijaAmeboConversations', JSON.stringify(conversations))
                      }

                      localStorage.setItem('naijaAmeboActiveConversation', conversationId)
                      window.location.href = `/private-messages?conversationId=${conversationId}`
                    }
                    
                    return (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3 flex-1">
                          <div 
                            className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                            onClick={() => window.location.href = `/profile/${user.id}`}
                          >
                            {user.avatar ? (
                              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white text-sm font-medium">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <button
                              onClick={() => window.location.href = `/profile/${user.id}`}
                              className="text-sm font-medium text-gray-900 dark:text-white hover:underline cursor-pointer text-left"
                            >
                              {user.firstName} {user.lastName}
                            </button>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                        {!isCurrentUserProfile && (
                          <div className="flex gap-2">
                            <button
                              onClick={isFollowing ? handleUnfollow : handleFollow}
                              className={`text-xs px-3 py-1 rounded font-semibold transition-all ${
                                isFollowing
                                  ? 'bg-purple-200 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            >
                              {isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                            <button
                              onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                              className={`text-xs px-3 py-1 rounded font-semibold transition-all ${
                                isSubscribed
                                  ? 'bg-green-200 dark:bg-green-900 text-green-700 dark:text-green-300'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                            </button>
                            <button
                              onClick={handleSendMessage}
                              title="Send Direct Message"
                              className="text-xs px-3 py-1 rounded font-semibold transition-all bg-blue-600 text-white hover:bg-blue-700"
                            >
                              💬
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Your Profile */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Profile
                </h3>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {currentUser.firstName[0]}{currentUser.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {currentUser.firstName} {currentUser.lastName}
                      {currentUser.role === 'admin' && <span className="ml-1">👑</span>}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{(currentUser as any).username || currentUser.email?.split('@')[0]}
                    </p>
                  </div>
                </div>
                {currentUser.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {currentUser.bio}
                  </p>
                )}
                <div className="space-y-2">
                  {(currentUser as any).location && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      📍 {(currentUser as any).location}
                    </p>
                  )}
                  {(currentUser as any).interests && (currentUser as any).interests.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Interests:</p>
                      <div className="flex flex-wrap gap-1">
                        {(currentUser as any).interests.slice(0, 3).map((interest: string) => (
                          <span
                            key={interest}
                            className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                        {(currentUser as any).interests.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{(currentUser as any).interests.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Community Guidelines
                </h3>
              </div>
              <div className="p-4">
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>• Be respectful to all members</li>
                  <li>• No hate speech or harassment</li>
                  <li>• Keep discussions appropriate</li>
                  <li>• Share accurate information</li>
                  <li>• Have fun and enjoy the gossip! 🎉</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Tracker Modal */}
      {showLocationTracker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl">
            <LocationTracker
              enableTracking={true}
              showMap={true}
              height="500px"
              onLocationUpdate={(position) => {
                console.log('Location updated:', position.coords.latitude, position.coords.longitude);
              }}
              onClose={() => setShowLocationTracker(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}