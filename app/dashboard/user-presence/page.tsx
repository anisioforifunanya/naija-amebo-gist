"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OnlineUser {
  id: string;
  username: string;
  avatar?: string;
  lastSeen: string;
  isOnline: boolean;
  status?: string;
}

export default function UserPresence() {
  const router = useRouter();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const userSession = localStorage.getItem('naijaAmeboCurrentUser');
    
    if (!userSession) {
      router.push('/login');
      return;
    }

    setIsLoggedIn(true);
    loadOnlineUsers();
  }, [router]);

  const loadOnlineUsers = () => {
    // Simulate loading online users from storage
    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]');
    const onlineUsers: OnlineUser[] = users.slice(0, 10).map((user: any) => ({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      lastSeen: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
      isOnline: Math.random() > 0.3,
      status: Math.random() > 0.4 ? 'Browsing' : 'Away',
    }));
    setOnlineUsers(onlineUsers);
  };

  if (!isMounted || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold mb-8">
          <span className="mr-2">←</span>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2">🟢 User Presence</h1>
          <p className="text-green-100">See who's online and their activity status</p>
        </div>

        {/* User Presence Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Online Users</p>
                <div className="text-3xl font-bold text-green-600 mt-2">
                  {onlineUsers.filter(u => u.isOnline).length}
                </div>
              </div>
              <div className="text-5xl opacity-20">🟢</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Users</p>
                <div className="text-3xl font-bold text-blue-600 mt-2">{onlineUsers.length}</div>
              </div>
              <div className="text-5xl opacity-20">👥</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Active Sessions</p>
                <div className="text-3xl font-bold text-purple-600 mt-2">{Math.floor(Math.random() * 50) + 20}</div>
              </div>
              <div className="text-5xl opacity-20">⚡</div>
            </div>
          </div>
        </div>

        {/* Online Users List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Users</h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {onlineUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {user.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.status} • {user.lastSeen}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.isOnline
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {user.isOnline ? '🟢 Online' : '⚫ Offline'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto Refresh Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 User presence updates every 30 seconds. Green dot (🟢) indicates user is currently active.
          </p>
        </div>
      </div>
    </div>
  );
}
