'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import type { NewsCategory, NewsItem, SocialPlatform } from '@/lib/newsManagementTypes';
import { createNews, autoPostToSocial, publishNews } from '@/lib/newsManagementUtils';

/**
 * BREAKING NEWS MONITOR
 * Quick publish system for urgent news with instant social media posting
 * Optimized for speed and multi-channel distribution
 */

export default function BreakingNewsMonitor() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['facebook', 'twitter']);
  const [isPublishing, setIsPublishing] = useState(false);
  const [source, setSource] = useState('');
  const [hashtags, setHashtags] = useState('');

  const platforms: SocialPlatform[] = ['facebook', 'twitter', 'instagram', 'whatsapp', 'telegram'];

  const handlePublishBreakingNews = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('⚠️ Title and description are required');
      return;
    }

    setIsPublishing(true);

    try {
      // Create news item
      const hashtagsList = hashtags.split(',').map(tag => tag.trim()).filter(Boolean);
      const newsId = await createNews({
        title,
        description,
        content: content || description,
        category: 'breaking',
        image_url: imageUrl,
        author: localStorage.getItem('userEmail') || 'Admin',
        source: source || 'Editorial',
        status: 'draft',
        admin_id: localStorage.getItem('userId') || 'admin',
        tags: hashtagsList,
        seo_title: title,
        seo_description: description,
        social_posts: [],
        auto_post_enabled: true,
        hashtags: hashtagsList,
        visibility: 'scheduled'
      } as any);

      toast.success(`✅ News created with ID: ${newsId}`);

      // Publish immediately
      await publishNews(newsId);
      toast.success('📤 News published!');

      // Auto-post to social media
      if (selectedPlatforms.length > 0) {
        await autoPostToSocial(newsId, selectedPlatforms, title, imageUrl);
        toast.success(`📱 Posted to ${selectedPlatforms.join(', ')}`);
      }

      // Reset form
      setTitle('');
      setDescription('');
      setContent('');
      setImageUrl('');
      setSource('');
      setHashtags('');
      setSelectedPlatforms(['facebook', 'twitter']);
    } catch (error) {
      console.error('❌ Publishing error:', error);
      toast.error('Failed to publish breaking news');
    } finally {
      setIsPublishing(false);
    }
  };

  const togglePlatform = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        🚨 Breaking News Monitor
        <span className="text-sm text-red-600 font-normal">(Instant Publish)</span>
      </h2>

      <form onSubmit={handlePublishBreakingNews} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Breaking News Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Major Political Development in Lagos"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={isPublishing}
          />
        </div>

        {/* Description/Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Summary *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary for social media preview"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={isPublishing}
          />
        </div>

        {/* Full Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Article Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Complete news story..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={isPublishing}
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={isPublishing}
          />
          {imageUrl && (
            <div className="mt-2 flex justify-center">
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="max-w-md h-40 object-cover rounded-lg"
                onError={() => toast.error('Failed to load image')}
              />
            </div>
          )}
        </div>

        {/* Source & Hashtags */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Source
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., Reuters, AFP"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              disabled={isPublishing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hashtags (comma separated)
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#breaking, #news, #naija"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              disabled={isPublishing}
            />
          </div>
        </div>

        {/* Social Media Platforms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            📱 Auto-Post to Platforms
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {platforms.map(platform => (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                disabled={isPublishing}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedPlatforms.includes(platform)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                } disabled:opacity-50`}
              >
                {platform === 'facebook' && '👤 Facebook'}
                {platform === 'twitter' && '𝕏 Twitter'}
                {platform === 'instagram' && '📷 Instagram'}
                {platform === 'whatsapp' && '💬 WhatsApp'}
                {platform === 'telegram' && '✈️ Telegram'}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📋 Preview</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Category:</strong> 🚨 Breaking News</p>
            <p><strong>Status:</strong> Will be published immediately</p>
            <p><strong>Social Posts:</strong> {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}</p>
            <p><strong>Auto-posting:</strong> {selectedPlatforms.length > 0 ? 'Enabled ✓' : 'Disabled'}</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPublishing || !title.trim() || !description.trim()}
          className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPublishing ? (
            <>
              🔄 Publishing...
            </>
          ) : (
            <>
              🚀 Publish Breaking News
            </>
          )}
        </button>

        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          ⚡ News will be instantly published and posted to selected platforms
        </p>
      </form>
    </div>
  );
}
