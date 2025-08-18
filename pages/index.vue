<template>
  <div
  v-cloak
  class="apartment-listing-page"
  >
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
import { ref, computed, watch, onMounted } from 'vue'
import type { FilterParams } from '~/types'
import LoadingSpinner from '~/components/LoadingSpinner.vue'
import { useApartments } from '~/composables/useApartments'
import { useFilters } from '~/composables/useFilters'
import { useScrollToTop } from '~/composables/useScrollToTop'
import { useAvailableRooms } from '~/composables/useAvailableRooms'

// Meta tags for SEO
useHead({
  title: 'Список квартир - Поиск и аренда квартир',
  meta: [
    {
      name: 'description',
      content:
        'Найдите идеальную квартиру с помощью удобных фильтров. Большой выбор квартир с фотографиями и подробными характеристиками.',
    },
    {
      name: 'keywords',
      content: 'квартиры, аренда, поиск квартир, фильтры, недвижимость',
    },
  ],
})

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
} = useFilters()

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
    // Debounced request is triggered by useFilters watcher
  }
  catch (error) {
    console.error('Error applying filters:', error)
  }
}

const handleResetFilters = () => {
  try {
    resetFilters()
    clearApartmentsError()
    // Debounced request will run via useFilters watcher
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
    }
  },
  { immediate: true },
)

// Initialize data on mount
onMounted(async () => {
  try {
    // Load initial data to get metadata
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

<style scoped>
.apartment-listing-page {
  min-height: 100vh;
  background: #ffffff;
}

.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-content {
  padding: 32px 0;
}

.page-title {
  font-family: "PT Root UI", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
  font-weight: 700;
  font-size: 48px !important;
  line-height: 50px !important;
  letter-spacing: 0px;
  color: #1a1a1a;
  margin: 0 0 24px 0;
  text-align: left;
}

.page-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
  align-items: start;
}

.main-section {
  display: flex;
  flex-direction: column;
}

.sidebar {
  background: #ffffff;
  border-radius: 12px;
  padding: 0;
}

.content-area {
  min-height: 600px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 48px 24px;
}

.error-content,
.empty-content {
  text-align: center;
  max-width: 400px;
}

.error-title,
.empty-title {
  font-family: "PT Root UI";
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.error-message,
.empty-message {
  font-family: "PT Root UI";
  font-size: 16px;
  color: #666666;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.error-retry-button,
.empty-reset-button {
  background: #3eb57c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: "PT Root UI";
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.error-retry-button:hover,
.empty-reset-button:hover {
  background: #3eb57c;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.apartments-list {
  background: #ffffff;
  overflow: hidden;
}

.apartments-list__header {
  margin-bottom: 0;
}

.apartments-list__content {
  transition: opacity 0.2s ease-in-out;
}

.apartments-list__content.loading {
  opacity: 0.6;
}

/* Mobile Grid Layout */
.apartments-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

/* Apartments list content with mobile gap */
.apartments-list__content {
  display: flex;
  flex-direction: column;
  gap: 4px; /* 4px gap between cards on mobile */
}

.load-more-section {
  display: flex;
  justify-content: flex-start;
  margin-top: 32px;
}

/* Mobile styles (< 960px) */
@media (max-width: 959px) {
  .container {
    padding: 0 16px;
  }

  .main-content {
    padding: 20px 0;
  }

  .page-title {
    margin-bottom: 16px;
    font-size: 48px !important;
    line-height: 50px !important;
  }

  .page-layout {
    grid-template-columns: 1fr 280px;
    gap: 16px;
    align-items: start;
  }

  .sidebar {
    position: sticky;
    top: 16px;
    order: unset;
  }

  .content-area {
    order: unset;
  }

  .apartments-list {
    background: none;
    box-shadow: none;
    border-radius: 0;
  }

  .apartments-list__content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .load-more-section {
    margin-top: 20px;
  }

  .loading-state,
  .error-state,
  .empty-state {
    min-height: 300px;
    padding: 32px 16px;
  }

  .error-title,
  .empty-title {
    font-size: 18px;
  }

  .error-message,
  .empty-message {
    font-size: 14px;
  }

  .error-retry-button,
  .empty-reset-button {
    padding: 10px 20px;
    font-size: 14px;
  }
}

/* Tablet/Small Desktop styles (960px - 1023px) */
@media (min-width: 960px) and (max-width: 1023px) {
  .container {
    padding: 0 16px;
  }

  .page-layout {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 20px;
  }

  .sidebar {
    position: sticky;
    top: 20px;
    order: unset;
  }

  .content-area {
    order: unset;
  }

  .apartments-list__content {
    display: block;
  }

  .page-title {
    margin-bottom: 18px;
    font-size: 48px !important;
    line-height: 50px !important;
  }
}

/* Desktop styles (≥ 1024px) */
@media (min-width: 1024px) {
  .container {
    padding: 0 24px;
  }

  .page-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 32px;
  }

  .sidebar {
    position: sticky;
    top: 32px;
    order: unset;
  }

  .content-area {
    order: unset;
  }

  .apartments-list__content {
    display: block;
  }

  .page-title {
    margin-bottom: 20px;
    font-size: 48px !important;
    line-height: 50px !important;
  }
}

/* Large desktop styles (≥ 1440px) */
@media (min-width: 1440px) {
  .container {
    max-width: 1440px;
    padding: 0 40px;
  }

  .page-layout {
    gap: 40px;
  }

  .apartments-grid {
    gap: 32px;
  }

  .page-title {
    margin-bottom: 24px;
    font-size: 48px !important;
    line-height: 50px !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .apartment-listing-page {
    background: #ffffff;
  }
}
</style>
