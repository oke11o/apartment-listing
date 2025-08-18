/**
 * Client-side app initialization plugin
 * Handles font loading and anti-flicker functionality
 */
export default defineNuxtPlugin(() => {
  // Handle app visibility after hydration
  if (import.meta.client) {
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      document.documentElement.classList.add('vue-loaded')
      document.documentElement.style.visibility = 'visible'
      document.documentElement.style.opacity = '1'
      document.documentElement.style.transition = 'opacity 0.3s ease'

      // Initialize font loading after DOM is ready
      try {
        const { initFontLoading } = useFontLoading()
        initFontLoading()
      }
      catch (error) {
        console.warn('Font loading failed:', error)
      }
    }, 0)
  }
})
