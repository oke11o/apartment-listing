<template>
  <!-- Unified responsive component -->
  <article
    class="apartment-card"
    :class="{ 'apartment-card--loading': loading }"
  >
    <!-- Mobile view content -->
    <div class="apartment-card__mobile">
      <div class="apartment-card__content">
        <div class="apartment-card__info">
          <h3 class="apartment-card__title">
            {{ apartment.rooms }}-комнатная квартира №{{ apartment.id.replace('apt_', '') }}
          </h3>
          <div class="apartment-card__details">
            <span class="apartment-card__area">{{ apartment.area }} м²</span>
            <span class="apartment-card__floor">
              <span class="apartment-card__floor-current">{{ apartment.floor }}</span>
              <span class="apartment-card__floor-total">из {{ apartment.totalFloors }}</span>
            </span>
            <span class="apartment-card__price">{{ formatPrice(apartment.price) }}</span>
          </div>
        </div>

        <div class="apartment-card__image-wrapper">
          <img
            v-if="apartment.images.length > 0 && !imageError"
            :src="apartment.images[0]"
            :alt="`Фото ${apartment.rooms}-комнатной квартиры №${apartment.id.replace('apt_', '')}`"
            class="apartment-card__image"
            loading="lazy"
            decoding="async"
            width="66"
            height="66"
            @error="onImageError"
            @load="onImageLoad"
          >
          <div
            v-else
            class="apartment-card__image-placeholder"
          >
            <span class="apartment-card__image-placeholder-text">Нет фото</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop table row view content -->
    <div class="apartment-card__desktop">
      <div class="apartment-row__cell apartment-row__cell--photo">
        <div class="apartment-row__image-wrapper">
          <img
            v-if="apartment.images.length > 0 && !imageError"
            :src="apartment.images[0]"
            :alt="`Фото ${apartment.rooms}-комнатной квартиры №${apartment.id.replace('apt_', '')}`"
            class="apartment-row__image"
            loading="lazy"
            decoding="async"
            width="80"
            height="60"
            @error="onImageError"
            @load="onImageLoad"
          >
          <div
            v-else
            class="apartment-row__image-placeholder"
          >
            <span class="apartment-row__image-placeholder-text">Нет фото</span>
          </div>
        </div>
      </div>

      <div class="apartment-row__cell apartment-row__cell--description">
        <div class="apartment-row__description-content">
          <div class="apartment-row__title">
            {{ apartment.rooms }}-комнатная №{{ apartment.id.replace('apt_', '') }}
          </div>
        </div>
      </div>

      <div class="apartment-row__cell apartment-row__cell--area">
        {{ apartment.area }} м²
      </div>

      <div class="apartment-row__cell apartment-row__cell--floor">
        <span class="apartment-row__floor-current">{{ apartment.floor }}</span>
        <span class="apartment-row__floor-total">из {{ apartment.totalFloors }}</span>
      </div>

      <div class="apartment-row__cell apartment-row__cell--price">
        {{ formatPrice(apartment.price) }}
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Apartment } from '~/types'

interface Props {
  apartment: Apartment
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const imageError = ref(false)
const imageLoaded = ref(false)

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

const onImageError = () => {
  imageError.value = true
}

const onImageLoad = (event: Event) => {
  imageLoaded.value = true
  const img = event.target as HTMLImageElement
  // Ensure image is always visible
  img.style.opacity = '1'
  img.style.visibility = 'visible'
}
</script>

<style lang="scss" scoped>
// Component styles are now in assets/scss/components/_apartment-card.scss
// Only component-specific overrides or unique styles go here if needed
</style>
