// Core data types for the apartment listing application

// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

export interface Apartment {
  id: string
  title: string
  price: number
  area: number
  rooms: number
  floor: number
  totalFloors: number
  address: string
  images: string[]
  description?: string
  features: string[]
}

export interface FilterParams {
  priceRange: [number, number]
  areaRange: [number, number]
  rooms: number[]
  floors: [number, number]
}

export interface PaginationParams {
  page: number
  limit: number
  total: number
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
    page: number
    limit: number
    filters?: FilterMetadata
  }
  error?: ApiError
}

export interface ApartmentListResponse {
  apartments: Apartment[]
  meta: {
    total: number
    filters: FilterMetadata
  }
}

export interface FilterMetadata {
  priceRange: [number, number]
  areaRange: [number, number]
  roomsAvailable: number[]
  floorsRange: [number, number]
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// ============================================================================
// APPLICATION STATE TYPES
// ============================================================================

export interface ApartmentState {
  apartments: Apartment[]
  loading: boolean
  error: string | null
  pagination: PaginationParams
  hasMore: boolean
}

export interface FilterState {
  filters: FilterParams
  metadata: FilterMetadata | null
  loading: boolean
  error: string | null
  isActive: boolean
}

export interface UIState {
  showScrollToTop: boolean
  scrollPosition: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface FilterValidationRules {
  priceRange: {
    min: number
    max: number
  }
  areaRange: {
    min: number
    max: number
  }
  rooms: {
    available: number[]
  }
  floors: {
    min: number
    max: number
  }
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface ApartmentCardProps {
  apartment: Apartment
  loading?: boolean
}

export interface FilterPanelProps {
  filters: FilterParams
  metadata: FilterMetadata | null
  loading: boolean
  disabled?: boolean
}

export interface LoadMoreButtonProps {
  loading: boolean
  hasMore: boolean
  disabled?: boolean
}

export interface ScrollToTopButtonProps {
  visible: boolean
  scrollPosition?: number
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface FilterChangeEvent {
  filters: FilterParams
  source: 'user' | 'reset' | 'initial'
}

export interface LoadMoreEvent {
  page: number
  limit: number
}

export interface ScrollEvent {
  position: number
  direction: 'up' | 'down'
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export type BreakpointType = 'mobile' | 'tablet' | 'desktop'

export type SortOrder = 'asc' | 'desc'

export type SortField = 'price' | 'area' | 'rooms' | 'floor'

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isApartment = (obj: unknown): obj is Apartment => {
  return (
    typeof obj === 'object'
    && obj !== null
    && typeof (obj as Record<string, unknown>).id === 'string'
    && typeof (obj as Record<string, unknown>).title === 'string'
    && typeof (obj as Record<string, unknown>).price === 'number'
    && typeof (obj as Record<string, unknown>).area === 'number'
    && typeof (obj as Record<string, unknown>).rooms === 'number'
    && typeof (obj as Record<string, unknown>).floor === 'number'
    && typeof (obj as Record<string, unknown>).totalFloors === 'number'
    && typeof (obj as Record<string, unknown>).address === 'string'
    && Array.isArray((obj as Record<string, unknown>).images)
    && Array.isArray((obj as Record<string, unknown>).features)
  )
}

export const isFilterParams = (obj: unknown): obj is FilterParams => {
  const record = obj as Record<string, unknown>
  return (
    typeof obj === 'object'
    && obj !== null
    && Array.isArray(record.priceRange)
    && record.priceRange.length === 2
    && Array.isArray(record.areaRange)
    && record.areaRange.length === 2
    && Array.isArray(record.rooms)
    && Array.isArray(record.floors)
    && record.floors.length === 2
  )
}

export const isApiError = (obj: unknown): obj is ApiError => {
  return (
    typeof obj === 'object'
    && obj !== null
    && typeof (obj as Record<string, unknown>).code === 'string'
    && typeof (obj as Record<string, unknown>).message === 'string'
  )
}
// ============================================================================
// RE-EXPORTS
// ============================================================================

export * from './validation'
export * from './constants'
