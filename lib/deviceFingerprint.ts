/**
 * Device Fingerprinting System
 * 
 * Creates unique device identifier by combining:
 * - Browser & OS info
 * - Screen characteristics
 * - Canvas fingerprint
 * - WebGL fingerprint
 * - Timezone & language
 * 
 * Does NOT collect personal data
 * Allows detection of same device across sessions
 */

interface DeviceFingerprint {
  fingerprint: string // SHA256 hash
  components: {
    userAgent: string
    screenResolution: string
    colorDepth: number
    timezone: string
    language: string
    canvasFingerprint: string
    webglFingerprint: string
    fontsAvailable: string[]
  }
}

/**
 * Generate unique device fingerprint
 */
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  const components = {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    canvasFingerprint: await getCanvasFingerprint(),
    webglFingerprint: getWebGLFingerprint(),
    fontsAvailable: getAvailableFonts()
  }

  // Combine all components into a string
  const combined = JSON.stringify(components)
  
  // Generate SHA256 hash
  const fingerprint = await hashString(combined)

  return { fingerprint, components }
}

/**
 * Get canvas fingerprint (browser rendering quirks)
 */
async function getCanvasFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return 'canvas-unavailable'
    
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('Browser Fingerprint 🔐', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('Browser Fingerprint 🔐', 4, 17)

    return canvas.toDataURL()
  } catch (error) {
    return 'canvas-error'
  }
}

/**
 * Get WebGL fingerprint (GPU information)
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (!gl) return 'webgl-unavailable'

    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      return `${vendor}-${renderer}`
    }

    return 'webgl-limited'
  } catch (error) {
    return 'webgl-error'
  }
}

/**
 * Get available fonts (system fonts installed)
 */
function getAvailableFonts(): string[] {
  const baseFonts = ['monospace', 'sans-serif', 'serif']
  const testFonts = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New',
    'Georgia', 'Palatino', 'Garamond', 'Bookman',
    'Comic Sans MS', 'Trebuchet MS', 'Impact'
  ]

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return []

  const getTextWidth = (font: string) => {
    ctx.font = `16px ${font}`
    return ctx.measureText('mmmmmmmmmmlli').width
  }

  const available: string[] = []

  testFonts.forEach(font => {
    const fontFamily = `"${font}", monospace`
    const width1 = getTextWidth(fontFamily)
    const width2 = getTextWidth('monospace')
    
    if (width1 !== width2) {
      available.push(font)
    }
  })

  return available
}

/**
 * SHA256 hash function
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Get device information from user agent
 */
export function getDeviceInfo() {
  const ua = navigator.userAgent

  // Device type detection
  let deviceType = 'desktop'
  let deviceBrand = 'Unknown'
  let deviceModel = 'Unknown'

  if (/mobile/i.test(ua)) deviceType = 'mobile'
  else if (/tablet/i.test(ua)) deviceType = 'tablet'
  else if (/ipad/i.test(ua)) deviceType = 'tablet'

  // Brand detection
  if (/iPhone/i.test(ua)) {
    deviceBrand = 'Apple'
    deviceModel = extractModel(/iPhone\s*([\d\w\s]+)/i, ua) || 'iPhone'
  } else if (/iPad/i.test(ua)) {
    deviceBrand = 'Apple'
    deviceModel = 'iPad'
  } else if (/Android/i.test(ua)) {
    deviceBrand = extractModel(/Android.*?;?\s*([a-zA-Z\s]+)\s+Build/i, ua) || 'Android'
    deviceModel = extractModel(/Android.*?\s([^;]*Build)/i, ua) || 'Device'
  } else if (/Windows/i.test(ua)) {
    deviceBrand = 'Windows'
    deviceModel = 'PC'
  } else if (/Mac/i.test(ua)) {
    deviceBrand = 'Apple'
    deviceModel = 'Mac'
  }

  // Browser detection
  let browser = 'Unknown'
  let browserVersion = 'Unknown'

  if (/Chrome/i.test(ua)) {
    browser = 'Chrome'
    browserVersion = extractVersion(/Chrome\/([\d.]+)/i, ua)
  } else if (/Safari/i.test(ua)) {
    browser = 'Safari'
    browserVersion = extractVersion(/Version\/([\d.]+)/i, ua)
  } else if (/Firefox/i.test(ua)) {
    browser = 'Firefox'
    browserVersion = extractVersion(/Firefox\/([\d.]+)/i, ua)
  } else if (/Edge/i.test(ua)) {
    browser = 'Edge'
    browserVersion = extractVersion(/Edge\/([\d.]+)/i, ua)
  }

  // OS detection
  let os = 'Unknown'
  let osVersion = 'Unknown'

  if (/Windows/i.test(ua)) {
    os = 'Windows'
    osVersion = extractVersion(/Windows NT ([\d.]+)/i, ua)
  } else if (/Mac OS/i.test(ua)) {
    os = 'macOS'
    osVersion = extractVersion(/Mac OS X ([\d_]+)/i, ua)
  } else if (/Android/i.test(ua)) {
    os = 'Android'
    osVersion = extractVersion(/Android ([\d.]+)/i, ua)
  } else if (/iPhone|iPad/i.test(ua)) {
    os = 'iOS'
    osVersion = extractVersion(/OS ([\d_]+)/i, ua)
  }

  return {
    deviceType,
    deviceBrand,
    deviceModel,
    browser,
    browserVersion,
    os,
    osVersion,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language
  }
}

function extractModel(regex: RegExp, str: string): string | null {
  const match = str.match(regex)
  return match ? match[1].trim() : null
}

function extractVersion(regex: RegExp, str: string): string {
  const match = str.match(regex)
  return match ? match[1] : 'Unknown'
}
