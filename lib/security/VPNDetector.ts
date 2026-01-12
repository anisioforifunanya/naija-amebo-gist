// VPN & Proxy Detection System
// Identifies users accessing via VPN or proxy services

export interface VPNDetectionResult {
  isVPN: boolean;
  isProxy: boolean;
  confidence: number; // 0-1
  indicators: string[];
  vpnProvider?: string;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: number;
}

/**
 * Known VPN provider IP ranges (simplified example)
 * In production, use MaxMind, IPQualityScore, or similar services
 */
const KNOWN_VPN_PROVIDERS = {
  'NordVPN': ['185.215.0.0/16', '45.33.0.0/16'],
  'ExpressVPN': ['31.171.0.0/16', '45.32.0.0/16'],
  'Surfshark': ['45.142.0.0/16', '89.163.0.0/16'],
  'CyberGhost': ['79.110.0.0/16', '45.33.0.0/16'],
  'ProtonVPN': ['185.10.0.0/16', '178.175.0.0/16'],
};

/**
 * Known proxy provider characteristics
 */
const PROXY_INDICATORS = {
  'X-Forwarded-For': true,
  'X-Forwarded-Host': true,
  'X-Forwarded-Proto': true,
  'X-Real-IP': true,
  'CF-Connecting-IP': true,
  'Cloudflare-Client-IP': true,
  'X-Client-IP': true,
  'Via': true,
};

/**
 * Detect VPN usage from IP address
 * Server-side function
 */
export function detectVPNFromIP(
  ipAddress: string,
  reverseHostname?: string,
  headers?: Record<string, string>
): VPNDetectionResult {
  const indicators: string[] = [];
  let confidence = 0;
  let vpnProvider: string | undefined;

  // Check against known VPN providers
  for (const [provider, ranges] of Object.entries(KNOWN_VPN_PROVIDERS)) {
    if (isIPInRanges(ipAddress, ranges)) {
      indicators.push(`IP matches known ${provider} range`);
      confidence += 0.4;
      vpnProvider = provider;
    }
  }

  // Check reverse DNS for VPN indicators
  if (reverseHostname) {
    if (/vpn|proxy|anonymous|hide/.test(reverseHostname.toLowerCase())) {
      indicators.push('VPN/proxy keywords in reverse DNS');
      confidence += 0.3;
    }
  }

  // Check for proxy headers
  if (headers) {
    const proxyHeadersFound = detectProxyHeaders(headers);
    if (proxyHeadersFound.detected) {
      indicators.push(...proxyHeadersFound.headers);
      confidence += 0.2;
    }
  }

  // Check for datacenter IP
  if (isDatacenterIP(ipAddress)) {
    indicators.push('IP belongs to datacenter (common for VPN)');
    confidence += 0.15;
  }

  // Calculate risk level
  const riskLevel = calculateRiskLevel(confidence);

  return {
    isVPN: confidence > 0.4,
    isProxy: confidence > 0.3,
    confidence: Math.min(confidence, 1),
    indicators,
    vpnProvider,
    riskLevel,
    timestamp: Date.now(),
  };
}

/**
 * Detect proxy headers in HTTP request
 */
function detectProxyHeaders(headers: Record<string, string>): {
  detected: boolean;
  headers: string[];
} {
  const foundHeaders: string[] = [];

  for (const [header, _] of Object.entries(PROXY_INDICATORS)) {
    if (header.toLowerCase() in headers) {
      foundHeaders.push(`Proxy header: ${header}`);
    }
  }

  return {
    detected: foundHeaders.length > 0,
    headers: foundHeaders,
  };
}

/**
 * Check if IP is in any of the given CIDR ranges
 */
function isIPInRanges(ip: string, ranges: string[]): boolean {
  for (const range of ranges) {
    if (isIPInRange(ip, range)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if IP is in CIDR range
 */
function isIPInRange(ip: string, cidr: string): boolean {
  const [range, maskBits] = cidr.split('/');
  if (!range || !maskBits) return false;

  try {
    const ipNum = ipToNumber(ip);
    const rangeNum = ipToNumber(range);
    const mask = -1 << (32 - parseInt(maskBits, 10));

    return (ipNum & mask) === (rangeNum & mask);
  } catch {
    return false;
  }
}

/**
 * Convert IP to 32-bit number
 */
function ipToNumber(ip: string): number {
  const parts = ip.split('.');
  if (parts.length !== 4) return 0;

  return (
    (parseInt(parts[0], 10) << 24) +
    (parseInt(parts[1], 10) << 16) +
    (parseInt(parts[2], 10) << 8) +
    parseInt(parts[3], 10)
  );
}

/**
 * Check if IP belongs to a datacenter
 * Datacenters are common for VPN providers
 */
function isDatacenterIP(ip: string): boolean {
  // Simplified check - in production use proper IP intelligence API
  const datacenters = [
    '45.33.0.0/16', // Linode
    '45.32.0.0/16', // Vultr
    '104.200.0.0/13', // DigitalOcean
    '178.175.0.0/16', // Another provider
  ];

  return isIPInRanges(ip, datacenters);
}

/**
 * Calculate risk level based on confidence
 */
function calculateRiskLevel(
  confidence: number
): 'low' | 'medium' | 'high' {
  if (confidence >= 0.7) return 'high';
  if (confidence >= 0.4) return 'medium';
  return 'low';
}

/**
 * Detect proxy from client-side (limited)
 * Client-side detection is limited but can catch obvious proxies
 */
export async function detectProxyClientSide(): Promise<Partial<VPNDetectionResult>> {
  if (typeof window === 'undefined') {
    return {};
  }

  const indicators: string[] = [];
  let confidence = 0;

  // Check for WebRTC leak (reveals real IP)
  const realIP = await detectWebRTCIP();
  const clientIP = await getClientIP();

  if (realIP && clientIP && realIP !== clientIP) {
    indicators.push('WebRTC IP mismatch suggests proxy/VPN');
    confidence += 0.3;
  }

  // Check for DNS leaks
  const dnsLeakDetected = await detectDNSLeak();
  if (dnsLeakDetected) {
    indicators.push('Possible DNS leak suggests proxy');
    confidence += 0.2;
  }

  // Check browser language and timezone mismatch
  const browserLang = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // This would need to be compared with actual user location

  return {
    isVPN: confidence > 0.4,
    isProxy: confidence > 0.3,
    confidence: Math.min(confidence, 1),
    indicators,
    riskLevel: calculateRiskLevel(confidence),
    timestamp: Date.now(),
  };
}

/**
 * Detect WebRTC IP leak
 */
async function detectWebRTCIP(): Promise<string | null> {
  return new Promise((resolve) => {
    const pc = new (window as any).RTCPeerConnection({ iceServers: [] });
    const ips: string[] = [];

    pc.createDataChannel('');
    pc.createOffer().then((offer: any) => {
      return pc.setLocalDescription(offer);
    });

    pc.onicecandidate = (ice: any) => {
      if (!ice || !ice.candidate) return;
      const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
      const match = ipRegex.exec(ice.candidate.candidate);
      if (match) {
        ips.push(match[1]);
      }
    };

    setTimeout(() => {
      pc.close();
      resolve(ips.length > 0 ? ips[0] : null);
    }, 1000);
  });
}

/**
 * Get client IP from server response
 */
async function getClientIP(): Promise<string | null> {
  try {
    const response = await fetch('/api/analytics/get-client-ip');
    const data = await response.json();
    return data.ip || null;
  } catch {
    return null;
  }
}

/**
 * Detect DNS leaks
 */
async function detectDNSLeak(): Promise<boolean> {
  // Simplified check
  // In production, would do actual DNS queries
  return false;
}

/**
 * Get VPN detection report
 */
export function getVPNDetectionReport(
  result: VPNDetectionResult
): string {
  let report = '## VPN/Proxy Detection Report\n\n';

  report += `**Status**: ${result.isVPN ? 'VPN Detected' : 'No VPN Detected'}\n`;
  report += `**Confidence**: ${(result.confidence * 100).toFixed(1)}%\n`;
  report += `**Risk Level**: ${result.riskLevel.toUpperCase()}\n`;

  if (result.vpnProvider) {
    report += `**Provider**: ${result.vpnProvider}\n`;
  }

  if (result.indicators.length > 0) {
    report += `\n**Indicators**:\n`;
    result.indicators.forEach((indicator) => {
      report += `- ${indicator}\n`;
    });
  }

  return report;
}
