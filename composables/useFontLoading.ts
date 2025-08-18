import { ref, readonly } from 'vue'

/**
 * Composable for handling font loading states and optimization
 * Simplified for font-display: optional strategy
 */
export const useFontLoading = () => {
  const fontLoaded = ref(false)

  const checkFontLoading = () => {
    if (import.meta.client && 'fonts' in document) {
      // Use Font Loading API to check if PT Root UI is available
      try {
        const available = document.fonts.check('16px "PT Root UI"')
        fontLoaded.value = available
        if (available) {
          document.documentElement.classList.add('font-loaded')
        }
      }
      catch {
        // Font Loading API not supported or failed
        fontLoaded.value = false
      }
    }
  }

  const initFontLoading = () => {
    if (import.meta.client) {
      // Check immediately
      checkFontLoading()

      // Check when fonts are ready
      if ('fonts' in document) {
        document.fonts.ready.then(() => {
          checkFontLoading()
        })
      }
    }
  }

  // Note: initFontLoading should be called manually when needed

  return {
    fontLoaded: readonly(fontLoaded),
    checkFontLoading,
    initFontLoading,
  }
}
