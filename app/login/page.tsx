"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUserWithEmail, getUser } from '@/lib/firebaseUtils';

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

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect if user or admin is already logged in
  useEffect(() => {
    const currentUser = localStorage.getItem('naijaAmeboCurrentUser');
    const currentAdmin = localStorage.getItem('naijaAmeboCurrentAdmin');
    
    if (currentUser) {
      router.push('/dashboard');
    } else if (currentAdmin) {
      router.push('/admin');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Try Firebase authentication first
      const authUser = await loginUserWithEmail(formData.email, formData.password);
      
      // Get user data from Firestore (using UID)
      const userData = await getUser(authUser.uid);
      
      if (!userData) {
        throw new Error('User profile not found in database');
      }

      // Update last login in localStorage
      const userToStore = {
        ...userData,
        id: authUser.uid,
        email: authUser.email,
        lastLogin: new Date().toISOString()
      };

      localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(userToStore));

      setLoading(false);
      router.push('/community');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Fallback to localStorage-based login for backward compatibility
      const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]');
      const user = users.find((u: UserData) =>
        (u.email === formData.email || u.username === formData.email) &&
        u.password === formData.password
      );

      if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        const userIndex = users.findIndex((u: UserData) => u.id === user.id);
        users[userIndex] = user;
        localStorage.setItem('naijaAmeboUsers', JSON.stringify(users));
        localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(user));

        setLoading(false);
        router.push('/community');
      } else {
        setError(err.message || 'Invalid email/username or password');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Join the conversation and connect with the community
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email or Username
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your email or username"
              />
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
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <div>
              <Link
                href="/register"
                className="text-sm text-purple-600 hover:text-purple-500"
              >
                Don't have an account? Sign up
              </Link>
            </div>
            <div>
              <Link
                href="/admin"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold"
              >
                👮 Admin Login Portal
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}