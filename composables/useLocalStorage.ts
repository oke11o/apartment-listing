import { ref, watch, type Ref } from 'vue'
import type { FilterParams } from '~/types'

/**
 * Composable for managing localStorage with reactive updates
 * Provides type-safe localStorage operations with automatic serialization
 */
export const useLocalStorage = <T>(
  key: string,
  defaultValue: T,
  options: {
    serializer?: {
      read: (value: string) => T
      write: (value: T) => string
    }
  } = {},
): [Ref<T>, (_value: T) => void, () => void] => {
  const {
    serializer = {
      read: JSON.parse,
      write: JSON.stringify,
    },
  } = options

  const storedValue = ref<T>(defaultValue)

  // Read from localStorage on initialization
  const read = (): T => {
    if (!import.meta.client) return defaultValue

    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue
      return serializer.read(item)
    }
    catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  }

  // Write to localStorage
  const write = (value: T): void => {
    if (!import.meta.client) return

    try {
      localStorage.setItem(key, serializer.write(value))
      storedValue.value = value
    }
    catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error)
    }
  }

  // Remove from localStorage
  const remove = (): void => {
    if (!import.meta.client) return

    try {
      localStorage.removeItem(key)
      storedValue.value = defaultValue
    }
    catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }

  // Initialize value
  storedValue.value = read()

  // Watch for changes and update localStorage
  watch(
    storedValue,
    (newValue) => {
      write(newValue)
    },
    { deep: true },
  )

  return [storedValue as Ref<T>, write, remove]
}

/**
 * Specialized composable for filter persistence
 */
export const useFilterPersistence = () => {
  const STORAGE_KEY = 'apartment-filters'

  const saveFilters = (filters: FilterParams) => {
    if (!import.meta.client) return

    try {
      const filtersToSave = {
        priceRange: filters.priceRange,
        areaRange: filters.areaRange,
        rooms: filters.rooms,
        floors: filters.floors,
        timestamp: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtersToSave))
    }
    catch (error) {
      console.warn('Error saving filters to localStorage:', error)
    }
  }

  const loadFilters = () => {
    if (!import.meta.client) return null

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const parsed = JSON.parse(stored)

      // Check if stored filters are not too old (7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
      if (parsed.timestamp && Date.now() - parsed.timestamp > maxAge) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }

      return {
        priceRange: parsed.priceRange || [3200000, 25000000],
        areaRange: parsed.areaRange || [25.5, 150.0],
        rooms: parsed.rooms || [],
        floors: parsed.floors || [1, 20],
      }
    }
    catch (error) {
      console.warn('Error loading filters from localStorage:', error)
      return null
    }
  }

  const clearFilters = () => {
    if (!import.meta.client) return

    try {
      localStorage.removeItem(STORAGE_KEY)
    }
    catch (error) {
      console.warn('Error clearing filters from localStorage:', error)
    }
  }

  return {
    saveFilters,
    loadFilters,
    clearFilters,
  }
}
