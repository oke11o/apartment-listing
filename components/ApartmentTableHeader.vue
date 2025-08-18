<template>
  <div class="table-header">
    <div class="table-header__cell table-header__cell--photo">
      Планировка
    </div>
    <div class="table-header__cell table-header__cell--description">
      Квартира
    </div>
    <div
      class="table-header__cell table-header__cell--area"
      @click="handleSort('area')"
    >
      <span>S, м²</span>
      <span class="table-header__sort">
        <NuxtImg
          src="/icons/violet.svg"
          alt="Сортировка по возрастанию"
          class="table-header__arrow"
          :class="{
            'table-header__arrow--active':
              sortField === 'area' && sortOrder === 'asc',
          }"
          placeholder-class="table-header__arrow-placeholder"
          width="8"
          height="5"
        />
        <NuxtImg
          src="/icons/violet.svg"
          alt="Сортировка по убыванию"
          class="table-header__arrow table-header__arrow--down"
          :class="{
            'table-header__arrow--active':
              sortField === 'area' && sortOrder === 'desc',
          }"
          placeholder-class="table-header__arrow-placeholder"
          width="8"
          height="5"
        />
      </span>
    </div>
    <div
      class="table-header__cell table-header__cell--floor"
      @click="handleSort('floor')"
    >
      <span>Этаж</span>
      <span class="table-header__sort">
        <NuxtImg
          src="/icons/violet.svg"
          alt="Сортировка по возрастанию"
          class="table-header__arrow"
          :class="{
            'table-header__arrow--active':
              sortField === 'floor' && sortOrder === 'asc',
          }"
          placeholder-class="table-header__arrow-placeholder"
          width="8"
          height="5"
        />
        <NuxtImg
          src="/icons/violet.svg"
          alt="Сортировка по убыванию"
          class="table-header__arrow table-header__arrow--down"
          :class="{
            'table-header__arrow--active':
              sortField === 'floor' && sortOrder === 'desc',
          }"
          placeholder-class="table-header__arrow-placeholder"
          width="8"
          height="5"
        />
      </span>
    </div>
    <div
      class="table-header__cell table-header__cell--price"
      @click="handleSort('price')"
    >
      <span>Цена, ₽</span>
      <span class="table-header__sort">
        <NuxtImg
          src="/icons/violet.svg"
          alt="Сортировка по возрастанию"
          class="table-header__arrow"
          :class="{
            'table-header__arrow--active':
              sortField === 'price' && sortOrder === 'asc',
          }"
          placeholder-class="table-header__arrow-placeholder"
          width="8"
          height="5"
        />
        <NuxtImg
          src="/icons/violet.svg"
          alt="Сортировка по убыванию"
          class="table-header__arrow table-header__arrow--down"
          :class="{
            'table-header__arrow--active':
              sortField === 'price' && sortOrder === 'desc',
          }"
          placeholder-class="table-header__arrow-placeholder"
          width="8"
          height="5"
        />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

interface Emits {
  (e: 'sort', field: string, order: 'asc' | 'desc'): void
}

const props = withDefaults(defineProps<Props>(), {
  sortField: '',
  sortOrder: 'asc',
})

const emit = defineEmits<Emits>()

// Preload the sorting arrow icon when component mounts
const { preloadResources } = usePerformance()

onMounted(() => {
  // Preload the violet.svg icon used for sorting arrows
  preloadResources(['/icons/violet.svg'], 'image')
})

const handleSort = (field: string) => {
  let newOrder: 'asc' | 'desc' = 'asc'

  if (props.sortField === field) {
    newOrder = props.sortOrder === 'asc' ? 'desc' : 'asc'
  }

  emit('sort', field, newOrder)
}
</script>
