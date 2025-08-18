import { defineStore } from 'pinia'
import type {
  Apartment,
  FilterParams,
  ApartmentState,
  ApartmentListResponse,
  FilterMetadata,
} from '~/types'

export const useApartmentStore = defineStore('apartment', {
  state: (): ApartmentState & { metadata: FilterMetadata | null } => ({
    apartments: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
    hasMore: true,
    metadata: null,
  }),

  getters: {
    /**
     * Get apartments for current page
     */
    currentApartments: state => state.apartments,

    /**
     * Check if there are more apartments to load
     */
    canLoadMore: state => state.hasMore && !state.loading,

    /**
     * Get total pages count
     */
    totalPages: state =>
      Math.ceil(state.pagination.total / state.pagination.limit),

    /**
     * Check if we're on the first page
     */
    isFirstPage: state => state.pagination.page === 1,

    /**
     * Get loading state
     */
    isLoading: state => state.loading,

    /**
     * Get error state
     */
    hasError: state => !!state.error,

    /**
     * Get filter metadata
     */
    filterMetadata: state => state.metadata,
  },

  actions: {
    /**
     * Load apartments with optional filters
     * @param filters - Filter parameters to apply
     * @param reset - Whether to reset the current list (default: true)
     */
    async loadApartments(filters?: FilterParams, reset: boolean = true) {
      try {
        this.loading = true
        this.error = null

        // Reset pagination if this is a new search, but don't clear apartments yet
        if (reset) {
          this.pagination.page = 1
        }

        const params = new URLSearchParams({
          page: this.pagination.page.toString(),
          limit: this.pagination.limit.toString(),
        })

        // Add filter parameters if provided
        if (filters) {
          if (filters.priceRange) {
            params.append('priceMin', filters.priceRange[0].toString())
            params.append('priceMax', filters.priceRange[1].toString())
          }
          if (filters.areaRange) {
            params.append('areaMin', filters.areaRange[0].toString())
            params.append('areaMax', filters.areaRange[1].toString())
          }
          if (filters.rooms && filters.rooms.length > 0) {
            params.append('rooms', filters.rooms.join(','))
          }
          if (filters.floors) {
            params.append('floorMin', filters.floors[0].toString())
            params.append('floorMax', filters.floors[1].toString())
          }
        }

        // Use cached fetch with performance monitoring
        const { cachedFetch } = useApiCache()
        const { measureApiCall } = usePerformance()

        const response = await measureApiCall(
          () =>
            cachedFetch<ApartmentListResponse>(
              `/api/apartments?${params.toString()}`,
              {
                cache: {
                  ttl: 2 * 60 * 1000, // 2 minutes cache for apartment data
                  useLocalStorage: true, // Persist cache across sessions
                },
              },
            ),
          'load-apartments',
        )

        // Only clear apartments after successful response to prevent flickering
        if (reset) {
          this.apartments = response.apartments
        }
        else {
          // Append new apartments for pagination
          this.apartments.push(...response.apartments)
        }

        // Update pagination info
        this.pagination.total = response.meta.total
        this.hasMore = this.apartments.length < response.meta.total

        // Update metadata if available
        if (response.meta.filters) {
          this.metadata = response.meta.filters
        }
      }
      catch (error) {
        console.error('Error loading apartments:', error)
        this.error
          = error instanceof Error ? error.message : 'Failed to load apartments'

        // Don't clear apartments on error, keep existing data
        if (reset) {
          this.apartments = []
        }
      }
      finally {
        this.loading = false
      }
    },

    /**
     * Load more apartments (pagination)
     */
    async loadMore() {
      if (!this.canLoadMore) {
        return
      }

      try {
        this.pagination.page += 1
        await this.loadApartments(undefined, false)
      }
      catch (error) {
        // Revert page increment on error
        this.pagination.page -= 1
        throw error
      }
    },

    /**
     * Filter apartments with debouncing handled by filterStore
     * @param filters - Filter parameters to apply (undefined for no filters)
     */
    async filterApartments(filters?: FilterParams) {
      await this.loadApartments(filters, true)
    },

    /**
     * Reset apartments list and pagination
     */
    resetApartments() {
      this.apartments = []
      this.pagination.page = 1
      this.pagination.total = 0
      this.hasMore = true
      this.error = null
    },

    /**
     * Clear error state
     */
    clearError() {
      this.error = null
    },

    /**
     * Set loading state manually (useful for external loading indicators)
     */
    setLoading(loading: boolean) {
      this.loading = loading
    },

    /**
     * Get apartment by ID
     * @param id - Apartment ID
     */
    getApartmentById(id: string): Apartment | undefined {
      return this.apartments.find(apt => apt.id === id)
    },

    /**
     * Update pagination limit
     * @param limit - New limit per page
     */
    updatePaginationLimit(limit: number) {
      this.pagination.limit = limit
      this.resetApartments()
    },
  },
})
