"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  category: 'entertainment' | 'news' | 'sports' | 'technology' | 'lifestyle' | 'other';
  members: string[]; // Array of user IDs
  moderators: string[]; // Array of user IDs (can be creators)
  createdBy: string; // User ID of creator
  createdAt: string;
  avatar?: string;
  isPrivate: boolean;
  posts?: ChannelPost[];
}

interface ChannelPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  avatar?: string;
}

export default function ChannelsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showChannelView, setShowChannelView] = useState(false);
  const [postInput, setPostInput] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const [newChannelForm, setNewChannelForm] = useState({
    name: '',
    description: '',
    category: 'entertainment' as const,
    isPrivate: false,
    selectedMembers: [] as string[],
  });

  useEffect(() => {
    setIsMounted(true);

    const userSession = localStorage.getItem('naijaAmeboCurrentUser');
    if (!userSession) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userSession);
    setCurrentUser(user);

    // Load all users
    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]');
    const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]');
    setAllUsers([...users, ...admins].filter(u => u.id !== user.id));

    // Load channels
    const loadedChannels = JSON.parse(localStorage.getItem('naijaAmeboChannels') || '[]');
    setChannels(loadedChannels);
  }, [router]);

  const handleCreateChannel = () => {
    if (!currentUser || !newChannelForm.name.trim()) {
      alert('Please enter a channel name');
      return;
    }

    const newChannel: Channel = {
      id: Date.now().toString(),
      name: newChannelForm.name,
      description: newChannelForm.description,
      category: newChannelForm.category,
      members: newChannelForm.isPrivate 
        ? [currentUser.id, ...newChannelForm.selectedMembers]
        : [currentUser.id],
      moderators: [currentUser.id],
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      isPrivate: newChannelForm.isPrivate,
      posts: [],
    };

    const updatedChannels = [...channels, newChannel];
    setChannels(updatedChannels);
    localStorage.setItem('naijaAmeboChannels', JSON.stringify(updatedChannels));

    setNewChannelForm({ 
      name: '', 
      description: '', 
      category: 'entertainment',
      isPrivate: false,
      selectedMembers: [] 
    });
    setShowCreateModal(false);
    alert(`Channel "#${newChannel.name}" created successfully!`);
  };

  const handleJoinChannel = (channelId: string) => {
    if (!currentUser) return;

    const updatedChannels = channels.map(channel => {
      if (channel.id === channelId && !channel.members.includes(currentUser.id)) {
        return {
          ...channel,
          members: [...channel.members, currentUser.id],
        };
      }
      return channel;
    });

    setChannels(updatedChannels);
    localStorage.setItem('naijaAmeboChannels', JSON.stringify(updatedChannels));
    alert('You joined the channel!');
  };

  const handleLeaveChannel = (channelId: string) => {
    if (!currentUser) return;

    const updatedChannels = channels.map(channel => {
      if (channel.id === channelId) {
        return {
          ...channel,
          members: channel.members.filter(id => id !== currentUser.id),
        };
      }
      return channel;
    });

    setChannels(updatedChannels);
    localStorage.setItem('naijaAmeboChannels', JSON.stringify(updatedChannels));
    setShowChannelView(false);
    setSelectedChannel(null);
    alert('You left the channel!');
  };

  const handleAddMember = (userId: string) => {
    setNewChannelForm(prev => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(userId)
        ? prev.selectedMembers.filter(id => id !== userId)
        : [...prev.selectedMembers, userId]
    }));
  };

  const handlePostToChannel = () => {
    if (!currentUser || !selectedChannel || !postInput.trim()) return;

    const newPost: ChannelPost = {
      id: Date.now().toString(),
      authorId: currentUser.id,
      authorName: `${currentUser.firstName} ${currentUser.lastName}`,
      content: postInput,
      timestamp: new Date().toLocaleTimeString('en-NG'),
      likes: 0,
      comments: 0,
      avatar: currentUser.avatar,
    };

    const updatedChannels = channels.map(channel => {
      if (channel.id === selectedChannel.id) {
        return {
          ...channel,
          posts: [...(channel.posts || []), newPost],
        };
      }
      return channel;
    });

    setChannels(updatedChannels);
    localStorage.setItem('naijaAmeboChannels', JSON.stringify(updatedChannels));
    setSelectedChannel({ ...selectedChannel, posts: [...(selectedChannel.posts || []), newPost] });
    setPostInput('');
  };

  if (!isMounted || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const myChannels = channels.filter(channel => channel.members.includes(currentUser.id));
  const availableChannels = channels.filter(channel => !channel.isPrivate && !channel.members.includes(currentUser.id));

  const categoryColors: Record<string, string> = {
    entertainment: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    news: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    sports: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    technology: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    lifestyle: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
    other: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Channels</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Explore and create channels on topics you love</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Channel</span>
          </button>
        </div>

        {!showChannelView ? (
          <>
            {/* My Channels */}
            {myChannels.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Channels</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myChannels.map(channel => (
                    <div
                      key={channel.id}
                      onClick={() => {
                        setSelectedChannel(channel);
                        setShowChannelView(true);
                      }}
                      className="bg-white dark:bg-gray-800 rounded-lg p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg flex-1">#{channel.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[channel.category]}`}>
                          {channel.category}
                        </span>
                      </div>
                      {channel.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{channel.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span>{channel.members.length} members</span>
                        <span>{channel.posts?.length || 0} posts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Channels */}
            {availableChannels.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Discover Channels</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableChannels.map(channel => (
                    <div
                      key={channel.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg flex-1">#{channel.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[channel.category]}`}>
                          {channel.category}
                        </span>
                      </div>
                      {channel.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{channel.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500 pt-3 border-t border-gray-200 dark:border-gray-700 mb-4">
                        <span>{channel.members.length} members</span>
                        <span>{channel.posts?.length || 0} posts</span>
                      </div>
                      <button
                        onClick={() => handleJoinChannel(channel.id)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                      >
                        Join Channel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {myChannels.length === 0 && availableChannels.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">#</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Channels Yet</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Create a channel or join existing ones to connect with people who share your interests</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                >
                  Create Your First Channel
                </button>
              </div>
            )}
          </>
        ) : selectedChannel ? (
          <>
            {/* Channel View */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {/* Channel Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">#{selectedChannel.name}</h2>
                  <p className="text-purple-200 text-sm mt-1">{selectedChannel.description}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm">
                    <span>{selectedChannel.members.length} members</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[selectedChannel.category]}`}>
                      {selectedChannel.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowChannelView(false);
                    setSelectedChannel(null);
                  }}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Posts */}
              <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                {selectedChannel.posts && selectedChannel.posts.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p>No posts yet. Be the first to post!</p>
                  </div>
                ) : (
                  selectedChannel.posts?.map(post => (
                    <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {post.avatar ? (
                          <img src={post.avatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold">
                            {post.authorName.substring(0, 1)}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{post.authorName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{post.timestamp}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{post.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>❤️ {post.likes}</span>
                        <span>💬 {post.comments}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Post Input */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-6 space-y-3">
                <div className="flex space-x-3">
                  <textarea
                    value={postInput}
                    onChange={(e) => setPostInput(e.target.value)}
                    placeholder="What's on your mind?"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 min-h-20"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handlePostToChannel}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    Post
                  </button>
                  <button
                    onClick={() => handleLeaveChannel(selectedChannel.id)}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Leave
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Channel</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Channel Name *
                  </label>
                  <input
                    type="text"
                    value={newChannelForm.name}
                    onChange={(e) => setNewChannelForm({ ...newChannelForm, name: e.target.value })}
                    placeholder="Enter channel name (without #)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newChannelForm.description}
                    onChange={(e) => setNewChannelForm({ ...newChannelForm, description: e.target.value })}
                    placeholder="Enter channel description"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 min-h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newChannelForm.category}
                    onChange={(e) => setNewChannelForm({ ...newChannelForm, category: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="entertainment">Entertainment</option>
                    <option value="news">News</option>
                    <option value="sports">Sports</option>
                    <option value="technology">Technology</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newChannelForm.isPrivate}
                    onChange={(e) => setNewChannelForm({ ...newChannelForm, isPrivate: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <label htmlFor="isPrivate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Make this a private channel (only selected members can join)
                  </label>
                </div>

                {newChannelForm.isPrivate && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Add Members ({newChannelForm.selectedMembers.length})
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      {allUsers.map(user => (
                        <label key={user.id} className="flex items-center p-3 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newChannelForm.selectedMembers.includes(user.id)}
                            onChange={() => handleAddMember(user.id)}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <div className="ml-3 flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">@{user.username}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCreateChannel}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Create Channel
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
