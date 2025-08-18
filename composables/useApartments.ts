import { computed } from 'vue'
import type { FilterParams } from '~/types'
import { useApartmentStore } from '~/stores/apartmentStore'

/**
 * Composable for managing apartments data and operations
 * Provides reactive access to apartment store with convenient methods
 *

 */
export const useApartments = () => {
  const apartmentStore = useApartmentStore()

  /**
   * Load apartments with optional filters
   * @param filters - Optional filter parameters
   * @param reset - Whether to reset current list (default: true)
   */
  const loadApartments = async (
    filters?: FilterParams,
    reset: boolean = true,
  ) => {
    await apartmentStore.loadApartments(filters, reset)
  }

  /**
   * Load more apartments for pagination
   * Increments page and appends new results
   */
  const loadMore = async () => {
    await apartmentStore.loadMore()
  }

  /**
   * Filter apartments with new criteria
   * Resets pagination and loads filtered results
   * @param filters - Filter parameters to apply
   */
  const filterApartments = async (filters: FilterParams) => {
    await apartmentStore.filterApartments(filters)
  }

  /**
   * Reset apartments list and pagination
   */
  const resetApartments = () => {
    apartmentStore.resetApartments()
  }

  /**
   * Clear any error state
   */
  const clearError = () => {
    apartmentStore.clearError()
  }

  /**
   * Get apartment by ID
   * @param id - Apartment ID to find
   */
  const getApartmentById = (id: string) => {
    return apartmentStore.getApartmentById(id)
  }

  /**
   * Update pagination limit
   * @param limit - New items per page limit
   */
  const updatePaginationLimit = (limit: number) => {
    apartmentStore.updatePaginationLimit(limit)
  }

  // Return reactive state and methods
  return {
    // Reactive state from store
    apartments: computed(() => apartmentStore.apartments),
    loading: computed(() => apartmentStore.loading),
    error: computed(() => apartmentStore.error),
    pagination: computed(() => apartmentStore.pagination),
    hasMore: computed(() => apartmentStore.hasMore),
    metadata: computed(() => apartmentStore.filterMetadata),

    // Computed getters
    canLoadMore: computed(() => apartmentStore.canLoadMore),
    totalPages: computed(() => apartmentStore.totalPages),
    isFirstPage: computed(() => apartmentStore.isFirstPage),
    isLoading: computed(() => apartmentStore.isLoading),
    hasError: computed(() => apartmentStore.hasError),

    // Methods
    loadApartments,
    loadMore,
    filterApartments,
    resetApartments,
    clearError,
    getApartmentById,
    updatePaginationLimit,
  }
}
