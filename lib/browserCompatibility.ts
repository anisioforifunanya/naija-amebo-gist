/**
 * Browser Compatibility Configuration
 * Supports: Chrome, Firefox, Safari, Edge, Opera, Internet Explorer 11+
 * Mobile: iOS Safari 12+, Chrome Android, Samsung Internet, Firefox Mobile
 * 
 * Generated: January 5, 2026
 */

// Browser detection utilities
export const detectBrowser = () => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  
  return {
    isChrome: /Chrome/.test(ua) && /Google Inc/.test(navigator?.vendor || ''),
    isFirefox: /Firefox/.test(ua),
    isSafari: /Safari/.test(ua) && /Apple Computer/.test(navigator?.vendor || ''),
    isEdge: /Edg/.test(ua),
    isOpera: /OPR/.test(ua),
    isIE11: /Trident/.test(ua) && /rv:11/.test(ua),
    isAndroid: /Android/.test(ua),
    isIOS: /iPhone|iPad|iPod/.test(ua),
    isMobile: /Mobile|Android|iPhone/.test(ua),
  }
}

// Feature detection
export const supportsFeatures = () => {
  if (typeof window === 'undefined') {
    return {
      cssGrid: false,
      flexbox: false,
      transforms: false,
      requestAnimationFrame: false,
      intersectionObserver: false,
      localStorage: false,
      fetch: false,
    }
  }
  
  return {
    cssGrid: CSS && CSS.supports && CSS.supports('display', 'grid'),
    flexbox: CSS && CSS.supports && CSS.supports('display', 'flex'),
    transforms: CSS && CSS.supports && CSS.supports('transform', 'translate(0, 0)'),
    requestAnimationFrame: typeof requestAnimationFrame !== 'undefined',
    intersectionObserver: typeof IntersectionObserver !== 'undefined',
    localStorage: typeof localStorage !== 'undefined',
    fetch: typeof fetch !== 'undefined',
  }
}

// Polyfills and fallbacks
export const applyPolyfills = () => {
  // requestAnimationFrame polyfill for older browsers
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'undefined') {
    let lastTime = 0
    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      const currentTime = new Date().getTime()
      const timeToCall = Math.max(0, 16 - (currentTime - lastTime))
      const id = setTimeout(() => {
        callback(currentTime + timeToCall)
      }, timeToCall)
      lastTime = currentTime + timeToCall
      return id as unknown as number
    }
  }
  
  // cancelAnimationFrame polyfill
  if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'undefined') {
    window.cancelAnimationFrame = (id: number) => {
      clearTimeout(id)
    }
  }
  
  // Object.assign polyfill for IE11
  if (typeof Object.assign !== 'function') {
    Object.defineProperty(Object, 'assign', {
      value: function assign(target: any, varArgs: any) {
        if (target === null || target === undefined) {
          throw new TypeError('Cannot convert undefined or null to object')
        }
        const to = Object(target)
        for (let index = 1; index < arguments.length; index++) {
          const nextSource = arguments[index]
          if (nextSource !== null && nextSource !== undefined) {
            for (const nextKey in nextSource) {
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey]
              }
            }
          }
        }
        return to
      },
      writable: true,
      configurable: true,
    })
  }
  
  // Array.from polyfill for IE11
  if (!Array.from) {
    Array.from = function (arrayLike: any) {
      if (!arrayLike) return []
      const arr = []
      for (let i = 0; i < arrayLike.length; i++) {
        arr.push(arrayLike[i])
      }
      return arr
    }
  }
  
  // String.prototype.includes polyfill for IE11
  if (!String.prototype.includes) {
    String.prototype.includes = function (search: string, start?: number) {
      if (typeof start !== 'number') {
        start = 0
      }
      return this.indexOf(search, start) !== -1
    }
  }
}

// CSS prefixes for cross-browser support
export const getCSSPrefix = () => {
  if (typeof window === 'undefined') return ''
  
  const styles = window.getComputedStyle(document.documentElement)
  const prefix = Array.from(styles).find(s => s.startsWith('-moz-') || s.startsWith('-webkit-') || s.startsWith('-ms-'))
  
  if (prefix?.startsWith('-webkit-')) return '-webkit-'
  if (prefix?.startsWith('-moz-')) return '-moz-'
  if (prefix?.startsWith('-ms-')) return '-ms-'
  
  return ''
}

// Viewport meta tag validation
export const validateViewport = () => {
  const viewport = document.querySelector('meta[name="viewport"]')
  if (!viewport) {
    console.warn('Viewport meta tag not found. Add: <meta name="viewport" content="width=device-width, initial-scale=1">')
    return false
  }
  return true
}

// Touch event support detection
export const hasTouchSupport = () => {
  if (typeof window === 'undefined') return false
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  )
}

// Local storage fallback
export const getStorage = () => {
  if (typeof localStorage !== 'undefined') {
    return localStorage
  }
  
  // Fallback in-memory storage for browsers without localStorage
  const memoryStorage: { [key: string]: string } = {}
  
  return {
    getItem: (key: string) => memoryStorage[key] || null,
    setItem: (key: string, value: string) => {
      memoryStorage[key] = value
    },
    removeItem: (key: string) => {
      delete memoryStorage[key]
    },
    clear: () => {
      for (const key in memoryStorage) {
        delete memoryStorage[key]
      }
    },
  }
}

// Initialize all polyfills on app load
export const initializeCompatibility = () => {
  applyPolyfills()
  validateViewport()
}

export default {
  detectBrowser,
  supportsFeatures,
  applyPolyfills,
  getCSSPrefix,
  validateViewport,
  hasTouchSupport,
  getStorage,
  initializeCompatibility,
}
