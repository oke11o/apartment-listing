/**
 * Composable for performance monitoring
 * Provides utilities for measuring performance metrics
 */

interface PerformanceMetrics {
  renderTime: number
  apiResponseTime: number
}

export const usePerformance = () => {
  const metrics = ref<Partial<PerformanceMetrics>>({})

  /**
   * Measure API response time
   * @param apiCall - Function that makes the API call
   * @param label - Label for the measurement
   */
  const measureApiCall = async <T>(
    apiCall: () => Promise<T>,
    label: string = 'api-call',
  ): Promise<T> => {
    const startTime = performance.now()

    try {
      const result = await apiCall()
      const endTime = performance.now()
      const duration = endTime - startTime

      metrics.value.apiResponseTime = duration

      // Log performance in development
      if (import.meta.dev) {
        console.log(`API Call [${label}]: ${duration.toFixed(2)}ms`)
      }

      return result
    }
    catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime

      if (import.meta.dev) {
        console.log(
          `API Call [${label}] failed after: ${duration.toFixed(2)}ms`,
        )
      }

      throw error
    }
  }

  /**
   * Measure component render time
   * @param componentName - Name of the component
   */
  const measureRenderTime = (componentName: string) => {
    const startTime = performance.now()

    onMounted(() => {
      nextTick(() => {
        const endTime = performance.now()
        const duration = endTime - startTime

        metrics.value.renderTime = duration

        if (import.meta.dev) {
          console.log(
            `Component [${componentName}] render time: ${duration.toFixed(2)}ms`,
          )
        }
      })
    })
  }

  /**
   * Simple preload function for critical resources
   * @param resources - Array of resource URLs to preload
   * @param type - Resource type (script, style, image, etc.)
   */
  const preloadResources = (resources: string[], type: string = 'image') => {
    if (typeof document === 'undefined') return

    resources.forEach((resource) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource
      link.as = type
      document.head.appendChild(link)
    })
  }

  return {
    metrics: readonly(metrics),
    measureApiCall,
    measureRenderTime,
    preloadResources,
  }
}
