import type { Apartment, FilterParams } from '~/types'

/**
 * SEO composable for managing meta tags and structured data
 * Compatible with Nuxt 3
 */
export const useSeo = () => {
  /**
   * Set apartment listing page SEO
   */
  const setApartmentListingSeo = (totalCount?: number) => {
    const title = totalCount
      ? `${totalCount} квартир - Поиск и фильтрация`
      : 'Список квартир - Поиск и фильтрация'

    const description = totalCount
      ? `Найдите идеальную квартиру из ${totalCount} вариантов с помощью удобных фильтров`
      : 'Найдите идеальную квартиру с помощью удобных фильтров по цене, площади, количеству комнат и этажу'

    useHead({
      title,
      meta: [
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
    })
  }

  /**
   * Set filtered results SEO
   */
  const setFilteredResultsSeo = (count: number, filters: FilterParams) => {
    const filterParts: string[] = []

    if (filters.rooms?.length) {
      filterParts.push(`${filters.rooms.join(', ')} комн.`)
    }

    if (filters.priceRange) {
      filterParts.push(`от ${filters.priceRange[0].toLocaleString()} руб.`)
    }

    if (filters.areaRange) {
      filterParts.push(`${filters.areaRange[0]}-${filters.areaRange[1]} м²`)
    }

    const filterText = filterParts.length ? ` (${filterParts.join(', ')})` : ''
    const title = `${count} квартир${filterText} - Поиск недвижимости`
    const description = `Найдено ${count} квартир${filterText}. Используйте фильтры для уточнения поиска.`

    useHead({
      title,
      meta: [
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
      ],
    })
  }

  /**
   * Generate structured data for apartment listings
   */
  const setApartmentStructuredData = (apartments: Apartment[]) => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': 'Список квартир',
      'description': 'Квартиры для продажи с фильтрацией',
      'numberOfItems': apartments.length,
      'itemListElement': apartments.map((apartment, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Apartment',
          'name': `${apartment.rooms}-комнатная квартира, ${apartment.area} м²`,
          'description': `Квартира на ${apartment.floor} этаже, площадь ${apartment.area} м²`,
          'offers': {
            '@type': 'Offer',
            'price': apartment.price,
            'priceCurrency': 'RUB',
          },
        },
      })),
    }

    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(structuredData),
        },
      ],
    })
  }

  return {
    setApartmentListingSeo,
    setFilteredResultsSeo,
    setApartmentStructuredData,
  }
}
