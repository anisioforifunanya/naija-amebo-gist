'use client';

import Link from 'next/link';

export default function SuperAdminNavigation() {
  const navItems = [
    {
      href: '/super-admin/news-management',
      icon: '📰',
      label: 'News Management',
      color: 'from-indigo-600 to-purple-600'
    },
    {
      href: '/super-admin/news-management',
      icon: '📈',
      label: 'Dashboard',
      color: 'from-slate-700 to-slate-800'
    },
    {
      href: '/super-admin/user-presence',
      icon: '🟢',
      label: 'User Presence',
      color: 'from-green-500 to-emerald-600'
    },
    {
      href: '/super-admin/analytics',
      icon: '📊',
      label: 'Analytics',
      color: 'from-blue-500 to-blue-600'
    },
    {
      href: '/super-admin/geo-map',
      icon: '🗺️',
      label: 'Geo Map',
      color: 'from-red-500 to-pink-600'
    },
    {
      href: '/community',
      icon: '🛡️',
      label: 'Community',
      color: 'from-purple-600 to-purple-700'
    },
    {
      href: '/private-messages',
      icon: '💬',
      label: 'Messages',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      href: '/setup-demo',
      icon: '🚀',
      label: 'Setup Demo',
      color: 'from-amber-500 to-orange-600'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center p-3 rounded-lg font-bold text-white transition-all transform hover:scale-110 hover:shadow-lg bg-gradient-to-br ${item.color} shadow-md`}
            >
              <div className="text-3xl mb-1">{item.icon}</div>
              <div className="text-xs text-center leading-tight whitespace-normal">
                {item.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
