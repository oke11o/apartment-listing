/**
 * Composable for API response caching
 * Provides in-memory and localStorage caching for API responses
 *
 */

interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds (default: 5 minutes)
  useLocalStorage?: boolean // Whether to persist cache in localStorage
  key?: string // Custom cache key
}

export const useApiCache = () => {
  // In-memory cache
  const memoryCache = new Map<string, CacheEntry>()

  /**
   * Generate cache key from URL and parameters
   * @param url - API endpoint URL
   * @param params - Request parameters
   */
  const generateCacheKey = (
    url: string,
    params?: Record<string, unknown>,
  ): string => {
    const paramString = params ? JSON.stringify(params) : ''
    return `api_cache_${url}_${btoa(paramString)}`
  }

  /**
   * Check if cache entry is valid (not expired)
   * @param entry - Cache entry to check
   */
  const isCacheValid = (entry: CacheEntry): boolean => {
    return Date.now() - entry.timestamp < entry.ttl
  }

  /**
   * Get data from cache
   * @param key - Cache key
   * @param useLocalStorage - Whether to check localStorage
   */
  const getFromCache = <T = unknown>(
    key: string,
    useLocalStorage = false,
  ): T | null => {
    // Check memory cache first
    const memoryEntry = memoryCache.get(key)
    if (memoryEntry && isCacheValid(memoryEntry)) {
      return memoryEntry.data as T
    }

    // Check localStorage if enabled
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(key)
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored)
          if (isCacheValid(entry)) {
            // Also store in memory cache for faster access
            memoryCache.set(key, entry)
            return entry.data
          }
          else {
            // Remove expired entry
            localStorage.removeItem(key)
          }
        }
      }
      catch (error) {
        console.warn('Failed to read from localStorage cache:', error)
      }
    }

    return null
  }

  /**
   * Store data in cache
   * @param key - Cache key
   * @param data - Data to cache
   * @param options - Cache options
   */
  const setCache = <T = unknown>(
    key: string,
    data: T,
    options: CacheOptions = {},
  ): void => {
    const { ttl = 5 * 60 * 1000, useLocalStorage = false } = options // Default 5 minutes TTL

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    }

    // Store in memory cache
    memoryCache.set(key, entry)

    // Store in localStorage if enabled
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(entry))
      }
      catch (error) {
        console.warn('Failed to write to localStorage cache:', error)
      }
    }
  }

  /**
   * Clear cache entry
   * @param key - Cache key to clear
   * @param useLocalStorage - Whether to clear from localStorage
   */
  const clearCache = (key: string, useLocalStorage = false): void => {
    memoryCache.delete(key)

    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(key)
      }
      catch (error) {
        console.warn('Failed to clear localStorage cache:', error)
      }
    }
  }

  /**
   * Clear all cache entries
   * @param useLocalStorage - Whether to clear localStorage
   */
  const clearAllCache = (useLocalStorage = false): void => {
    memoryCache.clear()

    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.startsWith('api_cache_')) {
            localStorage.removeItem(key)
          }
        })
      }
      catch (error) {
        console.warn('Failed to clear localStorage cache:', error)
      }
    }
  }

  /**
   * Cached fetch function
   * @param url - API endpoint URL
   * @param options - Fetch options and cache options
   */
  const cachedFetch = async <T = unknown>(
    url: string,
    options: { cache?: CacheOptions } & Record<string, unknown> = {},
  ): Promise<T> => {
    const { cache: cacheOptions = {}, ...fetchOptions } = options
    const cacheKey = generateCacheKey(url, fetchOptions)

    // Try to get from cache first
    const cached = getFromCache<T>(cacheKey, cacheOptions.useLocalStorage)
    if (cached) {
      return cached
    }

    // Fetch from API
    try {
      const response = await $fetch<T>(url, fetchOptions)

      // Cache the response
      setCache(cacheKey, response, cacheOptions)

      return response as T
    }
    catch (error) {
      // If fetch fails, try to return stale cache data as fallback
      const staleCache = memoryCache.get(cacheKey)
      if (staleCache) {
        console.warn('API request failed, returning stale cache data:', error)
        return staleCache.data as T
      }

      throw error
    }
  }

  /**
   * Invalidate cache entries matching a pattern
   * @param pattern - RegExp pattern to match cache keys
   * @param useLocalStorage - Whether to clear from localStorage
   */
  const invalidateCache = (pattern: RegExp, useLocalStorage = false): void => {
    // Clear from memory cache
    for (const key of memoryCache.keys()) {
      if (pattern.test(key)) {
        memoryCache.delete(key)
      }
    }

    // Clear from localStorage
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (pattern.test(key)) {
            localStorage.removeItem(key)
          }
        })
      }
      catch (error) {
        console.warn('Failed to invalidate localStorage cache:', error)
      }
    }
  }

  return {
    generateCacheKey,
    getFromCache,
    setCache,
    clearCache,
    clearAllCache,
    cachedFetch,
    invalidateCache,
  }
}
