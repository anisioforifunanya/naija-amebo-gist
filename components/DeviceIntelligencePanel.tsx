'use client';

import { useState, useEffect } from 'react';

interface DeviceInfo {
  type: string;
  model: string;
  os: string;
  browser: string;
  screenResolution: string;
  timezone: string;
  language: string;
}

interface VisitorRecord {
  id: string;
  deviceFingerprint: string;
  firstSeen: string;
  lastSeen: string;
  visits: number;
  isReturning: boolean;
  deviceInfo: DeviceInfo;
  riskScore: number;
}

export default function DeviceIntelligencePanel() {
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState({
    mobile: 0,
    tablet: 0,
    desktop: 0,
  });
  const [osBreakdown, setOsBreakdown] = useState<
    Array<{ name: string; percentage: number; count: number }>
  >([]);
  const [browserBreakdown, setBrowserBreakdown] = useState<
    Array<{ name: string; percentage: number; count: number }>
  >([]);

  useEffect(() => {
    loadDeviceIntelligence();
  }, []);

  const loadDeviceIntelligence = () => {
    // Simulate device data
    const mockVisitors: VisitorRecord[] = [
      {
        id: '1',
        deviceFingerprint: 'hash_abc123def456',
        firstSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastSeen: new Date(Date.now() - 1000).toISOString(),
        visits: 12,
        isReturning: true,
        deviceInfo: {
          type: 'mobile',
          model: 'iPhone 13',
          os: 'iOS 16.5',
          browser: 'Safari 16.5',
          screenResolution: '390x844',
          timezone: 'Africa/Lagos',
          language: 'en-NG',
        },
        riskScore: 5,
      },
      {
        id: '2',
        deviceFingerprint: 'hash_xyz789uvw012',
        firstSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastSeen: new Date(Date.now() - 500).toISOString(),
        visits: 1,
        isReturning: false,
        deviceInfo: {
          type: 'desktop',
          model: 'Desktop',
          os: 'Windows 11',
          browser: 'Chrome 119',
          screenResolution: '1920x1080',
          timezone: 'Africa/Lagos',
          language: 'en-NG',
        },
        riskScore: 8,
      },
      {
        id: '3',
        deviceFingerprint: 'hash_qrs345tuu678',
        firstSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        lastSeen: new Date(Date.now() - 100).toISOString(),
        visits: 3,
        isReturning: true,
        deviceInfo: {
          type: 'tablet',
          model: 'Samsung Galaxy Tab',
          os: 'Android 13',
          browser: 'Chrome 119',
          screenResolution: '1024x768',
          timezone: 'Africa/Lagos',
          language: 'en',
        },
        riskScore: 12,
      },
    ];

    setVisitors(mockVisitors);

    // Calculate breakdown
    const devices = { mobile: 0, tablet: 0, desktop: 0 };
    const oses = new Map<string, number>();
    const browsers = new Map<string, number>();

    mockVisitors.forEach((v) => {
      devices[v.deviceInfo.type as 'mobile' | 'tablet' | 'desktop']++;
      oses.set(v.deviceInfo.os, (oses.get(v.deviceInfo.os) || 0) + 1);
      browsers.set(
        v.deviceInfo.browser,
        (browsers.get(v.deviceInfo.browser) || 0) + 1
      );
    });

    setDeviceBreakdown(devices);

    const osArray = Array.from(oses.entries()).map(([name, count]) => ({
      name,
      percentage: (count / mockVisitors.length) * 100,
      count,
    }));
    setOsBreakdown(osArray.sort((a, b) => b.count - a.count));

    const browserArray = Array.from(browsers.entries()).map(([name, count]) => ({
      name,
      percentage: (count / mockVisitors.length) * 100,
      count,
    }));
    setBrowserBreakdown(
      browserArray.sort((a, b) => b.count - a.count)
    );
  };

  const getRiskColor = (score: number) => {
    if (score < 10) return 'text-green-600 dark:text-green-400';
    if (score < 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRiskBg = (score: number) => {
    if (score < 10) return 'bg-green-50 dark:bg-green-900/20';
    if (score < 30) return 'bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📱 Device Intelligence
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Visitor device fingerprints and visitor identity tracking
        </p>
      </div>

      {/* Device Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mobile</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">
                {deviceBreakdown.mobile}
              </p>
            </div>
            <div className="text-5xl opacity-20">📱</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            {((deviceBreakdown.mobile / visitors.length) * 100).toFixed(1)}% of visitors
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Desktop
              </p>
              <p className="text-4xl font-bold text-green-600 mt-2">
                {deviceBreakdown.desktop}
              </p>
            </div>
            <div className="text-5xl opacity-20">💻</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            {((deviceBreakdown.desktop / visitors.length) * 100).toFixed(1)}% of visitors
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tablet
              </p>
              <p className="text-4xl font-bold text-purple-600 mt-2">
                {deviceBreakdown.tablet}
              </p>
            </div>
            <div className="text-5xl opacity-20">📊</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            {((deviceBreakdown.tablet / visitors.length) * 100).toFixed(1)}% of visitors
          </p>
        </div>
      </div>

      {/* OS & Browser Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operating Systems */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Operating Systems
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {osBreakdown.map((os) => (
              <div key={os.name} className="px-6 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {os.name}
                  </span>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                    {os.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    style={{ width: `${os.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Browsers
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {browserBreakdown.map((browser) => (
              <div key={browser.name} className="px-6 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {browser.name}
                  </span>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                    {browser.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                    style={{ width: `${browser.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visitor Fingerprints */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white">
            Device Fingerprints & Visitor Records
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {visitors.map((visitor) => (
            <div
              key={visitor.id}
              className={`p-6 ${getRiskBg(visitor.riskScore)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {visitor.deviceFingerprint.substring(0, 12)}...
                    </code>
                    {visitor.isReturning && (
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        Returning Visitor
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Device
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {visitor.deviceInfo.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        OS
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {visitor.deviceInfo.os}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Browser
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {visitor.deviceInfo.browser}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Visits
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {visitor.visits}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Risk Score
                  </p>
                  <p className={`text-2xl font-bold ${getRiskColor(visitor.riskScore)}`}>
                    {visitor.riskScore}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-300 dark:border-gray-600">
                <span>
                  First: {new Date(visitor.firstSeen).toLocaleDateString()}
                </span>
                <span>
                  Last: {new Date(visitor.lastSeen).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 Device fingerprinting helps identify repeat visitors and detect fraud. All data is hashed and anonymous.
        </p>
      </div>
    </div>
  );
}
