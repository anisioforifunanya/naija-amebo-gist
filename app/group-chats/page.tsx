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

interface GroupChat {
  id: string;
  name: string;
  description: string;
  members: string[]; // Array of user IDs
  createdBy: string; // User ID of creator
  createdAt: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  messages?: GroupMessage[];
}

interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  avatar?: string;
}

export default function GroupChatsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);
  const [showGroupMessages, setShowGroupMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    description: '',
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

    // Load group chats
    const chats = JSON.parse(localStorage.getItem('naijaAmeboGroupChats') || '[]');
    setGroupChats(chats);
  }, [router]);

  const handleCreateGroup = () => {
    if (!currentUser || !newGroupForm.name.trim()) {
      alert('Please enter a group name');
      return;
    }

    const newGroup: GroupChat = {
      id: Date.now().toString(),
      name: newGroupForm.name,
      description: newGroupForm.description,
      members: [currentUser.id, ...newGroupForm.selectedMembers],
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      messages: [],
    };

    const updatedGroups = [...groupChats, newGroup];
    setGroupChats(updatedGroups);
    localStorage.setItem('naijaAmeboGroupChats', JSON.stringify(updatedGroups));

    setNewGroupForm({ name: '', description: '', selectedMembers: [] });
    setShowCreateModal(false);
    alert(`Group "${newGroup.name}" created successfully!`);
  };

  const handleAddMember = (userId: string) => {
    setNewGroupForm(prev => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(userId)
        ? prev.selectedMembers.filter(id => id !== userId)
        : [...prev.selectedMembers, userId]
    }));
  };

  const handleSendMessage = () => {
    if (!currentUser || !selectedGroup || !messageInput.trim()) return;

    const newMessage: GroupMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      content: messageInput,
      timestamp: new Date().toLocaleTimeString('en-NG'),
      avatar: currentUser.avatar,
    };

    const updatedGroups = groupChats.map(group => {
      if (group.id === selectedGroup.id) {
        return {
          ...group,
          messages: [...(group.messages || []), newMessage],
          lastMessage: messageInput,
          lastMessageTime: new Date().toLocaleTimeString('en-NG'),
        };
      }
      return group;
    });

    setGroupChats(updatedGroups);
    localStorage.setItem('naijaAmeboGroupChats', JSON.stringify(updatedGroups));
    setSelectedGroup({ ...selectedGroup, messages: [...(selectedGroup.messages || []), newMessage] });
    setMessageInput('');
  };

  const handleLeaveGroup = (groupId: string) => {
    if (!currentUser) return;

    const updatedGroups = groupChats.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: group.members.filter(id => id !== currentUser.id),
        };
      }
      return group;
    }).filter(group => group.members.length > 0);

    setGroupChats(updatedGroups);
    localStorage.setItem('naijaAmeboGroupChats', JSON.stringify(updatedGroups));
    setShowGroupMessages(false);
    setSelectedGroup(null);
    alert('You left the group!');
  };

  if (!isMounted || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const myGroups = groupChats.filter(group => group.members.includes(currentUser.id));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Group Chats</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage group conversations</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Group</span>
          </button>
        </div>

        {!showGroupMessages ? (
          <>
            {/* Group List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myGroups.length === 0 ? (
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Groups Yet</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first group chat to start conversations with multiple people</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                  >
                    Create Your First Group
                  </button>
                </div>
              ) : (
                myGroups.map(group => (
                  <div
                    key={group.id}
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowGroupMessages(true);
                    }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                          {group.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">{group.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{group.members.length} members</p>
                        </div>
                      </div>
                    </div>
                    {group.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{group.description}</p>
                    )}
                    {group.lastMessage && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        Last message: {group.lastMessage.substring(0, 40)}...
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        ) : selectedGroup ? (
          <>
            {/* Group Chat View */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-[600px]">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedGroup.name}</h2>
                  <p className="text-purple-200 text-sm">{selectedGroup.members.length} members</p>
                </div>
                <button
                  onClick={() => {
                    setShowGroupMessages(false);
                    setSelectedGroup(null);
                  }}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-700">
                {selectedGroup.messages && selectedGroup.messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                    <p>No messages yet. Be the first to message!</p>
                  </div>
                ) : (
                  selectedGroup.messages?.map(msg => (
                    <div key={msg.id} className="flex space-x-3">
                      {msg.avatar ? (
                        <img src={msg.avatar} alt={msg.senderName} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold">
                          {msg.senderName.substring(0, 1)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900 dark:text-white">{msg.senderName}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{msg.timestamp}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-3 mt-1">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    Send
                  </button>
                </div>
                <button
                  onClick={() => handleLeaveGroup(selectedGroup.id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  Leave Group
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Group Chat</h2>
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
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={newGroupForm.name}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
                    placeholder="Enter group name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newGroupForm.description}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, description: e.target.value })}
                    placeholder="Enter group description (optional)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 min-h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Add Members ({newGroupForm.selectedMembers.length})
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    {allUsers.map(user => (
                      <label key={user.id} className="flex items-center p-3 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newGroupForm.selectedMembers.includes(user.id)}
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
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCreateGroup}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Create Group
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
