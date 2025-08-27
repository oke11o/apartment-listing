<template>
  <div class="apartment-listing-page">
    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <div class="page-layout">
          <div class="main-section">
            <h1 class="page-title">
              Квартиры
            </h1>

            <!-- Main Content Area -->
            <section class="content-area">
              <!-- Loading State -->
              <div
                v-if="apartmentsLoading && apartments.length === 0"
                class="loading-state"
              >
                <LoadingSpinner text="Загружаем квартиры..." />
              </div>

              <!-- Error State -->
              <div
                v-else-if="hasError"
                class="error-state"
              >
                <div class="error-content">
                  <h3 class="error-title">
                    Произошла ошибка
                  </h3>
                  <p class="error-message">
                    {{ errorMessage }}
                  </p>
                  <button
                    class="error-retry-button"
                    @click="handleRetry"
                  >
                    Попробовать снова
                  </button>
                </div>
              </div>

              <!-- Empty State -->
              <div
                v-else-if="apartments.length === 0 && !apartmentsLoading"
                class="empty-state"
              >
                <div class="empty-content">
                  <h3 class="empty-title">
                    Квартиры не найдены
                  </h3>
                  <p class="empty-message">
                    Попробуйте изменить параметры фильтра или сбросить все
                    фильтры
                  </p>
                  <button
                    v-if="hasActiveFilters"
                    class="empty-reset-button"
                    @click="handleResetFilters"
                  >
                    Сбросить параметры
                  </button>
                </div>
              </div>

              <!-- Apartments List -->
              <div
                v-else
                class="apartments-list"
              >
                <!-- Table Header (Desktop only) -->
                <ApartmentTableHeader
                  :sort-field="sortField"
                  :sort-order="sortOrder"
                  class="apartments-list__header"
                  @sort="handleSort"
                />

                <!-- Apartments Grid/Table -->
                <div
                  class="apartments-list__content"
                  :class="{
                    loading: apartmentsLoading && apartments.length > 0,
                  }"
                >
                  <ApartmentCard
                    v-for="apartment in apartments"
                    :key="apartment.id"
                    :apartment="apartment"
                    :loading="apartmentsLoading"
                  />
                </div>
              </div>

              <!-- Load More Button -->
              <div
                v-if="apartments.length > 0"
                class="load-more-section"
              >
                <LoadMoreButton
                  :loading="apartmentsLoading"
                  :has-more="hasMore"
                  :disabled="hasError"
                  :load-count="20"
                  @load-more="handleLoadMore"
                />
              </div>
            </section>
          </div>

          <!-- Sidebar with Filters -->
          <aside class="sidebar">
            <FilterPanel
              :filters="filters"
              :metadata="metadata"
              :loading="filtersLoading"
              :available-rooms="availableRooms"
              @filter-change="handleFilterChange"
              @reset-filters="handleResetFilters"
            />
          </aside>
        </div>
      </div>
    </main>

    <!-- Scroll to Top Button -->
    <ScrollToTopButton
      :visible="showScrollToTop"
      @scroll-to-top="handleScrollToTop"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import type { FilterParams } from '~/types'
import LoadingSpinner from '~/components/LoadingSpinner.vue'
import { useApartments } from '~/composables/useApartments'
import { useFilters } from '~/composables/useFilters'
import { useScrollToTop } from '~/composables/useScrollToTop'
import { useAvailableRooms } from '~/composables/useAvailableRooms'
import { useUrlFilters } from '~/composables/useUrlFilters'
import { usePerformance } from '~/composables/usePerformance'

// Composables
const {
  apartments,
  loading: apartmentsLoading,
  error: apartmentsError,
  hasMore,
  metadata: apartmentMetadata,
  loadApartments,
  loadMore,
  clearError: clearApartmentsError,
} = useApartments()

const {
  filters,
  metadata,
  loading: filtersLoading,
  error: filtersError,
  hasActiveFilters,
  initializeFilters,
  resetFilters,
  updatePriceRange,
  updateAreaRange,
  updateRooms,
  updateFloorsRange,
  applyUrlFilters,
} = useFilters()

const { watchUrlFilters, clearUrlFilters, updateUrlWithFilters, parseFiltersFromUrl } = useUrlFilters()

const { isVisible: showScrollToTop, scrollToTop } = useScrollToTop()

// Available rooms calculation
const { availableRooms } = useAvailableRooms(apartments, filters, metadata)

// Performance monitoring
const { measureRenderTime } = usePerformance()

// Reactive state
const initialLoading = ref(true)
const sortField = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Performance monitoring
measureRenderTime('ApartmentListingPage')

// Computed properties
const hasError = computed(
  () => !!(apartmentsError.value || filtersError.value),
)
const errorMessage = computed(
  () => apartmentsError.value || filtersError.value || 'Неизвестная ошибка',
)

// Methods
const handleFilterChange = (newFilters: FilterParams) => {
  try {
    clearApartmentsError()
    updatePriceRange(newFilters.priceRange)
    updateAreaRange(newFilters.areaRange)
    updateRooms(newFilters.rooms)
    updateFloorsRange(newFilters.floors)
  }
  catch (error) {
    console.error('Error applying filters:', error)
  }
}

const handleResetFilters = () => {
  try {
    resetFilters()
    clearApartmentsError()
    clearUrlFilters()
  }
  catch (error) {
    console.error('Error resetting filters:', error)
  }
}

const handleLoadMore = async () => {
  try {
    clearApartmentsError()
    await loadMore()
  }
  catch (error) {
    console.error('Error loading more apartments:', error)
  }
}

const handleRetry = async () => {
  try {
    clearApartmentsError()
    await loadApartments(
      hasActiveFilters.value ? filters.value : undefined,
      true,
    )
  }
  catch (error) {
    console.error('Error retrying:', error)
  }
}

const handleScrollToTop = () => {
  scrollToTop()
}

const handleSort = (field: string, order: 'asc' | 'desc') => {
  sortField.value = field
  sortOrder.value = order

  // Sort apartments locally
  apartments.value.sort((a, b) => {
    const aRaw = a[field as keyof typeof a]
    const bRaw = b[field as keyof typeof b]

    // Normalize undefined values
    const aValue = aRaw ?? (typeof bRaw === 'number' ? 0 : '')
    const bValue = bRaw ?? (typeof aRaw === 'number' ? 0 : '')

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue
    }

    const aStr = String(aValue).toLowerCase()
    const bStr = String(bValue).toLowerCase()
    return order === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr)
  })
}

// Watch for metadata changes and initialize filters
watch(
  apartmentMetadata,
  (newMetadata) => {
    if (newMetadata && !metadata.value) {
      initializeFilters(newMetadata)

      // After metadata is initialized, check for URL filters and apply them
      nextTick(() => {
        if (import.meta.client) {
          const urlFilters = parseFiltersFromUrl()
          if (urlFilters && Object.keys(urlFilters).length > 0) {
            applyUrlFilters(urlFilters)
          }
        }
      })
    }
  },
  { immediate: true },
)

// Watch for URL filter changes (for navigation between pages with different filters)
watchUrlFilters((urlFilters) => {
  if (urlFilters && metadata.value && Object.keys(urlFilters).length > 0 && !initialLoading.value) {
    applyUrlFilters(urlFilters)
  }
})

// Watch for filter changes and update URL
watch(
  filters,
  (newFilters) => {
    if (metadata.value && import.meta.client) {
      const defaultFilters = {
        priceRange: [...metadata.value.priceRange] as [number, number],
        areaRange: [...metadata.value.areaRange] as [number, number],
        rooms: [],
        floors: [...metadata.value.floorsRange] as [number, number],
      }
      updateUrlWithFilters(newFilters, defaultFilters)
    }
  },
  { deep: true },
)

// Initialize data on mount
onMounted(async () => {
  try {
    await loadApartments(undefined, true)
  }
  catch (error) {
    console.error('Error initializing page:', error)
  }
  finally {
    initialLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
@use '~/assets/scss/components/apartments-list';
</style>
