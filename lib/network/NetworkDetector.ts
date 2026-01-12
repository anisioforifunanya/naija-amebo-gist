// Network Provider Detection & ISP Identification
// Detects internet service providers, network types, and connection quality

export interface NetworkInfo {
  // ISP Information
  isp: string; // e.g., "MTN Nigeria", "Airtel", "Glo Mobile"
  asn?: string; // Autonomous System Number
  domain?: string;
  
  // Network Type
  networkType: 'mobile' | 'wifi' | 'broadband' | 'satellite' | 'unknown';
  mobileOperator?: string; // MTN, Airtel, Glo, 9Mobile, etc.
  
  // Connection Quality
  connectionSpeed: 'slow' | 'moderate' | 'fast' | 'very-fast' | 'unknown';
  estimatedSpeed?: number; // kbps
  
  // Network Status
  isOnline: boolean;
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  
  timestamp: number;
}

// Nigerian Mobile Operator IP Ranges (Examples - in production use MaxMind GeoIP2)
const NIGERIAN_OPERATORS = {
  MTN: {
    name: 'MTN Nigeria',
    ranges: [
      // Examples - real ranges would come from IP geolocation service
      { start: '197.253.0.0', end: '197.253.255.255' },
      { start: '196.1.100.0', end: '196.1.100.255' },
    ],
  },
  AIRTEL: {
    name: 'Airtel Nigeria',
    ranges: [
      { start: '196.6.220.0', end: '196.6.220.255' },
      { start: '196.12.96.0', end: '196.12.99.255' },
    ],
  },
  GLO: {
    name: 'Globacom Nigeria',
    ranges: [
      { start: '196.4.160.0', end: '196.4.160.255' },
    ],
  },
  NINEMOBILE: {
    name: '9Mobile Nigeria',
    ranges: [
      { start: '196.32.104.0', end: '196.32.104.255' },
    ],
  },
};

/**
 * Get network information from device
 * Client-side detection
 */
export function getNetworkInfoBrowser(): Partial<NetworkInfo> {
  if (typeof window === 'undefined') {
    return {};
  }

  const navigator = window.navigator as any;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  let networkType: NetworkInfo['networkType'] = 'unknown';
  let effectiveType: NetworkInfo['effectiveType'] | undefined;
  let estimatedSpeed: number | undefined;

  if (connection) {
    // Detect network type from connection API
    effectiveType = connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'

    // Estimate speed based on effective type
    switch (effectiveType) {
      case '4g':
        estimatedSpeed = 10000; // 10 Mbps
        networkType = 'broadband';
        break;
      case '3g':
        estimatedSpeed = 1000; // 1 Mbps
        networkType = 'mobile';
        break;
      case '2g':
        estimatedSpeed = 100; // 100 kbps
        networkType = 'mobile';
        break;
      case 'slow-2g':
        estimatedSpeed = 50; // 50 kbps
        networkType = 'mobile';
        break;
    }

    // Detect if using mobile or WiFi
    if (connection.type === 'wifi' || connection.type === 'ethernet') {
      networkType = connection.type === 'wifi' ? 'wifi' : 'broadband';
    } else if (connection.type === 'cellular') {
      networkType = 'mobile';
    }
  }

  // Fallback detection based on device capabilities
  if (networkType === 'unknown') {
    const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
    networkType = isMobile ? 'mobile' : 'broadband';
  }

  return {
    networkType,
    effectiveType,
    estimatedSpeed,
    isOnline: navigator.onLine,
    timestamp: Date.now(),
  };
}

/**
 * Detect Nigerian mobile operator from IP address
 * Server-side function (requires IP geolocation service)
 */
export async function detectNigerianOperatorFromIP(
  ipAddress: string,
  geoIpService?: any
): Promise<string | undefined> {
  if (!ipAddress) return undefined;

  try {
    // In production, use MaxMind GeoIP2 or similar service
    // This is a simplified example using IP ranges

    // Parse IP to check against known ranges
    for (const [key, operator] of Object.entries(NIGERIAN_OPERATORS)) {
      for (const range of operator.ranges) {
        if (isIPInRange(ipAddress, range.start, range.end)) {
          return operator.name;
        }
      }
    }

    return undefined;
  } catch (error) {
    console.error('Error detecting operator:', error);
    return undefined;
  }
}

/**
 * Check if IP is within a range
 */
function isIPInRange(ip: string, start: string, end: string): boolean {
  try {
    const ipNum = ipToNumber(ip);
    const startNum = ipToNumber(start);
    const endNum = ipToNumber(end);
    return ipNum >= startNum && ipNum <= endNum;
  } catch {
    return false;
  }
}

/**
 * Convert IP address to number for range comparison
 */
function ipToNumber(ip: string): number {
  const parts = ip.split('.');
  return (
    parseInt(parts[0], 10) * 16777216 +
    parseInt(parts[1], 10) * 65536 +
    parseInt(parts[2], 10) * 256 +
    parseInt(parts[3], 10)
  );
}

/**
 * Detect connection speed level
 */
export function detectConnectionSpeed(estimatedSpeed?: number): NetworkInfo['connectionSpeed'] {
  if (!estimatedSpeed) return 'unknown';

  if (estimatedSpeed >= 5000) return 'very-fast'; // >= 5 Mbps
  if (estimatedSpeed >= 1000) return 'fast'; // >= 1 Mbps
  if (estimatedSpeed >= 200) return 'moderate'; // >= 200 kbps
  return 'slow'; // < 200 kbps
}

/**
 * Get network display name
 */
export function getNetworkDisplayName(info: NetworkInfo): string {
  if (info.mobileOperator) {
    return `${info.mobileOperator} (Mobile)`;
  }

  const typeLabel: Record<NetworkInfo['networkType'], string> = {
    mobile: 'Mobile Network',
    wifi: 'WiFi',
    broadband: 'Broadband',
    satellite: 'Satellite',
    unknown: 'Unknown Network',
  };

  return typeLabel[info.networkType];
}

/**
 * Estimate data usage based on connection
 */
export function estimateDataUsageClass(info: NetworkInfo): 'high' | 'medium' | 'low' {
  if (info.connectionSpeed === 'slow' || info.connectionSpeed === 'moderate') {
    return 'low'; // Use low-resolution images, less video
  }
  if (info.networkType === 'mobile') {
    return 'medium'; // Moderate data usage
  }
  return 'high'; // Full quality content
}

/**
 * Generate complete network info
 */
export async function generateNetworkInfo(ipAddress?: string, geoIpService?: any): Promise<NetworkInfo> {
  const browserInfo = getNetworkInfoBrowser();
  
  let mobileOperator: string | undefined;
  if (ipAddress) {
    mobileOperator = await detectNigerianOperatorFromIP(ipAddress, geoIpService);
  }

  const connectionSpeed = detectConnectionSpeed(browserInfo.estimatedSpeed);

  return {
    isp: 'Unknown ISP',
    networkType: browserInfo.networkType || 'unknown',
    mobileOperator,
    connectionSpeed,
    estimatedSpeed: browserInfo.estimatedSpeed,
    isOnline: browserInfo.isOnline !== false,
    effectiveType: browserInfo.effectiveType as any,
    timestamp: Date.now(),
  };
}

/**
 * Monitor connection quality changes
 */
export function onConnectionChange(callback: (info: NetworkInfo) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const navigator = window.navigator as any;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  const updateCallback = async () => {
    const info = await generateNetworkInfo();
    callback(info);
  };

  // Setup listeners
  window.addEventListener('online', updateCallback);
  window.addEventListener('offline', updateCallback);

  if (connection) {
    connection.addEventListener('change', updateCallback);
  }

  // Return unsubscribe function
  return () => {
    window.removeEventListener('online', updateCallback);
    window.removeEventListener('offline', updateCallback);
    if (connection) {
      connection.removeEventListener('change', updateCallback);
    }
  };
}
