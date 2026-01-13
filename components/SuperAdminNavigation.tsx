'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SuperAdminNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab') || 'news';
  const [activeNav, setActiveNav] = useState(currentTab);

  useEffect(() => {
    setActiveNav(searchParams?.get('tab') || 'news');
  }, [searchParams]);

  const handleTabClick = (tab: string) => {
    router.push(`/admin?tab=${tab}`);
  };

  const navItems = [
    {
      action: () => handleTabClick('news'),
      icon: '📰',
      label: 'News Management',
      color: 'from-indigo-600 to-purple-600',
      tab: 'news'
    },
    {
      action: () => handleTabClick('news-management'),
      icon: '🎛️',
      label: 'News Control Center',
      color: 'from-slate-700 to-slate-800',
      tab: 'news-management'
    },
    {
      action: () => handleTabClick('admins'),
      icon: '👑',
      label: 'Admin Management',
      color: 'from-purple-700 to-purple-900',
      tab: 'admins'
    },
    {
      action: () => handleTabClick('users'),
      icon: '👥',
      label: 'User Moderation',
      color: 'from-teal-500 to-cyan-600',
      tab: 'users'
    },
    {
      action: () => handleTabClick('all-users-admins'),
      icon: '📋',
      label: 'View All Users & Admins',
      color: 'from-yellow-500 to-orange-600',
      tab: 'all-users-admins'
    },
    {
      action: () => handleTabClick('verification'),
      icon: '🔐',
      label: 'Face Verification',
      color: 'from-red-500 to-pink-600',
      tab: 'verification'
    },
    {
      action: () => handleTabClick('marketplace'),
      icon: '🛍️',
      label: 'Product Approvals',
      color: 'from-green-500 to-emerald-600',
      tab: 'marketplace'
    },
    {
      action: () => handleTabClick('moderation'),
      icon: '🛡️',
      label: 'Content Moderation',
      color: 'from-purple-600 to-blue-600',
      tab: 'moderation'
    },
    {
      action: () => handleTabClick('settings'),
      icon: '⚙️',
      label: 'Settings',
      color: 'from-gray-600 to-gray-800',
      tab: 'settings'
    },
    {
      href: '/community',
      icon: '👥',
      label: 'Community Hub',
      color: 'from-violet-600 to-indigo-600',
      external: true
    },
    {
      href: '/private-messages',
      icon: '💬',
      label: 'Messages',
      color: 'from-cyan-500 to-blue-600',
      external: true
    },
    {
      href: '/setup-demo',
      icon: '🚀',
      label: 'Setup Demo',
      color: 'from-amber-500 to-orange-600',
      external: true
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-12 gap-3">
          {navItems.map((item) => {
            const isActive = !item.external && item.tab === activeNav;
            const isExternal = (item as any).external;
            
            return isExternal ? (
              <Link
                key={item.label}
                href={(item as any).href}
                className={`flex flex-col items-center justify-center p-3 rounded-lg font-bold text-white transition-all transform hover:scale-110 hover:shadow-lg bg-gradient-to-br ${item.color} shadow-md`}
              >
                <div className="text-3xl mb-1">{item.icon}</div>
                <div className="text-xs text-center leading-tight whitespace-normal">
                  {item.label}
                </div>
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={(item as any).action}
                className={`flex flex-col items-center justify-center p-3 rounded-lg font-bold text-white transition-all transform hover:scale-110 hover:shadow-lg bg-gradient-to-br ${item.color} shadow-md ${
                  isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-200 dark:ring-offset-gray-700' : ''
                }`}
              >
                <div className="text-3xl mb-1">{item.icon}</div>
                <div className="text-xs text-center leading-tight whitespace-normal">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
