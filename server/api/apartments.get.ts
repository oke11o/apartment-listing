import type { Apartment, FilterParams, ApartmentListResponse, FilterMetadata } from '~/types'
import apartmentsData from '~/server/data/apartments.json'

interface QueryParams {
  page?: string
  limit?: string
  priceMin?: string
  priceMax?: string
  areaMin?: string
  areaMax?: string
  rooms?: string
  floorMin?: string
  floorMax?: string
}

export default defineEventHandler(
  async (event): Promise<ApartmentListResponse> => {
    try {
      // Use imported apartments data
      const data = apartmentsData

      // Get query parameters
      const query = getQuery(event) as QueryParams

      // Parse pagination parameters
      const page = parseInt(query.page || '1')
      const limit = parseInt(query.limit || '20')

      // Parse filter parameters
      const filters: Partial<FilterParams> = {
        priceRange: [
          parseInt(query.priceMin || '0'),
          parseInt(query.priceMax || '999999999'),
        ],
        areaRange: [
          parseFloat(query.areaMin || '0'),
          parseFloat(query.areaMax || '999999'),
        ],
        rooms: query.rooms
          ? query.rooms.split(',').map(r => parseInt(r))
          : [],
        floors: [
          parseInt(query.floorMin || '1'),
          parseInt(query.floorMax || '999'),
        ],
      }

      // Filter apartments
      const filteredApartments = data.apartments.filter(
        (apartment: Apartment) => {
          // Price filter
          if (
            filters.priceRange
            && (apartment.price < filters.priceRange[0]
              || apartment.price > filters.priceRange[1])
          ) {
            return false
          }

          // Area filter
          if (
            filters.areaRange
            && (apartment.area < filters.areaRange[0]
              || apartment.area > filters.areaRange[1])
          ) {
            return false
          }

          // Rooms filter
          if (
            filters.rooms
            && filters.rooms.length > 0
            && !filters.rooms.includes(apartment.rooms)
          ) {
            return false
          }

          // Floor filter
          if (
            filters.floors
            && (apartment.floor < filters.floors[0]
              || apartment.floor > filters.floors[1])
          ) {
            return false
          }

          return true
        },
      )

      // Calculate pagination
      const total = filteredApartments.length
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit

      // Apply pagination
      const paginatedApartments = filteredApartments.slice(
        startIndex,
        endIndex,
      )

      // Optimize image URLs for better performance
      const optimizedApartments = paginatedApartments.map(
        (apartment: Apartment) => ({
          ...apartment,
          images: apartment.images.map((image: string) => {
            // In production, you would optimize images here
            // For now, just ensure images have proper loading attributes
            return image
          }),
        }),
      )

      // Set cache headers for better performance
      setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=600') // 5 min browser, 10 min CDN
      setHeader(event, 'ETag', `"apartments-${total}-${page}-${limit}"`)

      // Return response
      return {
        apartments: optimizedApartments,
        meta: {
          total,
          filters: data.meta.filters as FilterMetadata,
        },
      }
    }
    catch (error) {
      console.error('Error in apartments API:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      })
    }
  },
)
