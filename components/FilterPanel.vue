<template>
  <div
    v-cloak
    class="filter-panel"
    :class="{ 'filter-panel--disabled': loading || disabled }"
  >
    <div class="filter-panel__content">
      <!-- Rooms Filter -->
      <div class="filter-group">
        <div class="filter-group__buttons">
          <button
            v-for="room in metadata?.roomsAvailable || [1, 2, 3, 4]"
            :key="room"
            type="button"
            class="room-button"
            :class="{
              'room-button--active': localFilters.rooms.includes(room),
              'room-button--disabled': !isRoomAvailable(room),
            }"
            :disabled="loading || disabled || !isRoomAvailable(room)"
            @click="toggleRoom(room)"
          >
            {{ `${room}к` }}
          </button>
        </div>
      </div>

      <!-- Price Range Filter -->
      <div class="filter-group">
        <label class="filter-group__label"> Стоимость квартиры, ₽</label>

        <div class="filter-group__range">
          <div class="range-inputs">
            <div class="range-value">
              <span class="range-value__label">от</span>
              <span class="range-value__number">{{ localFilters.priceRange[0] }}</span>
            </div>
            <div class="range-value">
              <span class="range-value__label">до</span>
              <span class="range-value__number">{{ localFilters.priceRange[1] }}</span>
            </div>
          </div>

          <div class="range-slider">
            <div
              class="range-slider__highlight"
              :style="{
                left: `${
                  ((localFilters.priceRange[0] - (metadata?.priceRange[0] || 0))
                    / ((metadata?.priceRange[1] || 1) - (metadata?.priceRange[0] || 0)))
                  * 100
                }%`,
                width: `${
                  ((localFilters.priceRange[1] - localFilters.priceRange[0])
                    / ((metadata?.priceRange[1] || 1) - (metadata?.priceRange[0] || 0)))
                  * 100
                }%`,
              }"
            />
            <input
              v-model.number="localFilters.priceRange[0]"
              type="range"
              class="range-slider__input range-slider__input--min"
              :min="metadata?.priceRange[0] || 0"
              :max="metadata?.priceRange[1] || 999999999"
              :disabled="loading || disabled"
              @input="validateAndEmit"
            >
            <input
              v-model.number="localFilters.priceRange[1]"
              type="range"
              class="range-slider__input range-slider__input--max"
              :min="metadata?.priceRange[0] || 0"
              :max="metadata?.priceRange[1] || 999999999"
              :disabled="loading || disabled"
              @input="validateAndEmit"
            >
          </div>
        </div>
      </div>

      <!-- Area Range Filter -->
      <div class="filter-group">
        <label class="filter-group__label"> Площадь, м² </label>

        <div class="filter-group__range">
          <div class="range-inputs">
            <div class="range-value">
              <span class="range-value__label">от</span>
              <span class="range-value__number">{{ localFilters.areaRange[0] }}</span>
            </div>
            <div class="range-value">
              <span class="range-value__label">до</span>
              <span class="range-value__number">{{ localFilters.areaRange[1] }}</span>
            </div>
          </div>

          <div class="range-slider">
            <div
              class="range-slider__highlight"
              :style="{
                left: `${
                  ((localFilters.areaRange[0] - (metadata?.areaRange[0] || 0))
                    / ((metadata?.areaRange[1] || 1) - (metadata?.areaRange[0] || 0)))
                  * 100
                }%`,
                width: `${
                  ((localFilters.areaRange[1] - localFilters.areaRange[0])
                    / ((metadata?.areaRange[1] || 1) - (metadata?.areaRange[0] || 0)))
                  * 100
                }%`,
              }"
            />
            <input
              v-model.number="localFilters.areaRange[0]"
              type="range"
              class="range-slider__input range-slider__input--min"
              :min="metadata?.areaRange[0] || 0"
              :max="metadata?.areaRange[1] || 999"
              :disabled="loading || disabled"
              @input="validateAndEmit"
            >
            <input
              v-model.number="localFilters.areaRange[1]"
              type="range"
              class="range-slider__input range-slider__input--max"
              :min="metadata?.areaRange[0] || 0"
              :max="metadata?.areaRange[1] || 999"
              :disabled="loading || disabled"
              @input="validateAndEmit"
            >
          </div>
        </div>
      </div>

      <button
        v-if="hasActiveFilters"
        class="filter-panel__reset"
        type="button"
        :disabled="loading || disabled"
        @click="resetFilters"
      >
        Сбросить параметры
        <img
          src="/icons/close.svg"
          alt="Закрыть"
          class="filter-panel__reset-icon"
          width="16"
          height="16"
        >
      </button>
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="filter-panel__loading"
    >
      <LoadingSpinner size="small" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FilterParams, FilterMetadata } from '~/types'
import LoadingSpinner from './LoadingSpinner.vue'

interface Props {
  filters: FilterParams
  metadata: FilterMetadata | null
  loading: boolean
  disabled?: boolean
  availableRooms?: number[] // Rooms available in current filtered results
}

interface Emits {
  (_e: 'filter-change', _filters: FilterParams): void
  (_e: 'reset-filters'): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  availableRooms: () => [],
})

const emit = defineEmits<Emits>()

// Local reactive copy of filters for immediate UI updates
const localFilters = ref<FilterParams>({ ...props.filters })

// Watch for external filter changes
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...newFilters }
  },
  { deep: true },
)

// Computed properties
const hasActiveFilters = computed(() => {
  if (!props.metadata) return false

  return (
    localFilters.value.priceRange[0] !== props.metadata.priceRange[0]
    || localFilters.value.priceRange[1] !== props.metadata.priceRange[1]
    || localFilters.value.areaRange[0] !== props.metadata.areaRange[0]
    || localFilters.value.areaRange[1] !== props.metadata.areaRange[1]
    || localFilters.value.rooms.length > 0
  )
})

const isRoomAvailable = (room: number) => {
  // If no available rooms data provided, assume all rooms are available
  if (!props.availableRooms || props.availableRooms.length === 0) {
    return true
  }

  // If this room is already selected, keep it available (allow deselection)
  if (localFilters.value.rooms.includes(room)) {
    return true
  }

  // Check if this room type exists in current filtered results
  return props.availableRooms.includes(room)
}

const validateAndEmit = () => {
  // Validate ranges
  if (localFilters.value.priceRange[0] > localFilters.value.priceRange[1]) {
    localFilters.value.priceRange[1] = localFilters.value.priceRange[0]
  }

  if (localFilters.value.areaRange[0] > localFilters.value.areaRange[1]) {
    localFilters.value.areaRange[1] = localFilters.value.areaRange[0]
  }

  if (localFilters.value.floors[0] > localFilters.value.floors[1]) {
    localFilters.value.floors[1] = localFilters.value.floors[0]
  }

  // Emit the validated filters
  emit('filter-change', { ...localFilters.value })
}

const toggleRoom = (room: number) => {
  const index = localFilters.value.rooms.indexOf(room)
  if (index > -1) {
    localFilters.value.rooms.splice(index, 1)
  }
  else {
    localFilters.value.rooms.push(room)
  }
  validateAndEmit()
}

const resetFilters = () => {
  emit('reset-filters')
}
</script>

<style lang="scss" scoped>
// Component-specific styles are now in assets/scss/components/_filter-panel.scss
// Only component-specific overrides or unique styles go here if needed
</style>
