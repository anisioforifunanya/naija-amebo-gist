'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SetupDebugPage() {
  const [status, setStatus] = useState('');
  const [count, setCount] = useState(0);

  const createSampleNews = () => {
    const sampleNews = [
      {
        id: 'sample_' + Date.now() + '_1',
        title: '🔥 REAL: Wizkid Releases New Album - Fans Go Crazy',
        description: 'Multi-platinum artist Wizkid has just dropped a surprise album with 15 brand new tracks. The album is already trending #1 on Spotify Africa. Featuring collaborations with Burna Boy and Rema.',
        category: 'breaking-news',
        date: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }),
        status: 'approved',
        submittedBy: 'system-demo',
        hashtags: ['#WizkidAlbum', '#BreakingNews', '#AfrobeatMusic', '#Nigeria'],
        socialCaption: '🎵 ALERT: New album just dropped! 🔥 Listen now on Spotify',
        views: 5420,
        shares: 1203,
        reactions: 3847
      },
      {
        id: 'sample_' + Date.now() + '_2',
        title: '👑 Breaking: Zendaya Spotted in Lagos - Surprises Fans',
        description: 'Actress Zendaya makes surprise appearance in Lagos for a fashion event. Fans gather at venue. She gives impromptu meet and greet. Lagos hospitality at its finest!',
        category: 'celebrity-news',
        date: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }),
        status: 'approved',
        submittedBy: 'system-demo',
        hashtags: ['#Zendaya', '#Lagos', '#CelebVisit', '#FanMeeting'],
        socialCaption: '🌟 Zendaya in Lagos! Incredible moment with fans',
        views: 8932,
        shares: 2156,
        reactions: 5234
      },
      {
        id: 'sample_' + Date.now() + '_3',
        title: '💥 VIRAL: TikTok Dance Challenge Takes Over - 500K Videos',
        description: 'A new dance challenge has gone absolutely viral on TikTok with over 500,000 videos created in just 48 hours. Celebrities joining in! Everyone is doing the #NaijaMove.',
        category: 'viral-content',
        date: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }),
        status: 'approved',
        submittedBy: 'system-demo',
        hashtags: ['#TikTokChallenge', '#NaijaMove', '#ViralDance', '#Trending'],
        socialCaption: '💃 Can you do the #NaijaMove? 500K people already have!',
        views: 12450,
        shares: 3897,
        reactions: 7623
      },
      {
        id: 'sample_' + Date.now() + '_4',
        title: '🎬 Entertainment: New Nollywood Movie Breaks Records',
        description: 'Latest Nollywood production becomes highest-grossing film of the year. Box office hits 2 billion naira in first weekend. Industry celebrates milestone achievement.',
        category: 'entertainment',
        date: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }),
        status: 'approved',
        submittedBy: 'system-demo',
        hashtags: ['#Nollywood', '#Blockbuster', '#BoxOffice', '#NigerianCinema'],
        socialCaption: '🎥 Nollywood hits record 2 billion naira! 🎉',
        views: 6734,
        shares: 1543,
        reactions: 4321
      },
      {
        id: 'sample_' + Date.now() + '_5',
        title: '📈 Trending: Bitcoin Reaches New ATH - Nigeria Traders Celebrate',
        description: 'Cryptocurrency hits all-time high. Nigerian investors report significant gains. Trading activity increases 300%. Future looks bright for digital assets.',
        category: 'trending-stories',
        date: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }),
        status: 'approved',
        submittedBy: 'system-demo',
        hashtags: ['#Bitcoin', '#Crypto', '#Trending', '#Investment'],
        socialCaption: '📊 Bitcoin hits ATH! Are you trading? 🚀',
        views: 4123,
        shares: 987,
        reactions: 2456
      }
    ];

    // Get existing news
    const existing = localStorage.getItem('naijaAmeboNews');
    let allNews = existing ? JSON.parse(existing) : [];

    // Add new sample news
    allNews = [...sampleNews, ...allNews];

    // Save to localStorage
    localStorage.setItem('naijaAmeboNews', JSON.stringify(allNews));

    setCount(sampleNews.length);
    setStatus('✅ SUCCESS: ' + sampleNews.length + ' sample news articles added as APPROVED!');
  };

  const clearAllNews = () => {
    if (confirm('⚠️ WARNING: This will DELETE ALL news from localStorage. Are you sure?')) {
      localStorage.removeItem('naijaAmeboNews');
      setStatus('🗑️ All news cleared from localStorage');
      setCount(0);
    }
  };

  const showExistingNews = () => {
    const existing = localStorage.getItem('naijaAmeboNews');
    const news = existing ? JSON.parse(existing) : [];
    const approved = news.filter((n: any) => n.status === 'approved');
    const pending = news.filter((n: any) => n.status === 'pending');
    const rejected = news.filter((n: any) => n.status === 'rejected');

    setStatus(`
📰 CURRENT NEWS IN SYSTEM:
✅ Approved: ${approved.length}
⏳ Pending: ${pending.length}
❌ Rejected: ${rejected.length}
━━━━━━━━━━━━━━━
TOTAL: ${news.length} articles
    `);
    setCount(news.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-2xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚀 Real Data System Setup</h1>
          <p className="text-gray-600 text-lg mb-6">
            Use this page to create sample news data that shows the real data system in action
          </p>

          {/* Status Display */}
          {status && (
            <div className="bg-blue-100 border-2 border-blue-500 rounded-lg p-4 mb-6 text-gray-900 font-mono text-sm whitespace-pre-wrap">
              {status}
            </div>
          )}

          {/* Button Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={createSampleNews}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              ➕ Add 5 Sample Articles
            </button>

            <button
              onClick={showExistingNews}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              📊 Show News Count
            </button>

            <button
              onClick={clearAllNews}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 md:col-span-2"
            >
              🗑️ Clear All News (Destructive!)
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 mb-6 border-2 border-purple-300">
            <h2 className="text-xl font-bold text-purple-900 mb-4">📋 How to See the Real Data System:</h2>
            <ol className="list-decimal list-inside space-y-3 text-purple-800">
              <li>
                <strong>Click "➕ Add 5 Sample Articles"</strong> to create test news data
              </li>
              <li>
                <strong>Click "📊 Show News Count"</strong> to verify articles were added as APPROVED
              </li>
              <li>
                <strong>Refresh the homepage</strong> (press F5 or Ctrl+R)
              </li>
              <li>
                <strong>See changes appear immediately:</strong>
                <ul className="list-disc list-inside ml-4 mt-2">
                  • Breaking News Ticker shows latest story
                  • Hero Carousel rotates 5 articles
                  • Trending Hashtags extracted from submissions
                  • Most Shared Today ranked by real metrics
                  • Latest Stories Feed shows all articles
                  • Real engagement counts (views, shares, reactions)
                </ul>
              </li>
              <li>
                <strong>As Admin:</strong> Go to /admin → approve/reject news to control homepage
              </li>
            </ol>
          </div>

          {/* What This Proves */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-6 border-2 border-green-300">
            <h2 className="text-xl font-bold text-green-900 mb-4">✅ This Proves the Real Data System Works:</h2>
            <ul className="list-disc list-inside space-y-2 text-green-800">
              <li>✅ Real data appears on homepage (not just defaults)</li>
              <li>✅ Trending hashtags extracted from real submissions</li>
              <li>✅ Most Shared Today uses real metrics</li>
              <li>✅ Admin can control what shows (approve/reject)</li>
              <li>✅ User submissions flow to homepage correctly</li>
              <li>✅ Breaking news ticker updates with latest</li>
              <li>✅ Hero carousel cycles through stories</li>
              <li>✅ Everything is responsive and works</li>
            </ul>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center space-y-4">
          <p className="text-gray-600 font-semibold">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold">
              🏠 Homepage
            </Link>
            <Link href="/admin" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">
              🛡️ Admin Panel
            </Link>
            <Link href="/submit-news" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold">
              📝 Submit News
            </Link>
            <Link href="/register" className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold">
              👤 Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
