import { computed } from 'vue'
import type { Apartment, FilterParams, FilterMetadata } from '~/types'

/**
 * Composable for calculating available room types based on current filters
 * This helps disable room filter buttons when no apartments match
 *
 * Only disables room buttons if price or area filters are active,
 * allowing users to select multiple room types freely otherwise.
 */
export const useAvailableRooms = (
  apartments: Ref<Apartment[]>,
  currentFilters: Ref<FilterParams>,
  metadata: Ref<FilterMetadata | null>,
) => {
  /**
   * Check if price or area filters are active (not at default values)
   */
  const hasActiveNonRoomFilters = computed(() => {
    if (!metadata.value) return false

    const priceFiltered
      = currentFilters.value.priceRange[0] !== metadata.value.priceRange[0]
        || currentFilters.value.priceRange[1] !== metadata.value.priceRange[1]

    const areaFiltered
      = currentFilters.value.areaRange[0] !== metadata.value.areaRange[0]
        || currentFilters.value.areaRange[1] !== metadata.value.areaRange[1]

    const floorFiltered
      = currentFilters.value.floors[0] !== metadata.value.floorsRange[0]
        || currentFilters.value.floors[1] !== metadata.value.floorsRange[1]

    return priceFiltered || areaFiltered || floorFiltered
  })

  /**
   * Calculate which room types are available in the current apartment list
   * Only applies filtering if other filters (price/area/floor) are active
   */
  const availableRooms = computed(() => {
    if (!apartments.value || apartments.value.length === 0) {
      // If no apartments loaded, return all possible room types from metadata
      return metadata.value?.roomsAvailable || [1, 2, 3, 4]
    }

    // If no non-room filters are active, allow all room types
    if (!hasActiveNonRoomFilters.value) {
      return metadata.value?.roomsAvailable || [1, 2, 3, 4]
    }

    // Extract unique room counts from current filtered apartments
    const roomCounts = new Set(
      apartments.value.map(apartment => apartment.rooms),
    )

    return Array.from(roomCounts).sort((a, b) => a - b)
  })

  /**
   * Check if a specific room type is available
   */
  const isRoomAvailable = (roomCount: number) => {
    return availableRooms.value.includes(roomCount)
  }

  /**
   * Get count of apartments for each room type
   */
  const roomCounts = computed(() => {
    const counts: Record<number, number> = {}

    availableRooms.value.forEach((roomCount) => {
      counts[roomCount] = apartments.value.filter(
        apt => apt.rooms === roomCount,
      ).length
    })

    return counts
  })

  return {
    availableRooms,
    isRoomAvailable,
    roomCounts,
  }
}
