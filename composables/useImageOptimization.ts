/**
 * Composable for image optimization and lazy loading
 * Provides utilities for optimizing image loading performance
 *
 */
export const useImageOptimization = () => {
  /**
   * Generate optimized image URL with size parameters
   * @param src - Original image source
   * @param width - Target width
   * @param height - Target height
   * @param quality - Image quality (1-100)
   */
  const getOptimizedImageUrl = (
    src: string,
    width: number,
    height: number,
    _quality: number = 80,
  ): string => {
    // For now, return original src since we don't have image processing server
    // In production, this would generate URLs like:
    // `/api/images?src=${encodeURIComponent(src)}&w=${width}&h=${height}&q=${quality}`
    return src
  }

  /**
   * Preload critical images
   * @param urls - Array of image URLs to preload
   */
  const preloadImages = (urls: string[]): Promise<void[]> => {
    const promises = urls.map((url) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
        img.src = url
      })
    })

    return Promise.all(promises)
  }

  /**
   * Create intersection observer for lazy loading
   * @param callback - Callback function when element intersects
   * @param options - Intersection observer options
   */
  const createLazyLoadObserver = (
    callback: (_entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {},
  ): IntersectionObserver | null => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return null
    }

    const defaultOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    }

    return new IntersectionObserver(callback, defaultOptions)
  }

  /**
   * Get responsive image sizes based on screen width
   */
  const getResponsiveImageSizes = () => {
    if (typeof window === 'undefined') {
      return { width: 120, height: 90 }
    }

    const screenWidth = window.innerWidth

    if (screenWidth < 960) {
      // Mobile
      return { width: 120, height: 90 }
    }
    else {
      // Desktop table view
      return { width: 80, height: 60 }
    }
  }

  /**
   * Generate srcset for responsive images
   * @param baseSrc - Base image source
   * @param sizes - Array of sizes to generate
   */
  const generateSrcSet = (baseSrc: string, sizes: number[]): string => {
    return sizes
      .map(
        size => `${getOptimizedImageUrl(baseSrc, size, size * 0.75)} ${size}w`,
      )
      .join(', ')
  }

  return {
    getOptimizedImageUrl,
    preloadImages,
    createLazyLoadObserver,
    getResponsiveImageSizes,
    generateSrcSet,
  }
}
