/**
 * Performance optimization plugin
 * Handles client-side performance optimizations
 *
 */

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (typeof window === 'undefined') return

  // Performance observer for monitoring
  if ('PerformanceObserver' in window) {
    // Monitor Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]

      if (import.meta.dev) {
        console.log('LCP:', lastEntry.startTime)
      }
    })

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    }
    catch (error: unknown) {
      // LCP not supported in this browser
      if (import.meta.dev) {
        console.warn('LCP observer not supported:', error)
      }
    }

    // Monitor First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (import.meta.dev) {
          console.log('FID:', entry.processingStart - entry.startTime)
        }
      })
    })

    try {
      fidObserver.observe({ entryTypes: ['first-input'] })
    }
    catch (error: unknown) {
      // FID not supported in this browser
      if (import.meta.dev) {
        console.warn('FID observer not supported:', error)
      }
    }
  }

  // Optimize images with Intersection Observer
  const optimizeImages = () => {
    const images = document.querySelectorAll('img[loading="lazy"]')

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement

              // Just ensure image is loaded without fade effects
              if (!img.complete) {
                img.onerror = () => {
                  // Handle image load error
                  console.warn('Failed to load image:', img.src)
                }
              }

              imageObserver.unobserve(img)
            }
          })
        },
        {
          rootMargin: '50px',
        },
      )

      images.forEach(img => imageObserver.observe(img))
    }
  }

  // Optimize scroll performance
  const optimizeScroll = () => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Scroll optimizations can be added here
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  // Preload critical resources
  const preloadCriticalResources = () => {
    // Preload the apartments API endpoint
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = '/api/apartments?page=1&limit=20'
    document.head.appendChild(link)
  }

  // Initialize optimizations
  const initOptimizations = () => {
    optimizeImages()
    optimizeScroll()
    preloadCriticalResources()
  }

  // Run optimizations when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOptimizations)
  }
  else {
    initOptimizations()
  }

  // Re-run image optimization when new content is added
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any new images were added
        const hasNewImages = Array.from(mutation.addedNodes).some(
          (node): node is Element => {
            return (
              node.nodeType === Node.ELEMENT_NODE
              && (node as Element).querySelector('img[loading="lazy"]') !== null
            )
          },
        )

        if (hasNewImages) {
          // Small delay to ensure images are in DOM
          setTimeout(optimizeImages, 100)
        }
      }
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // Cleanup on app unmount
  return {
    provide: {
      performanceOptimized: true,
    },
  }
})
