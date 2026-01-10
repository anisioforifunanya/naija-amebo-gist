/**
 * Cross-browser storage synchronization utility
 * Syncs data across localStorage, sessionStorage, and server
 */

const STORAGE_KEY = 'naijaAmeboNews'
const SESSION_KEY = 'naijaAmeboNews_session'
const SYNC_ENDPOINT = '/api/admin/news'

export class StorageSync {
  /**
   * Save news to all available storages
   */
  static async saveNews(news: any[]) {
    try {
      // Save to localStorage (browser specific)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(news))
      }
    } catch (error) {
      console.warn('[StorageSync] localStorage save failed:', error)
    }

    try {
      // Save to sessionStorage (browser specific)
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(news))
      }
    } catch (error) {
      console.warn('[StorageSync] sessionStorage save failed:', error)
    }

    // Save to server (accessible from all browsers)
    try {
      for (const item of news) {
        await fetch(SYNC_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
      }
    } catch (error) {
      console.warn('[StorageSync] Server save failed:', error)
    }
  }

  /**
   * Load news from all available sources
   * Priority: Server > localStorage > sessionStorage > Static data
   */
  static async loadNews(fallbackData: any[] = []): Promise<any[]> {
    try {
      // Try server first (most reliable, accessible from all browsers)
      const serverResponse = await fetch(SYNC_ENDPOINT)
      if (serverResponse.ok) {
        const { news: serverNews } = await serverResponse.json()
        if (Array.isArray(serverNews) && serverNews.length > 0) {
          console.log('[StorageSync] Loaded from server:', serverNews.length, 'items')
          
          // Sync to local storages
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverNews))
          }
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(serverNews))
          }
          
          return serverNews
        }
      }
    } catch (error) {
      console.warn('[StorageSync] Server load failed:', error)
    }

    try {
      // Try localStorage
      if (typeof localStorage !== 'undefined') {
        const localData = localStorage.getItem(STORAGE_KEY)
        if (localData) {
          const parsed = JSON.parse(localData)
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('[StorageSync] Loaded from localStorage:', parsed.length, 'items')
            
            // Sync to session storage
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem(SESSION_KEY, JSON.stringify(parsed))
            }
            
            return parsed
          }
        }
      }
    } catch (error) {
      console.warn('[StorageSync] localStorage load failed:', error)
    }

    try {
      // Try sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        const sessionData = sessionStorage.getItem(SESSION_KEY)
        if (sessionData) {
          const parsed = JSON.parse(sessionData)
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('[StorageSync] Loaded from sessionStorage:', parsed.length, 'items')
            return parsed
          }
        }
      }
    } catch (error) {
      console.warn('[StorageSync] sessionStorage load failed:', error)
    }

    console.log('[StorageSync] Using fallback data:', fallbackData.length, 'items')
    return fallbackData
  }

  /**
   * Delete news from all storages
   */
  static async deleteNews(id: string) {
    try {
      // Remove from localStorage
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEY)
        if (data) {
          const news = JSON.parse(data).filter((item: any) => item.id?.toString() !== id.toString())
          localStorage.setItem(STORAGE_KEY, JSON.stringify(news))
        }
      }
    } catch (error) {
      console.warn('[StorageSync] localStorage delete failed:', error)
    }

    try {
      // Remove from sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        const data = sessionStorage.getItem(SESSION_KEY)
        if (data) {
          const news = JSON.parse(data).filter((item: any) => item.id?.toString() !== id.toString())
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(news))
        }
      }
    } catch (error) {
      console.warn('[StorageSync] sessionStorage delete failed:', error)
    }

    // Delete from server
    try {
      await fetch(`${SYNC_ENDPOINT}?id=${id}`, { method: 'DELETE' })
    } catch (error) {
      console.warn('[StorageSync] Server delete failed:', error)
    }
  }

  /**
   * Clear all storages
   */
  static clearAll() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.warn('[StorageSync] localStorage clear failed:', error)
    }

    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(SESSION_KEY)
      }
    } catch (error) {
      console.warn('[StorageSync] sessionStorage clear failed:', error)
    }
  }
}
