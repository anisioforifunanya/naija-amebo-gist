// Device Fingerprinting & Detection
// Creates non-personal device identifiers for fraud detection and repeat user identification

import crypto from 'crypto';

export interface DeviceInfo {
  // Device identification
  fingerprint: string; // Hashed device fingerprint
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  brand?: string; // Samsung, Apple, etc.
  model?: string; // Galaxy A14, iPhone 13, etc.
  
  // OS information
  osName: string;
  osVersion: string;
  
  // Browser information
  browserName: string;
  browserVersion: string;
  
  // Screen information
  screenWidth: number;
  screenHeight: number;
  screenDPI: number;
  colorDepth: number;
  
  // Capabilities
  timezone: string;
  language: string;
  webGL?: string;
  canvasFingerprint?: string;
  
  // Flags
  isTouchEnabled: boolean;
  isOnline: boolean;
  
  timestamp: number;
}

/**
 * Get device fingerprint from browser
 * Client-side function
 */
export async function getDeviceFingerprintBrowser(): Promise<Partial<DeviceInfo>> {
  if (typeof window === 'undefined') {
    return {};
  }

  const navigator = window.navigator;
  const screen = window.screen;

  // Get user agent
  const userAgent = navigator.userAgent;

  // Parse device type and info
  const deviceInfo = parseUserAgent(userAgent);

  // Get WebGL info
  const webglInfo = getWebGLInfo();

  // Get canvas fingerprint
  const canvasFingerprint = getCanvasFingerprint();

  const fingerprinting: Partial<DeviceInfo> = {
    type: deviceInfo.deviceType,
    brand: deviceInfo.brand,
    model: deviceInfo.model,
    osName: deviceInfo.osName,
    osVersion: deviceInfo.osVersion,
    browserName: deviceInfo.browserName,
    browserVersion: deviceInfo.browserVersion,
    screenWidth: screen.width,
    screenHeight: screen.height,
    screenDPI: window.devicePixelRatio * 96,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    webGL: webglInfo,
    canvasFingerprint,
    isTouchEnabled: (() => {
      return (
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0 ||
        // @ts-ignore
        (window.ontouchstart !== undefined)
      );
    })(),
    isOnline: navigator.onLine,
    timestamp: Date.now(),
  };

  return fingerprinting;
}

/**
 * Parse user agent to get device, OS, and browser info
 */
function parseUserAgent(userAgent: string): {
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  brand?: string;
  model?: string;
  osName: string;
  osVersion: string;
  browserName: string;
  browserVersion: string;
} {
  // Detect device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'desktop';
  let brand: string | undefined;
  let model: string | undefined;

  if (/Mobile|Android|iPhone|iPad|iPod|Windows Phone|IEMobile/.test(userAgent)) {
    deviceType = /iPad|Android/.test(userAgent) ? 'tablet' : 'mobile';
  }

  // Detect brand and model
  if (/iPhone/.test(userAgent)) {
    brand = 'Apple';
    const match = userAgent.match(/iPhone\s*([\d_]+)/);
    model = match ? `iPhone ${match[1]}` : 'iPhone';
  } else if (/iPad/.test(userAgent)) {
    brand = 'Apple';
    const match = userAgent.match(/iPad\s*([\d_]+)?/);
    model = match ? `iPad ${match[1] || ''}`.trim() : 'iPad';
  } else if (/Android/.test(userAgent)) {
    brand = 'Android';
    const match = userAgent.match(/Android.*?([a-zA-Z\s]+Build)/);
    model = match ? match[1].trim() : 'Android Device';
  } else if (/Windows Phone/.test(userAgent)) {
    brand = 'Microsoft';
    model = 'Windows Phone';
  }

  // Detect OS
  let osName = 'Unknown OS';
  let osVersion = 'Unknown';

  if (/Windows NT 10.0/.test(userAgent)) {
    osName = 'Windows';
    osVersion = '10';
  } else if (/Windows NT 6.3/.test(userAgent)) {
    osName = 'Windows';
    osVersion = '8.1';
  } else if (/Windows NT 6.2/.test(userAgent)) {
    osName = 'Windows';
    osVersion = '8';
  } else if (/Mac/.test(userAgent)) {
    osName = 'macOS';
    const match = userAgent.match(/Mac OS X ([\d_]+)/);
    osVersion = match ? match[1].replace(/_/g, '.') : 'Unknown';
  } else if (/Android/.test(userAgent)) {
    osName = 'Android';
    const match = userAgent.match(/Android ([\d.]+)/);
    osVersion = match ? match[1] : 'Unknown';
  } else if (/iPhone|iPad|iPod/.test(userAgent)) {
    osName = 'iOS';
    const match = userAgent.match(/OS ([\d_]+)/);
    osVersion = match ? match[1].replace(/_/g, '.') : 'Unknown';
  } else if (/Linux/.test(userAgent)) {
    osName = 'Linux';
    osVersion = 'Unknown';
  }

  // Detect browser
  let browserName = 'Unknown Browser';
  let browserVersion = 'Unknown';

  if (/Chrome/.test(userAgent) && !/Chromium|Edg/.test(userAgent)) {
    browserName = 'Chrome';
    const match = userAgent.match(/Chrome\/([\d.]+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (/Safari/.test(userAgent) && !/Chrome|Chromium|Edg/.test(userAgent)) {
    browserName = 'Safari';
    const match = userAgent.match(/Version\/([\d.]+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (/Firefox/.test(userAgent)) {
    browserName = 'Firefox';
    const match = userAgent.match(/Firefox\/([\d.]+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (/Edg/.test(userAgent)) {
    browserName = 'Edge';
    const match = userAgent.match(/Edg\/([\d.]+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }

  return {
    deviceType,
    brand,
    model,
    osName,
    osVersion,
    browserName,
    browserVersion,
  };
}

/**
 * Get WebGL renderer info (GPU)
 */
function getWebGLInfo(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return undefined;

    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return undefined;

    return (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  } catch {
    return undefined;
  }
}

/**
 * Get canvas fingerprint hash
 */
function getCanvasFingerprint(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Browser Fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Browser Fingerprint', 4, 17);

    const canvasData = canvas.toDataURL();
    return canvasData.substring(0, 50); // Use first 50 chars as fingerprint
  } catch {
    return undefined;
  }
}

/**
 * Hash device fingerprint for privacy
 */
export function hashDeviceFingerprint(data: Partial<DeviceInfo>): string {
  const fingerprintString = JSON.stringify({
    type: data.type,
    brand: data.brand,
    model: data.model,
    osName: data.osName,
    osVersion: data.osVersion,
    browserName: data.browserName,
    browserVersion: data.browserVersion,
    screenWidth: data.screenWidth,
    screenHeight: data.screenHeight,
    colorDepth: data.colorDepth,
    webGL: data.webGL,
    language: data.language,
  });

  // Create SHA256 hash
  return crypto
    .createHash('sha256')
    .update(fingerprintString)
    .digest('hex');
}

/**
 * Generate complete device info with fingerprint
 */
export async function generateDeviceInfo(): Promise<DeviceInfo | null> {
  if (typeof window === 'undefined') return null;

  const baseInfo = await getDeviceFingerprintBrowser();
  
  return {
    fingerprint: hashDeviceFingerprint(baseInfo),
    type: baseInfo.type || 'unknown',
    brand: baseInfo.brand,
    model: baseInfo.model,
    osName: baseInfo.osName || 'Unknown',
    osVersion: baseInfo.osVersion || 'Unknown',
    browserName: baseInfo.browserName || 'Unknown',
    browserVersion: baseInfo.browserVersion || 'Unknown',
    screenWidth: baseInfo.screenWidth || 0,
    screenHeight: baseInfo.screenHeight || 0,
    screenDPI: baseInfo.screenDPI || 96,
    colorDepth: baseInfo.colorDepth || 24,
    timezone: baseInfo.timezone || 'UTC',
    language: baseInfo.language || 'en',
    webGL: baseInfo.webGL,
    canvasFingerprint: baseInfo.canvasFingerprint,
    isTouchEnabled: baseInfo.isTouchEnabled || false,
    isOnline: baseInfo.isOnline !== false,
    timestamp: Date.now(),
  };
}

/**
 * Compare device fingerprints (for repeat user detection)
 */
export function compareFingerprints(fp1: string, fp2: string): boolean {
  return fp1 === fp2;
}

/**
 * Get device display name (user-friendly)
 */
export function getDeviceDisplayName(info: DeviceInfo): string {
  if (info.model) {
    return `${info.brand || 'Device'} ${info.model}`;
  }

  const typeLabel = {
    desktop: 'Desktop',
    mobile: 'Mobile',
    tablet: 'Tablet',
    unknown: 'Unknown Device',
  };

  return `${typeLabel[info.type]} (${info.osName})`;
}
