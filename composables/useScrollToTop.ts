import { ref, computed, watch, readonly, onMounted, onUnmounted } from 'vue'

/**
 * Composable for managing scroll-to-top functionality
 * Tracks scroll position and provides smooth scrolling to top
 *
 */
export const useScrollToTop = () => {
  const scrollPosition = ref(0)
  const isVisible = ref(false)
  const isScrolling = ref(false)

  // Threshold for showing the button (in pixels)
  const SCROLL_THRESHOLD = 300

  /**
   * Update scroll position and visibility
   */
  const updateScrollPosition = () => {
    if (import.meta.client) {
      scrollPosition.value
        = window.scrollY || document.documentElement.scrollTop

      // Show button when scrolled past threshold
      isVisible.value = scrollPosition.value > SCROLL_THRESHOLD
    }
  }

  /**
   * Smooth scroll to top of page
   */
  const scrollToTop = () => {
    if (import.meta.client && !isScrolling.value) {
      isScrolling.value = true

      // Use native smooth scroll (polyfill loaded by plugin)
      window.scrollTo({ top: 0, behavior: 'smooth' })

      // Reset scrolling state after animation completes
      // Estimate scroll duration based on distance
      const scrollDuration = Math.min(
        Math.max(scrollPosition.value / 3, 300),
        1000,
      )

      setTimeout(() => {
        isScrolling.value = false
      }, scrollDuration)
    }
  }

  /**
   * Simple throttle implementation for scroll handler
   */
  let throttleTimer: NodeJS.Timeout | null = null
  const throttledScrollHandler = () => {
    if (throttleTimer) return

    throttleTimer = setTimeout(() => {
      updateScrollPosition()
      throttleTimer = null
    }, 16) // ~60fps
  }

  /**
   * Initialize scroll tracking
   */
  const initializeScrollTracking = () => {
    if (import.meta.client) {
      // Set initial scroll position
      updateScrollPosition()

      // Add scroll event listener
      window.addEventListener('scroll', throttledScrollHandler, {
        passive: true,
      })

      // Also listen for resize events that might affect scroll
      window.addEventListener('resize', updateScrollPosition, {
        passive: true,
      })
    }
  }

  /**
   * Cleanup scroll tracking
   */
  const cleanupScrollTracking = () => {
    if (import.meta.client) {
      window.removeEventListener('scroll', throttledScrollHandler)
      window.removeEventListener('resize', updateScrollPosition)
    }
  }

  /**
   * Get scroll progress as percentage (0-100)
   */
  const scrollProgress = computed(() => {
    if (import.meta.client) {
      const documentHeight
        = document.documentElement.scrollHeight - window.innerHeight
      return documentHeight > 0
        ? Math.min((scrollPosition.value / documentHeight) * 100, 100)
        : 0
    }
    return 0
  })

  /**
   * Check if user is near bottom of page
   */
  const isNearBottom = computed(() => {
    return scrollProgress.value > 90
  })

  /**
   * Get scroll direction based on previous position
   */
  const scrollDirection = ref<'up' | 'down' | null>(null)
  let previousScrollPosition = 0

  watch(scrollPosition, (newPosition) => {
    if (newPosition > previousScrollPosition) {
      scrollDirection.value = 'down'
    }
    else if (newPosition < previousScrollPosition) {
      scrollDirection.value = 'up'
    }
    previousScrollPosition = newPosition
  })

  // Auto-initialize when composable is used
  onMounted(() => {
    initializeScrollTracking()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    cleanupScrollTracking()
  })

  return {
    // Reactive state
    scrollPosition: readonly(scrollPosition),
    isVisible: readonly(isVisible),
    isScrolling: readonly(isScrolling),
    scrollDirection: readonly(scrollDirection),

    // Computed properties
    scrollProgress,
    isNearBottom,

    // Methods
    scrollToTop,
    initializeScrollTracking,
    cleanupScrollTracking,
    updateScrollPosition,

    // Constants
    SCROLL_THRESHOLD,
  }
}
