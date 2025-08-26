import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { FilterParams } from "~/types";

/**
 * Composable for managing filter state in URL query parameters
 * Allows sharing filtered apartment listings via URL
 */
export const useUrlFilters = () => {
  // Only work on client side to avoid SSR issues
  if (!import.meta.client) {
    return {
      parseFiltersFromUrl: () => null,
      updateUrlWithFilters: () => Promise.resolve(),
      clearUrlFilters: () => Promise.resolve(),
      watchUrlFilters: () => () => {},
      getShareableUrl: () => "",
      hasUrlFilters: () => false,
    };
  }

  const route = useRoute();
  const router = useRouter();

  /**
   * Parse filters from URL query parameters
   * @returns Parsed filter parameters or null if no valid filters found
   */
  const parseFiltersFromUrl = (): Partial<FilterParams> | null => {
    const query = route.query;

    if (!query || Object.keys(query).length === 0) {
      return null;
    }

    const filters: Partial<FilterParams> = {};

    try {
      // Parse price range
      if (query.priceMin && query.priceMax) {
        const priceMin = Number(query.priceMin);
        const priceMax = Number(query.priceMax);
        if (!isNaN(priceMin) && !isNaN(priceMax) && priceMin <= priceMax) {
          filters.priceRange = [priceMin, priceMax];
        }
      }

      // Parse area range
      if (query.areaMin && query.areaMax) {
        const areaMin = Number(query.areaMin);
        const areaMax = Number(query.areaMax);
        if (!isNaN(areaMin) && !isNaN(areaMax) && areaMin <= areaMax) {
          filters.areaRange = [areaMin, areaMax];
        }
      }

      // Parse rooms
      if (query.rooms) {
        const roomsParam = Array.isArray(query.rooms)
          ? query.rooms
          : [query.rooms];
        const rooms = roomsParam
          .map((r) => Number(r))
          .filter((r) => !isNaN(r) && r > 0)
          .sort((a, b) => a - b);

        if (rooms.length > 0) {
          filters.rooms = rooms;
        }
      }

      // Parse floors range
      if (query.floorMin && query.floorMax) {
        const floorMin = Number(query.floorMin);
        const floorMax = Number(query.floorMax);
        if (!isNaN(floorMin) && !isNaN(floorMax) && floorMin <= floorMax) {
          filters.floors = [floorMin, floorMax];
        }
      }

      return Object.keys(filters).length > 0 ? filters : null;
    } catch (error) {
      console.warn("Error parsing filters from URL:", error);
      return null;
    }
  };

  /**
   * Update URL with current filter state
   * @param filters - Current filter parameters
   * @param defaultFilters - Default filter values to compare against
   */
  const updateUrlWithFilters = async (
    filters: FilterParams,
    defaultFilters: FilterParams
  ) => {
    // Only run on client side
    if (!import.meta.client) return;

    const query: Record<string, string | string[]> = {};

    // Add price range to URL if different from default
    if (
      filters.priceRange[0] !== defaultFilters.priceRange[0] ||
      filters.priceRange[1] !== defaultFilters.priceRange[1]
    ) {
      query.priceMin = filters.priceRange[0].toString();
      query.priceMax = filters.priceRange[1].toString();
    }

    // Add area range to URL if different from default
    if (
      filters.areaRange[0] !== defaultFilters.areaRange[0] ||
      filters.areaRange[1] !== defaultFilters.areaRange[1]
    ) {
      query.areaMin = filters.areaRange[0].toString();
      query.areaMax = filters.areaRange[1].toString();
    }

    // Add rooms to URL if any are selected
    if (filters.rooms.length > 0) {
      query.rooms = filters.rooms.map((r) => r.toString());
    }

    // Add floors range to URL if different from default
    if (
      filters.floors[0] !== defaultFilters.floors[0] ||
      filters.floors[1] !== defaultFilters.floors[1]
    ) {
      query.floorMin = filters.floors[0].toString();
      query.floorMax = filters.floors[1].toString();
    }

    try {
      // Update URL without triggering navigation
      await router.replace({
        path: route.path,
        query: Object.keys(query).length > 0 ? query : undefined,
      });
    } catch (error) {
      console.warn("Error updating URL with filters:", error);
    }
  };

  /**
   * Clear all filter parameters from URL
   */
  const clearUrlFilters = async () => {
    // Only run on client side
    if (!import.meta.client) return;

    try {
      await router.replace({
        path: route.path,
        query: undefined,
      });
    } catch (error) {
      console.warn("Error clearing URL filters:", error);
    }
  };

  /**
   * Watch for URL changes and return parsed filters
   * @param callback - Function to call when URL filters change
   */
  const watchUrlFilters = (
    callback: (filters: Partial<FilterParams> | null) => void
  ) => {
    return watch(
      () => route.query,
      () => {
        const filters = parseFiltersFromUrl();
        callback(filters);
      },
      { immediate: true }
    );
  };

  /**
   * Get current URL with filters for sharing
   * @returns Complete URL with current filter parameters
   */
  const getShareableUrl = (): string => {
    if (import.meta.client) {
      return window.location.href;
    }
    return "";
  };

  /**
   * Check if URL contains any filter parameters
   */
  const hasUrlFilters = (): boolean => {
    const query = route.query;
    const filterParams = [
      "priceMin",
      "priceMax",
      "areaMin",
      "areaMax",
      "rooms",
      "floorMin",
      "floorMax",
    ];
    return filterParams.some((param) => query[param] !== undefined);
  };

  return {
    parseFiltersFromUrl,
    updateUrlWithFilters,
    clearUrlFilters,
    watchUrlFilters,
    getShareableUrl,
    hasUrlFilters,
  };
};
