<template>
  <ApartmentsList />
</template>

<script setup lang="ts">
import ApartmentsList from '~/components/ApartmentsList.vue'

// Meta tags for SEO
useHead({
  title: 'Список квартир - Поиск и аренда квартир',
  meta: [
    {
      name: 'description',
      content:
        'Найдите идеальную квартиру с помощью удобных фильтров. Большой выбор квартир с фотографиями и подробными характеристиками.',
    },
    {
      name: 'keywords',
      content: 'квартиры, аренда, поиск квартир, фильтры, недвижимость',
    },
  ],
})
</script>
