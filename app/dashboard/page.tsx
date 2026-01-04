"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  isVerified?: boolean;
  role?: string;
  createdAt?: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'settings'>('profile');

  useEffect(() => {
    setIsMounted(true);
    
    // Check if user is logged in
    const userSession = localStorage.getItem('naijaAmeboCurrentUser');
    const adminSession = localStorage.getItem('naijaAmeboCurrentAdmin');
    
    if (userSession) {
      try {
        const user = JSON.parse(userSession);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('naijaAmeboCurrentUser');
        router.push('/login');
      }
    } else if (adminSession) {
      // Admins should go to their admin dashboard
      router.push('/admin');
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('naijaAmeboCurrentUser');
    router.push('/');
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      // Update in localStorage
      const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]');
      const updatedUsers = users.map((u: UserData) =>
        u.id === currentUser.id ? currentUser : u
      );
      localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers));
      localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(currentUser));
      alert('Profile updated successfully!');
    }
  };

  if (!isMounted || !isLoggedIn || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dashboard Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.firstName}
                  className="w-20 sm:w-24 md:w-28 h-20 sm:h-24 md:h-28 rounded-full border-4 border-white object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-20 sm:w-24 md:w-28 h-20 sm:h-24 md:h-28 rounded-full bg-white/20 flex items-center justify-center border-4 border-white text-2xl sm:text-3xl md:text-4xl font-bold flex-shrink-0">
                  {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                </div>
              )}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{currentUser.firstName} {currentUser.lastName}</h1>
                <p className="text-base sm:text-lg md:text-xl text-white/80">@{currentUser.username}</p>
                <p className="text-sm sm:text-base text-white/70 mt-2">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base flex-shrink-0"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'profile'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              👤 My Profile
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'activity'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              📊 Activity
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              ⚙️ Settings
            </button>
          </div>

          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={currentUser.firstName}
                      onChange={(e) => setCurrentUser({...currentUser, firstName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={currentUser.lastName}
                      onChange={(e) => setCurrentUser({...currentUser, lastName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={currentUser.username}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={currentUser.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={currentUser.phone || ''}
                      onChange={(e) => setCurrentUser({...currentUser, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Add your phone number"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={currentUser.bio || ''}
                      onChange={(e) => setCurrentUser({...currentUser, bio: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 min-h-24"
                      placeholder="Write something about yourself..."
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpdateProfile}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Activity</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 text-center border border-purple-200 dark:border-purple-800">
                    <div className="text-3xl font-bold text-purple-600">0</div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Posts Shared</p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center border border-blue-200 dark:border-blue-800">
                    <div className="text-3xl font-bold text-blue-600">0</div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Messages Sent</p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 text-center border border-green-200 dark:border-green-800">
                    <div className="text-3xl font-bold text-green-600">0</div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Friends</p>
                  </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
                  <p className="text-gray-600 dark:text-gray-400">Account created on {new Date(currentUser.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Email Notifications</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates about new messages and activity</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-6 h-6 text-purple-600 rounded" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Push Notifications</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get notified on your browser</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-6 h-6 text-purple-600 rounded" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Private Profile</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Make your profile visible only to friends</p>
                    </div>
                    <input type="checkbox" className="w-6 h-6 text-purple-600 rounded" />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Danger Zone</h3>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Link href="/community" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-105 transition-all">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Community</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Join discussions</p>
          </Link>

          <Link href="/private-messages" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-105 transition-all">
            <div className="text-4xl mb-3">✉️</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Messages</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Conversations</p>
          </Link>

          <Link href="/group-chats" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-105 transition-all">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Group Chats</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">With friends</p>
          </Link>

          <Link href="/channels" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-105 transition-all">
            <div className="text-4xl mb-3">#</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Channels</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Topics</p>
          </Link>

          <Link href="/submit-news" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-105 transition-all">
            <div className="text-4xl mb-3">📰</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Submit News</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Share story</p>
          </Link>

          <Link href={`/profile/${currentUser.id}`} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-105 transition-all">
            <div className="text-4xl mb-3">👤</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">My Profile</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Your profile</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
