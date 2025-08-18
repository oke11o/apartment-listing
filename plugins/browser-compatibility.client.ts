import { addBrowserClasses, logBrowserInfo } from '~/utils/browser-detection'

// Browser compatibility plugin for client-side polyfills and fixes
export default defineNuxtPlugin(() => {
  // Only run on client side
  if (typeof window === 'undefined') return

  // Initialize browser detection and add classes
  addBrowserClasses()

  // Log browser info in development
  if (import.meta.dev) {
    logBrowserInfo()
  }

  // CSS Custom Properties polyfill for IE11 (if needed)
  // Note: IE11 support is optional based on requirements

  // Smooth scroll polyfill for older browsers
  if (!('scrollBehavior' in document.documentElement.style)) {
    // Import smooth scroll polyfill dynamically
    import('smoothscroll-polyfill')
      .then((smoothscroll) => {
        smoothscroll.polyfill()
      })
      .catch(() => {
        // Fallback smooth scroll implementation
        const originalScrollTo = window.scrollTo
        window.scrollTo = function (
          options: ScrollToOptions | number,
          y?: number,
        ) {
          if (typeof options === 'object' && options.behavior === 'smooth') {
            const startY = window.pageYOffset
            const targetY = options.top || 0
            const distance = targetY - startY
            const duration = 500
            let start: number

            function step(timestamp: number) {
              if (!start) start = timestamp
              const progress = Math.min((timestamp - start) / duration, 1)
              const ease = 0.5 - Math.cos(progress * Math.PI) / 2
              window.scrollTo(0, startY + distance * ease)

              if (progress < 1) {
                requestAnimationFrame(step)
              }
            }

            requestAnimationFrame(step)
          }
          else {
            originalScrollTo.call(window, options as number, y)
          }
        }
      })
  }

  // IntersectionObserver polyfill for older browsers
  if (!('IntersectionObserver' in window)) {
    import('intersection-observer').catch(() => {
      console.warn('IntersectionObserver polyfill failed to load')
    })
  }

  // ResizeObserver polyfill for older browsers
  if (!('ResizeObserver' in window)) {
    import('resize-observer-polyfill')
      .then((ResizeObserver) => {
        window.ResizeObserver = ResizeObserver.default
      })
      .catch(() => {
        console.warn('ResizeObserver polyfill failed to load')
      })
  }

  // Fix for Safari's 100vh issue on mobile
  const setVhProperty = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }

  setVhProperty()
  window.addEventListener('resize', setVhProperty)
  window.addEventListener('orientationchange', setVhProperty)

  // Fix for iOS Safari bounce scroll
  const preventBounce = (e: TouchEvent) => {
    const target = e.target as Element
    if (target && target.closest('.scrollable')) return

    const scrollTop
      = document.documentElement.scrollTop || document.body.scrollTop
    const scrollHeight
      = document.documentElement.scrollHeight || document.body.scrollHeight
    const clientHeight
      = document.documentElement.clientHeight || window.innerHeight

    if (scrollTop === 0 && e.touches[0].clientY > e.touches[0].clientY) {
      e.preventDefault()
    }

    if (
      scrollTop + clientHeight >= scrollHeight
      && e.touches[0].clientY < e.touches[0].clientY
    ) {
      e.preventDefault()
    }
  }

  // Apply iOS fix only on iOS devices
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  if (isIOS) {
    document.addEventListener('touchmove', preventBounce, { passive: false })
  }

  // Fix for Firefox range input styling
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')
  if (isFirefox) {
    document.documentElement.classList.add('firefox')
  }

  // Fix for Safari range input styling
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  if (isSafari) {
    document.documentElement.classList.add('safari')
  }

  // Fix for Edge range input styling
  const isEdge = /Edge/.test(navigator.userAgent)
  if (isEdge) {
    document.documentElement.classList.add('edge')
  }

  // Chrome-specific fixes
  const isChrome
    = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  if (isChrome) {
    document.documentElement.classList.add('chrome')
  }

  // Add browser classes for CSS targeting
  document.documentElement.classList.add(
    isFirefox
      ? 'firefox'
      : isSafari
        ? 'safari'
        : isEdge
          ? 'edge'
          : isChrome
            ? 'chrome'
            : 'unknown',
  )
})
