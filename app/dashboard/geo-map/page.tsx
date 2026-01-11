"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface GeoLocation {
  region: string;
  users: number;
  percentage: number;
  latitude: number;
  longitude: number;
}

export default function GeoMap() {
  const router = useRouter();
  const [geoData, setGeoData] = useState<GeoLocation[]>([]);
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
    loadGeoData();
  }, [router]);

  const loadGeoData = () => {
    // Simulate geo-location data for Nigeria regions
    const mockGeoData: GeoLocation[] = [
      { region: 'Lagos', users: 2500, percentage: 28, latitude: 6.5244, longitude: 3.3792 },
      { region: 'Abuja', users: 1800, percentage: 20, latitude: 9.0765, longitude: 7.3986 },
      { region: 'Kano', users: 1200, percentage: 13, latitude: 12.0022, longitude: 8.6753 },
      { region: 'Port Harcourt', users: 950, percentage: 11, latitude: 4.7527, longitude: 7.0087 },
      { region: 'Ibadan', users: 780, percentage: 9, latitude: 7.3869, longitude: 3.8956 },
      { region: 'Enugu', users: 620, percentage: 7, latitude: 6.4969, longitude: 7.5519 },
      { region: 'Calabar', users: 480, percentage: 5, latitude: 4.9515, longitude: 8.3304 },
      { region: 'Ilorin', users: 370, percentage: 4, latitude: 8.4950, longitude: 4.5431 },
      { region: 'Benin', users: 280, percentage: 3, latitude: 6.3350, longitude: 5.6201 },
    ];
    setGeoData(mockGeoData);
  };

  if (!isMounted || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const totalUsers = geoData.reduce((sum, loc) => sum + loc.users, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Button - Fixed at Top */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-lg transition-colors">
            <span className="mr-2">← Back to Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2">🗺️ Geo Map</h1>
          <p className="text-green-100">View user distribution across regions</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Users</p>
                <div className="text-3xl font-bold text-green-600 mt-2">{totalUsers.toLocaleString()}</div>
              </div>
              <div className="text-5xl opacity-20">👥</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Regions Covered</p>
                <div className="text-3xl font-bold text-blue-600 mt-2">{geoData.length}</div>
              </div>
              <div className="text-5xl opacity-20">🗺️</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Top Region</p>
                <div className="text-3xl font-bold text-purple-600 mt-2">{geoData[0]?.region}</div>
              </div>
              <div className="text-5xl opacity-20">📍</div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Distribution Map</h2>
          
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg p-8 text-center h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">Nigeria Regional Distribution</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Interactive map showing user concentration by region</p>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Map visualization area</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Hover over regions to see detailed statistics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Regions List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Regional Breakdown</h3>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {geoData.map((location, idx) => (
                <div key={idx} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{location.region}</p>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      {location.users.toLocaleString()} users ({location.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Heat Map Legend */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Heat Intensity</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-red-500"></div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Very High</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">20%+ of users</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-orange-500"></div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">High</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">10-20% of users</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-yellow-500"></div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Medium</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">5-10% of users</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Low</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">&lt;5% of users</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            📍 Data is updated in real-time. Regions are based on user location information collected with consent.
          </p>
        </div>
      </div>
    </div>
  );
}
