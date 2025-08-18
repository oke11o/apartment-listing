import { computed, watch } from 'vue'
import type { FilterMetadata } from '~/types'
import { useFilterStore } from '~/stores/filterStore'

/**
 * Composable for managing filter state and operations
 * Provides reactive access to filter store with debounced filtering
 */
export const useFilters = () => {
  const filterStore = useFilterStore()

  // Debounce timer for filter changes
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // Store previous filters to prevent unnecessary API calls
  let previousFilters: string | null = null

  // Watch filters and apply them with debouncing
  watch(
    () => filterStore.filters,
    async () => {
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      // Set new timer for debounced execution
      debounceTimer = setTimeout(async () => {
        // Check if filters actually changed to prevent unnecessary API calls
        const currentFiltersString = JSON.stringify(filterStore.filters)
        // Skip the very first change (usually initialization) to avoid duplicate fetch
        if (previousFilters === null) {
          previousFilters = currentFiltersString
          debounceTimer = null
          return
        }

        if (currentFiltersString !== previousFilters) {
          previousFilters = currentFiltersString
          await filterStore.applyFilters()
        }
        debounceTimer = null
      }, 300) // 300ms debounce delay for better responsiveness
    },
    { deep: true },
  )

  /**
   * Initialize filters with metadata from API
   * @param metadata - Filter metadata containing ranges and available options
   */
  const initializeFilters = (metadata: FilterMetadata) => {
    filterStore.initializeFilters(metadata)
  }

  /**
   * Update price range filter
   * @param range - New price range [min, max]
   */
  const updatePriceRange = (range: [number, number]) => {
    filterStore.updatePriceRange(range)
  }

  /**
   * Update area range filter
   * @param range - New area range [min, max]
   */
  const updateAreaRange = (range: [number, number]) => {
    filterStore.updateAreaRange(range)
  }

  /**
   * Update rooms selection
   * @param rooms - Array of selected room counts
   */
  const updateRooms = (rooms: number[]) => {
    filterStore.updateRooms(rooms)
  }

  /**
   * Update floors range filter
   * @param range - New floors range [min, max]
   */
  const updateFloorsRange = (range: [number, number]) => {
    filterStore.updateFloorsRange(range)
  }

  /**
   * Toggle room selection (add/remove from selection)
   * @param roomCount - Room count to toggle
   */
  const toggleRoom = (roomCount: number) => {
    filterStore.toggleRoom(roomCount)
  }

  /**
   * Reset all filters to default values
   */
  const resetFilters = () => {
    filterStore.resetFilters()
  }

  /**
   * Manually apply current filters (bypass debouncing)
   */
  const applyFilters = async () => {
    await filterStore.applyFilters()
  }

  /**
   * Clear any filter errors
   */
  const clearError = () => {
    filterStore.clearError()
  }

  /**
   * Validate all current filters
   */
  const validateFilters = () => {
    return filterStore.validateAllFilters()
  }

  /**
   * Check if a specific room count is selected
   * @param roomCount - Room count to check
   */
  const isRoomSelected = (roomCount: number) => {
    return computed(() => filterStore.filters.rooms.includes(roomCount))
  }

  /**
   * Get filter summary for display
   */
  const getFilterSummary = () => {
    return computed(() => {
      const filters = filterStore.filters
      const metadata = filterStore.metadata

      if (!metadata) return null

      const summary: string[] = []

      // Price filter
      if (
        filters.priceRange[0] !== metadata.priceRange[0]
        || filters.priceRange[1] !== metadata.priceRange[1]
      ) {
        summary.push(
          `Цена: ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()} руб.`,
        )
      }

      // Area filter
      if (
        filters.areaRange[0] !== metadata.areaRange[0]
        || filters.areaRange[1] !== metadata.areaRange[1]
      ) {
        summary.push(
          `Площадь: ${filters.areaRange[0]} - ${filters.areaRange[1]} м²`,
        )
      }

      // Rooms filter
      if (filters.rooms.length > 0) {
        const roomsText
          = filters.rooms.length === 1
            ? `${filters.rooms[0]} комн.`
            : `${filters.rooms.join(', ')} комн.`
        summary.push(`Комнаты: ${roomsText}`)
      }

      // Floors filter
      if (
        filters.floors[0] !== metadata.floorsRange[0]
        || filters.floors[1] !== metadata.floorsRange[1]
      ) {
        summary.push(`Этаж: ${filters.floors[0]} - ${filters.floors[1]}`)
      }

      return summary
    })
  }

  // Return reactive state and methods
  return {
    // Reactive state from store
    filters: computed(() => filterStore.filters),
    metadata: computed(() => filterStore.metadata),
    loading: computed(() => filterStore.loading),
    error: computed(() => filterStore.error),
    isActive: computed(() => filterStore.isActive),

    // Computed getters
    hasActiveFilters: computed(() => filterStore.hasActiveFilters),
    validationRules: computed(() => filterStore.validationRules),
    isLoading: computed(() => filterStore.isLoading),
    hasError: computed(() => filterStore.hasError),
    activeFiltersCount: computed(() => filterStore.activeFiltersCount),

    // Methods
    initializeFilters,
    updatePriceRange,
    updateAreaRange,
    updateRooms,
    updateFloorsRange,
    toggleRoom,
    resetFilters,
    applyFilters,
    clearError,
    validateFilters,
    isRoomSelected,
    getFilterSummary,
  }
}
