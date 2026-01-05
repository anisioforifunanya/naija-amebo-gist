'use client';

import { useState } from 'react';
import { recordShare } from '../lib/metricsTracker';

interface NewsItem {
  id?: string;
  title: string;
  description: string;
  date: string;
  image?: string;
  video?: string;
  liveVideo?: string;
  liveAudio?: string;
}

interface NewsCardProps {
  item: NewsItem;
  index: number;
}

export default function NewsCard({ item, index }: NewsCardProps) {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [reactions, setReactions] = useState<{[key: string]: number}>({});
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const emojis = [
    '👍', '❤️', '😂', '😮', '😢', '😡', '😍', '🤔', '😎', '🙄',
    '😴', '🤗', '😇', '🤤', '😈', '👏', '🙌', '🤝', '👎', '💯'
  ];

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleReaction = (emoji: string) => {
    const isSelected = userReactions.has(emoji);

    if (isSelected) {
      // Remove the reaction
      setUserReactions(prev => {
        const newSet = new Set(prev);
        newSet.delete(emoji);
        return newSet;
      });
      setReactions(prev => ({
        ...prev,
        [emoji]: Math.max(0, (prev[emoji] || 0) - 1)
      }));
    } else {
      // Add the reaction
      setUserReactions(prev => new Set(prev).add(emoji));
      setReactions(prev => ({
        ...prev,
        [emoji]: (prev[emoji] || 0) + 1
      }));
    }
    setShowReactions(false);
  };

  const handleComment = () => {
    if (newComment.trim()) {
      setComments(prev => [...prev, newComment]);
      setNewComment('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const downloadMedia = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareToSocial = async (platform: string) => {
    // Record share metric if story has an ID
    if (item.id) {
      try {
        await recordShare(item.id, platform);
      } catch (error) {
        console.error('Error recording share metric:', error);
      }
    }

    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${item.title} - ${item.description}`);
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL, so we'll copy to clipboard
        navigator.clipboard.writeText(`${item.title}\n${item.description}\n${window.location.href}`);
        alert('Link copied to clipboard! Share manually on Instagram.');
        return;
      case 'tiktok':
        // TikTok doesn't support direct sharing via URL
        navigator.clipboard.writeText(`${item.title}\n${item.description}\n${window.location.href}`);
        alert('Link copied to clipboard! Share manually on TikTok.');
        return;
      case 'x':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'youtube':
        // YouTube doesn't support direct sharing via URL
        navigator.clipboard.writeText(`${item.title}\n${item.description}\n${window.location.href}`);
        alert('Link copied to clipboard! Share manually on YouTube.');
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <article className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{item.description}</p>

      {/* Media Display */}
      {item.image && (
        <div className="mb-4">
          <img src={item.image} alt={item.title} className="w-full h-48 object-cover rounded-lg" />
          <button
            onClick={() => downloadMedia(item.image!, `${item.title}.jpg`)}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            📥 Download Image
          </button>
        </div>
      )}

      {item.video && (
        <div className="mb-4">
          <video controls className="w-full h-48 rounded-lg">
            <source src={item.video} type="video/mp4" />
          </video>
          <button
            onClick={() => downloadMedia(item.video!, `${item.title}.mp4`)}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            📥 Download Video
          </button>
        </div>
      )}

      {item.liveVideo && (
        <div className="mb-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg mb-2">
            <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">🎥 Live Video Recording</p>
          </div>
          <video controls className="w-full h-48 rounded-lg">
            <source src={item.liveVideo} type="video/webm" />
          </video>
          <button
            onClick={() => downloadMedia(item.liveVideo!, `${item.title}-live-video.webm`)}
            className="mt-2 text-purple-600 hover:text-purple-800 text-sm"
          >
            📥 Download Live Video
          </button>
        </div>
      )}

      {item.liveAudio && (
        <div className="mb-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg mb-2">
            <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">🎤 Live Audio Recording</p>
          </div>
          <audio controls className="w-full">
            <source src={item.liveAudio} type="audio/webm" />
          </audio>
          <button
            onClick={() => downloadMedia(item.liveAudio!, `${item.title}-live-audio.webm`)}
            className="mt-2 text-purple-600 hover:text-purple-800 text-sm"
          >
            📥 Download Live Audio
          </button>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-4">Published {item.date}</p>

      {/* User Uploaded Content */}
      {uploadedFiles.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">User Uploads:</h4>
          <div className="grid grid-cols-2 gap-2">
            {uploadedFiles.map((file, idx) => (
              <div key={idx} className="text-sm text-gray-600">
                📎 {file.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interaction Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={handleLike}
          className={`px-3 sm:px-4 py-2 sm:py-3 rounded text-sm sm:text-base font-medium min-h-[44px] transition ${isLiked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          👍 {likes}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm sm:text-base font-medium min-h-[44px]"
          >
            😊
          </button>
          {showReactions && (
            <div className="absolute bottom-full mb-2 bg-white border rounded shadow-lg p-2 sm:p-4 w-64 sm:w-80 z-10">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-2xl hover:bg-gray-100 rounded-lg transition-colors border-2 ${
                      userReactions.has(emoji)
                        ? 'bg-blue-100 border-blue-300'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    title={userReactions.has(emoji) ? 'Click to remove reaction' : 'Click to add reaction'}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded hover:bg-opacity-80 text-sm sm:text-base font-medium transition min-h-[44px]"
        >
          💬 {comments.length}
        </button>

        {/* Social Share Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => shareToSocial('whatsapp')}
            className="p-2 sm:p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Share on WhatsApp"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          </button>
          <button
            onClick={() => shareToSocial('telegram')}
            className="p-2 sm:p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Share on Telegram"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </button>
          <button
            onClick={() => shareToSocial('instagram')}
            className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Share on Instagram"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C8.396 0 7.996.011 6.8.067 5.604.124 4.739.265 4.075.52c-.716.282-1.324.697-1.836 1.208C1.728 2.24 1.313 2.848.98 3.564c-.255.664-.396 1.529-.453 2.725C.467 7.635.456 8.035.456 11.656s.011 4.021.067 5.217c.057 1.196.198 2.061.453 2.725.327.716.742 1.324 1.253 1.836.512.511 1.12.926 1.836 1.208.664.255 1.529.396 2.725.453 1.196.057 1.596.067 5.217.067s4.021-.011 5.217-.067c1.196-.057 2.061-.198 2.725-.453.716-.282 1.324-.697 1.836-1.208.511-.512.926-1.12 1.208-1.836.255-.664.396-1.529.453-2.725.057-1.196.067-1.596.067-5.217s-.011-4.021-.067-5.217c-.057-1.196-.198-2.061-.453-2.725-.282-.716-.697-1.324-1.208-1.836C20.848 1.728 20.24 1.313 19.524.98c-.664-.255-1.529-.396-2.725-.453C16.038.467 15.638.456 12.017.456zm0 2.178c3.56 0 3.977.013 5.378.07 1.303.054 2.024.234 2.503.392.566.187.967.41 1.39.833.423.423.646.824.833 1.39.158.479.338 1.2.392 2.503.057 1.401.07 1.818.07 5.378s-.013 3.977-.07 5.378c-.054 1.303-.234 2.024-.392 2.503-.187.566-.41.967-.833 1.39-.423.423-.824.646-1.39.833-.479.158-1.2.338-2.503.392-1.401.057-1.818.07-5.378.07s-3.977-.013-5.378-.07c-1.303-.054-2.024-.234-2.503-.392-.566-.187-.967-.41-1.39-.833-.423-.423-.646-.824-.833-1.39-.158-.479-.338-1.2-.392-2.503C2.195 8.035 2.013 7.314 1.855 6.811c-.187-.566-.41-.967-.833-1.39C.599 4.988.376 4.587.189 4.021.031 3.542-.149 2.821-.203 1.518C-.26.117-.273-.3-.273-3.86s.013-3.977.07-5.378c.054-1.303.234-2.024.392-2.503.187-.566.41-.967.833-1.39.423-.423.824-.646 1.39-.833.479-.158 1.2-.338 2.503-.392 1.401-.057 1.818-.07 5.378-.07zm0 7.893a5.785 5.785 0 1 0 0 11.57 5.785 5.785 0 0 0 0-11.57zm0 9.549a3.764 3.764 0 1 1 0-7.528 3.764 3.764 0 0 1 0 7.528zm5.965-9.678a1.351 1.351 0 1 1-2.702 0 1.351 1.351 0 0 1 2.702 0z"/>
            </svg>
          </button>
          <button
            onClick={() => shareToSocial('tiktok')}
            className="p-2 sm:p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Share on TikTok"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
          </button>
          <button
            onClick={() => shareToSocial('x')}
            className="p-2 sm:p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Share on X (Twitter)"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </button>
          <button
            onClick={() => shareToSocial('youtube')}
            className="p-2 sm:p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Share on YouTube"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Reactions Display */}
      {Object.keys(reactions).length > 0 && (
        <div className="mb-4">
          <div className="flex gap-1">
            {Object.entries(reactions).map(([emoji, count]) => (
              <span key={emoji} className="text-sm bg-gray-100 px-2 py-1 rounded">
                {emoji} {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="border-t pt-4">
          <div className="mb-4">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border rounded"
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              />
              <button
                onClick={handleComment}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Post
              </button>
            </div>
          </div>

          {comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((comment, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  {comment}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}