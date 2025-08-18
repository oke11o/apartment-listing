// Type-related constants for the apartment listing application

import type { FilterParams, PaginationParams, FilterMetadata } from './index'

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_FILTER_PARAMS: FilterParams = {
  priceRange: [0, 100_000_000],
  areaRange: [1, 1000],
  rooms: [],
  floors: [1, 50],
}

export const DEFAULT_PAGINATION_PARAMS: PaginationParams = {
  page: 1,
  limit: 20,
  total: 0,
}

export const DEFAULT_FILTER_METADATA: FilterMetadata = {
  priceRange: [0, 100_000_000],
  areaRange: [1, 1000],
  roomsAvailable: [1, 2, 3, 4],
  floorsRange: [1, 50],
}

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
  mobile: 960,
  tablet: 1440,
} as const

// ============================================================================
// API CONSTANTS
// ============================================================================

export const API_ENDPOINTS = {
  apartments: '/api/apartments',
  filters: '/api/filters',
} as const

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const SCROLL_TO_TOP_THRESHOLD = 300

export const DEBOUNCE_DELAY = 500

export const LOADING_SPINNER_SIZES = {
  small: '16px',
  medium: '24px',
  large: '32px',
} as const

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const VALIDATION_LIMITS = {
  price: {
    min: 0,
    max: 100_000_000,
  },
  area: {
    min: 1,
    max: 1000,
  },
  rooms: {
    min: 1,
    max: 6,
  },
  floors: {
    min: 1,
    max: 50,
  },
  pagination: {
    minLimit: 1,
    maxLimit: 100,
    defaultLimit: 20,
  },
} as const

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  // Validation errors
  PRICE_MIN_INVALID: 'PRICE_MIN_INVALID',
  PRICE_MAX_INVALID: 'PRICE_MAX_INVALID',
  PRICE_RANGE_INVALID: 'PRICE_RANGE_INVALID',
  AREA_MIN_INVALID: 'AREA_MIN_INVALID',
  AREA_MAX_INVALID: 'AREA_MAX_INVALID',
  AREA_RANGE_INVALID: 'AREA_RANGE_INVALID',
  ROOMS_INVALID: 'ROOMS_INVALID',
  FLOOR_MIN_INVALID: 'FLOOR_MIN_INVALID',
  FLOOR_MAX_INVALID: 'FLOOR_MAX_INVALID',
  FLOOR_RANGE_INVALID: 'FLOOR_RANGE_INVALID',
  FLOOR_EXCEEDS_TOTAL: 'FLOOR_EXCEEDS_TOTAL',

  // Data validation errors
  ID_REQUIRED: 'ID_REQUIRED',
  TITLE_REQUIRED: 'TITLE_REQUIRED',
  ADDRESS_REQUIRED: 'ADDRESS_REQUIRED',
  IMAGES_INVALID: 'IMAGES_INVALID',
  FEATURES_INVALID: 'FEATURES_INVALID',

  // Pagination errors
  PAGE_INVALID: 'PAGE_INVALID',
  LIMIT_INVALID: 'LIMIT_INVALID',
  TOTAL_INVALID: 'TOTAL_INVALID',

  // API errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INVALID_REQUEST: 'INVALID_REQUEST',
} as const

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ErrorCode = keyof typeof ERROR_CODES
export type BreakpointKey = keyof typeof BREAKPOINTS
export type LoadingSpinnerSize = keyof typeof LOADING_SPINNER_SIZES
