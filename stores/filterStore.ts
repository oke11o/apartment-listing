import { defineStore } from "pinia";

import type {
  FilterParams,
  FilterState,
  FilterMetadata,
  ValidationResult,
  FilterValidationRules,
} from "~/types";
import { useApartmentStore } from "./apartmentStore";
import { useFilterPersistence } from "~/composables/useLocalStorage";

export const useFilterStore = defineStore("filter", {
  state: (): FilterState => ({
    filters: {
      priceRange: [3200000, 25000000],
      areaRange: [25.5, 150.0],
      rooms: [],
      floors: [1, 20],
    },
    metadata: null,
    loading: false,
    error: null,
    isActive: false,
  }),

  getters: {
    /**
     * Get current filter values
     */
    currentFilters: (state) => state.filters,

    /**
     * Check if any filters are active (different from default)
     */
    hasActiveFilters: (state) => {
      if (!state.metadata) return false;

      const { filters, metadata } = state;

      // Check if price range is different from metadata range
      const priceChanged =
        filters.priceRange[0] !== metadata.priceRange[0] ||
        filters.priceRange[1] !== metadata.priceRange[1];

      // Check if area range is different from metadata range
      const areaChanged =
        filters.areaRange[0] !== metadata.areaRange[0] ||
        filters.areaRange[1] !== metadata.areaRange[1];

      // Check if rooms are selected
      const roomsSelected = filters.rooms.length > 0;

      // Check if floor range is different from metadata range
      const floorsChanged =
        filters.floors[0] !== metadata.floorsRange[0] ||
        filters.floors[1] !== metadata.floorsRange[1];

      return priceChanged || areaChanged || roomsSelected || floorsChanged;
    },

    /**
     * Get filter validation rules based on metadata
     */
    validationRules: (state): FilterValidationRules | null => {
      if (!state.metadata) return null;

      return {
        priceRange: {
          min: state.metadata.priceRange[0],
          max: state.metadata.priceRange[1],
        },
        areaRange: {
          min: state.metadata.areaRange[0],
          max: state.metadata.areaRange[1],
        },
        rooms: {
          available: state.metadata.roomsAvailable,
        },
        floors: {
          min: state.metadata.floorsRange[0],
          max: state.metadata.floorsRange[1],
        },
      };
    },

    /**
     * Get loading state
     */
    isLoading: (state) => state.loading,

    /**
     * Get error state
     */
    hasError: (state) => !!state.error,

    /**
     * Get active filters count
     */
    activeFiltersCount: (state) => {
      let count = 0;

      if (!state.metadata) return count;

      const { filters, metadata } = state;

      // Count price filter
      if (
        filters.priceRange[0] !== metadata.priceRange[0] ||
        filters.priceRange[1] !== metadata.priceRange[1]
      ) {
        count++;
      }

      // Count area filter
      if (
        filters.areaRange[0] !== metadata.areaRange[0] ||
        filters.areaRange[1] !== metadata.areaRange[1]
      ) {
        count++;
      }

      // Count rooms filter
      if (filters.rooms.length > 0) {
        count++;
      }

      // Count floors filter
      if (
        filters.floors[0] !== metadata.floorsRange[0] ||
        filters.floors[1] !== metadata.floorsRange[1]
      ) {
        count++;
      }

      return count;
    },
  },

  actions: {
    /**
     * Initialize filters with metadata from API
     * @param metadata - Filter metadata from API response
     */
    initializeFilters(metadata: FilterMetadata) {
      this.metadata = metadata;

      // Default filter values based on metadata
      const defaultFilters: FilterParams = {
        priceRange: [...metadata.priceRange],
        areaRange: [...metadata.areaRange],
        rooms: [],
        floors: [...metadata.floorsRange],
      };

      // Try to load saved filters from localStorage first
      // URL filters will be applied separately from the component
      const { loadFilters } = useFilterPersistence();
      const savedFilters = loadFilters();

      if (savedFilters) {
        // Validate saved filters against metadata
        const validatedFilters = this.validateSavedFilters(
          savedFilters,
          metadata
        );
        this.filters = validatedFilters;
      } else {
        // Set default filter values
        this.filters = defaultFilters;
      }

      this.isActive = this.hasActiveFilters;
      this.error = null;
    },

    /**
     * Apply filters from URL (called from component)
     * @param urlFilters - Parsed URL filters
     */
    applyUrlFilters(urlFilters: Partial<FilterParams>) {
      if (!this.metadata) return;

      const validatedFilters = this.validateSavedFilters(
        urlFilters,
        this.metadata
      );
      this.filters = validatedFilters;
      this.isActive = this.hasActiveFilters;
      this.error = null;
    },

    /**
     * Update price range filter
     * @param range - New price range [min, max]
     */
    updatePriceRange(range: [number, number]) {
      if (this.validatePriceRange(range)) {
        this.filters.priceRange = [...range];
        this.isActive = this.hasActiveFilters;
        this.error = null;
        this.saveFiltersToStorage();
      }
    },

    /**
     * Update area range filter
     * @param range - New area range [min, max]
     */
    updateAreaRange(range: [number, number]) {
      if (this.validateAreaRange(range)) {
        this.filters.areaRange = [...range];
        this.isActive = this.hasActiveFilters;
        this.error = null;
        this.saveFiltersToStorage();
      }
    },

    /**
     * Update rooms filter
     * @param rooms - Array of selected room counts
     */
    updateRooms(rooms: number[]) {
      if (this.validateRooms(rooms)) {
        this.filters.rooms = [...rooms];
        this.isActive = this.hasActiveFilters;
        this.error = null;
        this.saveFiltersToStorage();
      }
    },

    /**
     * Update floors range filter
     * @param range - New floors range [min, max]
     */
    updateFloorsRange(range: [number, number]) {
      if (this.validateFloorsRange(range)) {
        this.filters.floors = [...range];
        this.isActive = this.hasActiveFilters;
        this.error = null;
        this.saveFiltersToStorage();
      }
    },

    /**
     * Toggle room selection
     * @param roomCount - Room count to toggle
     */
    toggleRoom(roomCount: number) {
      const index = this.filters.rooms.indexOf(roomCount);
      if (index > -1) {
        this.filters.rooms.splice(index, 1);
      } else {
        this.filters.rooms.push(roomCount);
      }
      this.filters.rooms.sort((a, b) => a - b);
      this.isActive = this.hasActiveFilters;
      this.saveFiltersToStorage();
    },

    /**
     * Reset all filters to default values
     */
    resetFilters() {
      if (!this.metadata) return;

      this.filters = {
        priceRange: [...this.metadata.priceRange],
        areaRange: [...this.metadata.areaRange],
        rooms: [],
        floors: [...this.metadata.floorsRange],
      };

      this.isActive = false;
      this.error = null;

      // Clear saved filters from localStorage
      const { clearFilters } = useFilterPersistence();
      clearFilters();

      // URL will be cleared by component
    },

    /**
     * Apply current filters (trigger apartment loading)
     * This method is called by debounced filter changes
     */
    async applyFilters() {
      try {
        this.loading = true;
        this.error = null;

        // Validate all filters before applying
        const validation = this.validateAllFilters();
        if (!validation.isValid) {
          this.error = validation.errors.map((e) => e.message).join(", ");
          return;
        }

        // Get apartment store and trigger filtering
        const apartmentStore = useApartmentStore();

        // Pass filters only if there are active filters, otherwise pass undefined for reset
        const filtersToApply = this.hasActiveFilters ? this.filters : undefined;
        await apartmentStore.filterApartments(filtersToApply);
      } catch (error) {
        console.error("Error applying filters:", error);
        this.error =
          error instanceof Error ? error.message : "Failed to apply filters";
      } finally {
        this.loading = false;
      }
    },

    /**
     * Set loading state
     * @param loading - Loading state
     */
    setLoading(loading: boolean) {
      this.loading = loading;
    },

    /**
     * Clear error state
     */
    clearError() {
      this.error = null;
    },

    /**
     * Validate price range
     * @param range - Price range to validate
     */
    validatePriceRange(range: [number, number]): boolean {
      if (!this.metadata) return false;

      const [min, max] = range;
      const [metaMin, metaMax] = this.metadata.priceRange;

      if (min < metaMin || max > metaMax || min > max) {
        this.error = `Цена должна быть от ${metaMin.toLocaleString()} до ${metaMax.toLocaleString()} руб.`;
        return false;
      }

      return true;
    },

    /**
     * Validate area range
     * @param range - Area range to validate
     */
    validateAreaRange(range: [number, number]): boolean {
      if (!this.metadata) return false;

      const [min, max] = range;
      const [metaMin, metaMax] = this.metadata.areaRange;

      if (min < metaMin || max > metaMax || min > max) {
        this.error = `Площадь должна быть от ${metaMin} до ${metaMax} м²`;
        return false;
      }

      return true;
    },

    /**
     * Validate rooms selection
     * @param rooms - Rooms array to validate
     */
    validateRooms(rooms: number[]): boolean {
      if (!this.metadata) return false;

      const invalidRooms = rooms.filter(
        (room) => !this.metadata!.roomsAvailable.includes(room)
      );

      if (invalidRooms.length > 0) {
        this.error = `Недоступные варианты комнат: ${invalidRooms.join(", ")}`;
        return false;
      }

      return true;
    },

    /**
     * Validate floors range
     * @param range - Floors range to validate
     */
    validateFloorsRange(range: [number, number]): boolean {
      if (!this.metadata) return false;

      const [min, max] = range;
      const [metaMin, metaMax] = this.metadata.floorsRange;

      if (min < metaMin || max > metaMax || min > max) {
        this.error = `Этаж должен быть от ${metaMin} до ${metaMax}`;
        return false;
      }

      return true;
    },

    /**
     * Validate all current filters
     */
    validateAllFilters(): ValidationResult {
      const errors: Array<{ field: string; message: string; code: string }> =
        [];

      if (!this.validatePriceRange(this.filters.priceRange)) {
        errors.push({
          field: "priceRange",
          message: this.error || "Invalid price range",
          code: "INVALID_PRICE_RANGE",
        });
      }

      if (!this.validateAreaRange(this.filters.areaRange)) {
        errors.push({
          field: "areaRange",
          message: this.error || "Invalid area range",
          code: "INVALID_AREA_RANGE",
        });
      }

      if (!this.validateRooms(this.filters.rooms)) {
        errors.push({
          field: "rooms",
          message: this.error || "Invalid rooms selection",
          code: "INVALID_ROOMS",
        });
      }

      if (!this.validateFloorsRange(this.filters.floors)) {
        errors.push({
          field: "floors",
          message: this.error || "Invalid floors range",
          code: "INVALID_FLOORS_RANGE",
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },

    /**
     * Save current filters to localStorage
     */
    saveFiltersToStorage() {
      const { saveFilters } = useFilterPersistence();
      saveFilters(this.filters);
    },

    /**
     * Validate saved filters against current metadata
     * @param savedFilters - Filters loaded from localStorage
     * @param metadata - Current filter metadata
     */
    validateSavedFilters(
      savedFilters: Partial<FilterParams>,
      metadata: FilterMetadata
    ): FilterParams {
      const validatedFilters: FilterParams = {
        priceRange: [...metadata.priceRange],
        areaRange: [...metadata.areaRange],
        rooms: [],
        floors: [...metadata.floorsRange],
      };

      // Validate price range
      if (
        savedFilters.priceRange &&
        Array.isArray(savedFilters.priceRange) &&
        savedFilters.priceRange.length === 2
      ) {
        const [min, max] = savedFilters.priceRange;
        if (
          typeof min === "number" &&
          typeof max === "number" &&
          min >= metadata.priceRange[0] &&
          max <= metadata.priceRange[1] &&
          min <= max
        ) {
          validatedFilters.priceRange = [min, max];
        }
      }

      // Validate area range
      if (
        savedFilters.areaRange &&
        Array.isArray(savedFilters.areaRange) &&
        savedFilters.areaRange.length === 2
      ) {
        const [min, max] = savedFilters.areaRange;
        if (
          typeof min === "number" &&
          typeof max === "number" &&
          min >= metadata.areaRange[0] &&
          max <= metadata.areaRange[1] &&
          min <= max
        ) {
          validatedFilters.areaRange = [min, max];
        }
      }

      // Validate rooms
      if (savedFilters.rooms && Array.isArray(savedFilters.rooms)) {
        const validRooms = savedFilters.rooms.filter(
          (room: unknown): room is number =>
            typeof room === "number" && metadata.roomsAvailable.includes(room)
        );
        validatedFilters.rooms = validRooms;
      }

      // Validate floors range
      if (
        savedFilters.floors &&
        Array.isArray(savedFilters.floors) &&
        savedFilters.floors.length === 2
      ) {
        const [min, max] = savedFilters.floors;
        if (
          typeof min === "number" &&
          typeof max === "number" &&
          min >= metadata.floorsRange[0] &&
          max <= metadata.floorsRange[1] &&
          min <= max
        ) {
          validatedFilters.floors = [min, max];
        }
      }

      return validatedFilters;
    },
  },
});
