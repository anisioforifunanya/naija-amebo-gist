# Analytics Implementation Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Start the Application (3 minutes)

```bash
# Install dependencies
npm install

# Start Next.js + WebSocket server
npm run dev
```

Your app will start at:
- Next.js: http://localhost:3000
- WebSocket: ws://localhost:8000

### Step 2: Enable Analytics Consent (1 minute)

```tsx
// In any component
import { ConsentManager } from '@/lib/privacy/PrivacyEngine';

function App() {
  const consentMgr = new ConsentManager();
  
  // User accepts analytics
  consentMgr.acceptAll();
  // or
  consentMgr.rejectAll(); // Only necessary tracking
}
```

### Step 3: View Real-Time Dashboard (1 minute)

Navigate to: `/super-admin/analytics`

You'll see:
- ✅ Live visitor count (updates every 100ms)
- ✅ Real-time page views
- ✅ Active visitor list
- ✅ Device breakdown
- ✅ Geographic distribution

---

## 🔧 Key Files & Their Purpose

### WebSocket (Real-Time Communication)
```
lib/websocket/WebSocketServer.ts
├─ Creates WebSocket server on port 8000
├─ Manages 10,000+ concurrent connections
├─ Broadcasts analytics every 100ms
└─ Handles reconnection logic

lib/hooks/useRealtimeAnalytics.ts
├─ React hook to subscribe to updates
├─ Auto-reconnect on disconnect
├─ Efficient batch message handling
└─ Provides: connected, updates, subscribe, unsubscribe
```

### Analytics Engine (Data Collection)
```
lib/analytics/RealtimeAnalyticsEngine.ts
├─ Tracks active visitor sessions
├─ Counts page views, clicks, scrolls
├─ Maintains live statistics
├─ Auto-cleans up expired sessions
└─ Emits events to WebSocket server
```

### Device Intelligence (Visitor Profiling)
```
lib/device/DeviceFingerprint.ts
├─ Generates non-personal device IDs
├─ Detects: brand, model, OS, browser
├─ SHA256 hashes for privacy
└─ Identifies repeat users

lib/network/NetworkDetector.ts
├─ Detects ISP (MTN, Airtel, Glo, etc.)
├─ Identifies network type (WiFi, mobile, broadband)
├─ Estimates connection speed
└─ Monitors real-time network changes
```

### Security (Fraud Detection)
```
lib/ai/AnomalyDetector.ts
├─ Detects bot activity
├─ Finds traffic anomalies
├─ Warns of DDoS patterns
└─ Uses Isolation Forest algorithm

lib/security/VPNDetector.ts
├─ Detects VPN usage
├─ Identifies proxies
├─ Flags risky IPs
└─ WebRTC leak detection
```

### Privacy (Compliance)
```
lib/privacy/PrivacyEngine.ts
├─ Consent management
├─ Data anonymization
├─ Data retention policies
├─ GDPR/NDPR compliance
└─ Right to erasure
```

---

## 💻 Common Tasks

### Task 1: Track a Page View

```tsx
// In your page component
import { useEffect } from 'react';

export default function MyPage() {
  useEffect(() => {
    // Track page view
    fetch('/api/analytics/realtime-init', {
      method: 'POST',
      body: JSON.stringify({
        action: 'track_page_view',
        sessionId: 'user-session-id',
        page: '/my-page',
        userId: 'optional-user-id',
      }),
    });
  }, []);

  return <h1>My Page</h1>;
}
```

### Task 2: Get Device Information

```tsx
import { generateDeviceInfo } from '@/lib/device/DeviceFingerprint';

async function getUserDevice() {
  const device = await generateDeviceInfo();
  console.log(device);
  // {
  //   fingerprint: "a1b2c3d4...",
  //   type: "mobile",
  //   brand: "Apple",
  //   model: "iPhone 13",
  //   osName: "iOS",
  //   browserName: "Safari",
  //   screenWidth: 390,
  //   ...
  // }
}
```

### Task 3: Get Network Information

```tsx
import { generateNetworkInfo } from '@/lib/network/NetworkDetector';

async function getUserNetwork() {
  const network = await generateNetworkInfo(ipAddress);
  console.log(network);
  // {
  //   networkType: "mobile",
  //   mobileOperator: "MTN Nigeria",
  //   connectionSpeed: "fast",
  //   estimatedSpeed: 10000,
  //   isOnline: true,
  //   ...
  // }
}
```

### Task 4: Check for Anomalies

```tsx
import { getAnomalyDetector } from '@/lib/ai/AnomalyDetector';

function checkEvent(event: any) {
  const detector = getAnomalyDetector();
  const result = detector.detectAnomaly(event);
  
  if (result.isAnomaly) {
    console.warn(`⚠️ ${result.severity}: ${result.reasons}`);
    // Send alert to admin
  }
}
```

### Task 5: Detect VPN/Proxy

```tsx
import { detectVPNFromIP } from '@/lib/security/VPNDetector';

function checkVPN(ipAddress: string, hostname: string) {
  const result = detectVPNFromIP(ipAddress, hostname);
  
  if (result.isVPN) {
    console.log(`🔒 VPN Detected: ${result.vpnProvider}`);
    console.log(`📊 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`⚠️ Risk: ${result.riskLevel}`);
  }
}
```

### Task 6: Anonymize User Data

```tsx
import { AnonymizationEngine } from '@/lib/privacy/PrivacyEngine';

function anonymizeData(userData: any) {
  const anonymized = AnonymizationEngine.anonymizeAnalyticsData(userData);
  console.log(anonymized);
  // {
  //   sessionId: "abc123def456",  // hashed
  //   ipAddress: "192.168.1.0",   // last octet removed
  //   userAgent: "Windows/Chrome/120",  // simplified
  //   location: { country: "NG", region: "Lagos" },
  //   device: { type: "desktop" },
  //   timestamp: 1705084800000
  // }
}
```

### Task 7: Manage User Consent

```tsx
import { ConsentManager } from '@/lib/privacy/PrivacyEngine';

function ConsentBanner() {
  const consentMgr = new ConsentManager();
  
  const handleAccept = () => {
    consentMgr.acceptAll();
    // Enable analytics
  };
  
  const handleReject = () => {
    consentMgr.rejectAll();
    // Only necessary tracking
  };
  
  const hasConsent = consentMgr.hasAnalyticsConsent();
  
  return (
    <banner>
      {!hasConsent && (
        <>
          <button onClick={handleAccept}>Accept</button>
          <button onClick={handleReject}>Reject</button>
        </>
      )}
    </banner>
  );
}
```

---

## 📊 Real-Time Dashboard Features

The analytics dashboard at `/super-admin/analytics` includes:

### 📈 Real-Time Metrics
- **Online Now**: Live visitor count
- **Page Views**: Total pages viewed
- **Avg Session**: Average session duration
- **Bounce Rate**: Percentage of bounces

### 👥 Live Visitors
- Shows up to 20 active visitors
- Location (country • city)
- Device type (📱 vs 💻)
- Activity status (🟢 active, 🟡 idle, 🔴 away)
- Returning vs new

### 🌍 Geographic Distribution
- Interactive map (Leaflet)
- Visitor heat map by country
- Regional analytics

### 📱 Device Analytics
- Device type breakdown
- OS & browser distribution
- Screen size analysis

### 🔒 Security Monitoring
- Anomaly detection alerts
- Bot detection
- VPN/proxy flags
- DDoS early warnings

---

## ⚙️ Configuration

### Change WebSocket Port
```ts
// In server-with-ws.js
const wsPort = parseInt(process.env.WS_PORT || '8000', 10);
```

```bash
# Or via environment
WS_PORT=9000 npm run dev
```

### Adjust Anomaly Sensitivity
```ts
import { getAnomalyDetector } from '@/lib/ai/AnomalyDetector';

const detector = getAnomalyDetector();
detector.setThreshold(0.5); // 0.5 = more sensitive, 0.8 = less sensitive
```

### Change Data Retention
```ts
// In lib/privacy/PrivacyEngine.ts
private policies = {
  analytics: 60 * 24 * 60 * 60 * 1000,  // 60 days (default 90)
  userProfiles: 180 * 24 * 60 * 60 * 1000,  // 180 days (default 1 year)
};
```

---

## 🐛 Debugging

### Check WebSocket Connection
```ts
import { useRealtimeAnalytics } from '@/lib/hooks/useRealtimeAnalytics';

export function DebugComponent() {
  const { connected, error, lastUpdate } = useRealtimeAnalytics();
  
  return (
    <div>
      <p>Connected: {connected ? '✅' : '❌'}</p>
      <p>Error: {error || 'None'}</p>
      <p>Last Update: {lastUpdate?.timestamp}</p>
    </div>
  );
}
```

### Monitor Analytics Engine
```ts
import { getRealtimeAnalyticsEngine } from '@/lib/analytics/RealtimeAnalyticsEngine';

const engine = getRealtimeAnalyticsEngine();
console.log(engine.getSummary());
// Check active sessions, stats, etc.
```

### Check WebSocket Stats
```ts
import { getAnalyticsWebSocketServer } from '@/lib/websocket/WebSocketServer';

const wsServer = getAnalyticsWebSocketServer();
console.log(wsServer.getStats());
// { connectedClients: 100, queuedEvents: 50, ... }
```

---

## 🔐 Security Checklist

Before deploying:

- [ ] WebSocket runs on separate port (not exposed to clients unless needed)
- [ ] All device fingerprints are SHA256-hashed
- [ ] IP addresses are anonymized (last octet removed)
- [ ] User consent is enforced
- [ ] Sensitive fields are removed
- [ ] Data retention policies are active
- [ ] VPN/proxy detection is enabled
- [ ] Anomaly detection threshold is tuned

---

## 📞 Troubleshooting

### WebSocket Not Connecting
```bash
# Check if port 8000 is available
netstat -an | grep 8000

# Or use different port
WS_PORT=9000 npm run dev

# Check browser console for WebSocket errors
```

### Device Fingerprint Empty
```ts
// Make sure to run in browser (client-side)
// Not in server-side code
const device = await generateDeviceInfo();
if (!device) {
  console.error('Running in non-browser environment');
}
```

### Anomalies Not Detected
```ts
// Make sure detector is trained
const detector = getAnomalyDetector();
const baseline = detector.getBaseline();
if (!baseline) {
  console.warn('No baseline patterns yet - train on more data');
}
```

---

## 📚 Next Steps

1. ✅ Implement analytics tracking in all pages
2. ✅ Monitor the real-time dashboard
3. ✅ Test with real user traffic
4. ✅ Tune anomaly detection threshold
5. ✅ Review security alerts
6. ✅ Plan Phase 3: Session replay & heatmaps

---

## 📖 Full Documentation

For detailed information, see:
- `ANALYTICS_IMPLEMENTATION_ROADMAP.md` - Full 7-phase roadmap
- `ANALYTICS_IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- Inline code comments in each module

---

**Last Updated:** January 12, 2026
**Version:** 1.0.0
