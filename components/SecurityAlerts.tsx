'use client';

import { useState, useEffect } from 'react';

interface SecurityAlert {
  id: string;
  type: 'bot' | 'vpn' | 'anomaly' | 'fraud' | 'ddos';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: string;
  ip: string;
  country: string;
  riskScore: number;
  actionTaken?: string;
}

interface SecurityMetrics {
  blockedBots: number;
  vpnDetections: number;
  anomaliesDetected: number;
  fraudCasesBlocked: number;
  ddosAttempts: number;
  avgRiskScore: number;
  suspiciousIPs: number;
  trustedVisitors: number;
}

export default function SecurityAlerts() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    blockedBots: 0,
    vpnDetections: 0,
    anomaliesDetected: 0,
    fraudCasesBlocked: 0,
    ddosAttempts: 0,
    avgRiskScore: 0,
    suspiciousIPs: 0,
    trustedVisitors: 0,
  });

  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'vpn' | 'bots'>(
    'all'
  );
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = () => {
    // Load security metrics
    const mockMetrics: SecurityMetrics = {
      blockedBots: 342,
      vpnDetections: 128,
      anomaliesDetected: 45,
      fraudCasesBlocked: 12,
      ddosAttempts: 3,
      avgRiskScore: 28.5,
      suspiciousIPs: 67,
      trustedVisitors: 8934,
    };
    setMetrics(mockMetrics);

    // Load security alerts
    const mockAlerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'ddos',
        severity: 'critical',
        title: 'DDoS Attack Detected',
        description:
          '5,234 requests from same IP range in 60 seconds. Pattern matches known botnet.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        ip: '192.168.1.105',
        country: 'Unknown',
        riskScore: 95,
        actionTaken: 'Blocked IP range, Rate limiting enabled',
      },
      {
        id: '2',
        type: 'bot',
        severity: 'high',
        title: 'Bot Activity Detected',
        description:
          'Headless browser detected. No user interactions, only automated scraping.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        ip: '203.0.113.45',
        country: 'Unknown',
        riskScore: 87,
        actionTaken: 'Challenge issued, JavaScript verification enabled',
      },
      {
        id: '3',
        type: 'vpn',
        severity: 'medium',
        title: 'VPN Usage Detected',
        description: 'Visitor accessing from known VPN provider (ExpressVPN).',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        ip: '198.51.100.89',
        country: 'US',
        riskScore: 35,
        actionTaken: 'Flagged for review, content restrictions applied',
      },
      {
        id: '4',
        type: 'fraud',
        severity: 'high',
        title: 'Fraud Score Threshold Exceeded',
        description:
          'Multiple red flags: Superhuman click patterns, impossible geolocation changes.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        ip: '192.0.2.50',
        country: 'NG',
        riskScore: 78,
        actionTaken: 'Session terminated, Account flagged',
      },
      {
        id: '5',
        type: 'anomaly',
        severity: 'medium',
        title: 'Traffic Anomaly Detected',
        description:
          'Page views spiked 300% above baseline in last 30 minutes.',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        ip: 'Multiple',
        country: 'NG',
        riskScore: 42,
        actionTaken: 'Monitoring active, alerts sent to admin',
      },
      {
        id: '6',
        type: 'bot',
        severity: 'medium',
        title: 'Automated Crawler Detected',
        description:
          'GoogleBot signature detected but not authenticated. Likely impersonation.',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        ip: '66.249.66.144',
        country: 'US',
        riskScore: 65,
        actionTaken: 'Challenged with CAPTCHA verification',
      },
    ];
    setAlerts(mockAlerts);
  };

  const dismissAlert = (id: string) => {
    const newDismissed = new Set(dismissedAlerts);
    newDismissed.add(id);
    setDismissedAlerts(newDismissed);
  };

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      critical:
        'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      high: 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      medium:
        'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      low: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    };
    return colors[severity] || colors.low;
  };

  const getSeverityIcon = (severity: string) => {
    const icons: { [key: string]: string } = {
      critical: '🚨',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️',
    };
    return icons[severity] || 'ℹ️';
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      bot: '🤖',
      vpn: '🔐',
      anomaly: '📊',
      fraud: '🔴',
      ddos: '💥',
    };
    return icons[type] || '⚠️';
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (dismissedAlerts.has(alert.id)) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'critical') return alert.severity === 'critical';
    if (activeTab === 'vpn') return alert.type === 'vpn';
    if (activeTab === 'bots') return alert.type === 'bot';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🛡️ Security & Alerts
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Bot detection, fraud prevention, and security monitoring
        </p>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                BOTS BLOCKED
              </p>
              <p className="text-3xl font-bold text-red-700 dark:text-red-300 mt-2">
                {metrics.blockedBots}
              </p>
            </div>
            <div className="text-4xl">🤖</div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                VPN DETECTED
              </p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                {metrics.vpnDetections}
              </p>
            </div>
            <div className="text-4xl">🔐</div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                ANOMALIES
              </p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300 mt-2">
                {metrics.anomaliesDetected}
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                TRUSTED VISITORS
              </p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">
                {metrics.trustedVisitors}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
      </div>

      {/* Risk Score Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            Average Risk Score
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            0-20: Safe | 21-50: Low Risk | 51-75: Medium Risk | 76-100: Blocked
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Overall Risk
            </span>
            <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {metrics.avgRiskScore}
            </span>
          </div>
          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                metrics.avgRiskScore > 75
                  ? 'bg-red-500'
                  : metrics.avgRiskScore > 50
                    ? 'bg-orange-500'
                    : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(metrics.avgRiskScore, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Alerts Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4 overflow-x-auto">
          {[
            { label: 'All Alerts', value: 'all' as const },
            { label: 'Critical Only', value: 'critical' as const },
            { label: 'VPN Usage', value: 'vpn' as const },
            { label: 'Bot Activity', value: 'bots' as const },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab.value
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              All clear! No security alerts at this time.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border p-6 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl mt-1">{getTypeIcon(alert.type)}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold">
                        {getSeverityIcon(alert.severity)}
                      </span>
                      <h3 className="text-lg font-bold">{alert.title}</h3>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-current/20">
                        Risk: {alert.riskScore}
                      </span>
                    </div>
                    <p className="text-sm opacity-90">{alert.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-2xl opacity-50 hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <p className="text-xs opacity-75 mb-1">IP Address</p>
                  <p className="text-sm font-mono">{alert.ip}</p>
                </div>
                <div>
                  <p className="text-xs opacity-75 mb-1">Country</p>
                  <p className="text-sm">{alert.country}</p>
                </div>
                <div>
                  <p className="text-xs opacity-75 mb-1">Timestamp</p>
                  <p className="text-sm">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-75 mb-1">Type</p>
                  <p className="text-sm capitalize">{alert.type}</p>
                </div>
              </div>

              {alert.actionTaken && (
                <div className="bg-current/10 rounded p-3 text-sm">
                  <p className="font-semibold mb-1">✓ Action Taken:</p>
                  <p className="opacity-90">{alert.actionTaken}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Suspicious IPs Whitelist */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white">
            IP Reputation
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2">
                SUSPICIOUS IPs
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {metrics.suspiciousIPs}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Blacklisted
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2">
                BLOCKED ATTACKS
              </p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {metrics.fraudCasesBlocked + metrics.ddosAttempts}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Total
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2">
                SUCCESS RATE
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                99.8%
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Detection
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
        <p className="text-sm text-purple-800 dark:text-purple-200">
          💡 Our security system analyzes 5 factors: user agent, click patterns, interactions, geolocation, and network behavior. All data is encrypted and GDPR-compliant.
        </p>
      </div>
    </div>
  );
}
