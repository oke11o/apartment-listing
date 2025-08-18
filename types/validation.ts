// Validation utilities for apartment listing types

import type {
  FilterParams,
  FilterValidationRules,
  ValidationResult,
  ValidationError,
  PaginationParams,
} from './index'

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const DEFAULT_VALIDATION_RULES: FilterValidationRules = {
  priceRange: {
    min: 0,
    max: 100_000_000,
  },
  areaRange: {
    min: 1,
    max: 1000,
  },
  rooms: {
    available: [1, 2, 3, 4],
  },
  floors: {
    min: 1,
    max: 50,
  },
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export const validateFilterParams = (
  filters: FilterParams,
  rules: FilterValidationRules = DEFAULT_VALIDATION_RULES,
): ValidationResult => {
  const errors: ValidationError[] = []

  // Validate price range
  if (filters.priceRange[0] < rules.priceRange.min) {
    errors.push({
      field: 'priceRange',
      message: `Минимальная цена не может быть меньше ${rules.priceRange.min}`,
      code: 'PRICE_MIN_INVALID',
    })
  }

  if (filters.priceRange[1] > rules.priceRange.max) {
    errors.push({
      field: 'priceRange',
      message: `Максимальная цена не может быть больше ${rules.priceRange.max}`,
      code: 'PRICE_MAX_INVALID',
    })
  }

  if (filters.priceRange[0] > filters.priceRange[1]) {
    errors.push({
      field: 'priceRange',
      message: 'Минимальная цена не может быть больше максимальной',
      code: 'PRICE_RANGE_INVALID',
    })
  }

  // Validate area range
  if (filters.areaRange[0] < rules.areaRange.min) {
    errors.push({
      field: 'areaRange',
      message: `Минимальная площадь не может быть меньше ${rules.areaRange.min}`,
      code: 'AREA_MIN_INVALID',
    })
  }

  if (filters.areaRange[1] > rules.areaRange.max) {
    errors.push({
      field: 'areaRange',
      message: `Максимальная площадь не может быть больше ${rules.areaRange.max}`,
      code: 'AREA_MAX_INVALID',
    })
  }

  if (filters.areaRange[0] > filters.areaRange[1]) {
    errors.push({
      field: 'areaRange',
      message: 'Минимальная площадь не может быть больше максимальной',
      code: 'AREA_RANGE_INVALID',
    })
  }

  // Validate rooms
  const invalidRooms = filters.rooms.filter(
    room => !rules.rooms.available.includes(room),
  )
  if (invalidRooms.length > 0) {
    errors.push({
      field: 'rooms',
      message: `Недопустимое количество комнат: ${invalidRooms.join(', ')}`,
      code: 'ROOMS_INVALID',
    })
  }

  // Validate floors
  if (filters.floors[0] < rules.floors.min) {
    errors.push({
      field: 'floors',
      message: `Минимальный этаж не может быть меньше ${rules.floors.min}`,
      code: 'FLOOR_MIN_INVALID',
    })
  }

  if (filters.floors[1] > rules.floors.max) {
    errors.push({
      field: 'floors',
      message: `Максимальный этаж не может быть больше ${rules.floors.max}`,
      code: 'FLOOR_MAX_INVALID',
    })
  }

  if (filters.floors[0] > filters.floors[1]) {
    errors.push({
      field: 'floors',
      message: 'Минимальный этаж не может быть больше максимального',
      code: 'FLOOR_RANGE_INVALID',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateApartment = (
  apartment: Record<string, unknown>,
): ValidationResult => {
  const errors: ValidationError[] = []

  // Required fields validation
  if (!apartment.id || typeof apartment.id !== 'string') {
    errors.push({
      field: 'id',
      message: 'ID квартиры обязателен и должен быть строкой',
      code: 'ID_REQUIRED',
    })
  }

  if (!apartment.title || typeof apartment.title !== 'string') {
    errors.push({
      field: 'title',
      message: 'Название квартиры обязательно и должно быть строкой',
      code: 'TITLE_REQUIRED',
    })
  }

  if (typeof apartment.price !== 'number' || apartment.price <= 0) {
    errors.push({
      field: 'price',
      message: 'Цена должна быть положительным числом',
      code: 'PRICE_INVALID',
    })
  }

  if (typeof apartment.area !== 'number' || apartment.area <= 0) {
    errors.push({
      field: 'area',
      message: 'Площадь должна быть положительным числом',
      code: 'AREA_INVALID',
    })
  }

  if (typeof apartment.rooms !== 'number' || apartment.rooms <= 0) {
    errors.push({
      field: 'rooms',
      message: 'Количество комнат должно быть положительным числом',
      code: 'ROOMS_INVALID',
    })
  }

  if (typeof apartment.floor !== 'number' || apartment.floor <= 0) {
    errors.push({
      field: 'floor',
      message: 'Этаж должен быть положительным числом',
      code: 'FLOOR_INVALID',
    })
  }

  if (typeof apartment.totalFloors !== 'number' || apartment.totalFloors <= 0) {
    errors.push({
      field: 'totalFloors',
      message: 'Общее количество этажей должно быть положительным числом',
      code: 'TOTAL_FLOORS_INVALID',
    })
  }

  if (
    typeof apartment.floor === 'number'
    && typeof apartment.totalFloors === 'number'
    && apartment.floor > apartment.totalFloors
  ) {
    errors.push({
      field: 'floor',
      message: 'Этаж не может быть больше общего количества этажей',
      code: 'FLOOR_EXCEEDS_TOTAL',
    })
  }

  if (!apartment.address || typeof apartment.address !== 'string') {
    errors.push({
      field: 'address',
      message: 'Адрес обязателен и должен быть строкой',
      code: 'ADDRESS_REQUIRED',
    })
  }

  if (!Array.isArray(apartment.images)) {
    errors.push({
      field: 'images',
      message: 'Изображения должны быть массивом',
      code: 'IMAGES_INVALID',
    })
  }

  if (!Array.isArray(apartment.features)) {
    errors.push({
      field: 'features',
      message: 'Особенности должны быть массивом',
      code: 'FEATURES_INVALID',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validatePaginationParams = (
  pagination: PaginationParams,
): ValidationResult => {
  const errors: ValidationError[] = []

  if (typeof pagination.page !== 'number' || pagination.page < 1) {
    errors.push({
      field: 'page',
      message: 'Номер страницы должен быть положительным числом',
      code: 'PAGE_INVALID',
    })
  }

  if (
    typeof pagination.limit !== 'number'
    || pagination.limit < 1
    || pagination.limit > 100
  ) {
    errors.push({
      field: 'limit',
      message: 'Лимит должен быть числом от 1 до 100',
      code: 'LIMIT_INVALID',
    })
  }

  if (typeof pagination.total !== 'number' || pagination.total < 0) {
    errors.push({
      field: 'total',
      message: 'Общее количество должно быть неотрицательным числом',
      code: 'TOTAL_INVALID',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

export const sanitizeFilterParams = (
  filters: Partial<FilterParams>,
): FilterParams => {
  return {
    priceRange: [
      Math.max(0, filters.priceRange?.[0] ?? 0),
      Math.min(100_000_000, filters.priceRange?.[1] ?? 100_000_000),
    ],
    areaRange: [
      Math.max(1, filters.areaRange?.[0] ?? 1),
      Math.min(1000, filters.areaRange?.[1] ?? 1000),
    ],
    rooms: (filters.rooms ?? []).filter(room =>
      DEFAULT_VALIDATION_RULES.rooms.available.includes(room),
    ),
    floors: [
      Math.max(1, filters.floors?.[0] ?? 1),
      Math.min(50, filters.floors?.[1] ?? 50),
    ],
  }
}

export const sanitizePaginationParams = (
  pagination: Partial<PaginationParams>,
): PaginationParams => {
  return {
    page: Math.max(1, pagination.page ?? 1),
    limit: Math.min(100, Math.max(1, pagination.limit ?? 20)),
    total: Math.max(0, pagination.total ?? 0),
  }
}
