/**
 * Global SEO middleware
 * Handles dynamic meta tags and structured data
 */
export default defineNuxtRouteMiddleware((to) => {
  // Set page-specific meta tags
  if (to.path === '/') {
    useHead({
      title: 'Список квартир - Поиск и фильтрация',
      meta: [
        {
          name: 'description',
          content:
            'Найдите идеальную квартиру с помощью удобных фильтров по цене, площади, количеству комнат и этажу',
        },
        {
          property: 'og:title',
          content: 'Список квартир - Поиск и фильтрация',
        },
        {
          property: 'og:description',
          content: 'Найдите идеальную квартиру с помощью удобных фильтров',
        },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
    })
  }
})
