<template>
  <div class="load-more-container">
    <button
      class="load-more-button"
      :class="{
        'load-more-button--loading': loading,
        'load-more-button--disabled': disabled || !hasMore,
      }"
      :disabled="loading || disabled || !hasMore"
      type="button"
      @click="handleClick"
    >
      <span class="load-more-button__text">{{ buttonText }}</span>
    </button>

    <p
      v-if="!hasMore && !loading"
      class="load-more-message"
    >
      Все квартиры загружены
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean
  hasMore: boolean
  disabled?: boolean
  loadCount?: number
}

interface Emits {
  (_e: 'load-more'): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  loadCount: 20,
})

const emit = defineEmits<Emits>()

const buttonText = computed(() => {
  if (props.loading) {
    return 'Загрузка...'
  }
  if (!props.hasMore) {
    return 'Нет больше квартир'
  }
  return 'Загрузить ещё'
})

const handleClick = () => {
  if (!props.loading && !props.disabled && props.hasMore) {
    emit('load-more')
  }
}
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.load-more-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: spacing(md);
  padding: spacing(xl) 0;
}

.load-more-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border: 1px solid color(gray-200);
  background: color(white);
  color: color(gray-900);
  border-radius: 25px;
  font-family: $font-family-primary;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.load-more-button:hover:not(:disabled) {
  background: color(gray-50);
  box-shadow: shadow(sm);
}

.load-more-button:active:not(:disabled) {
  background: color(gray-100);
}

.load-more-button--disabled,
.load-more-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.load-more-message {
  font-family: $font-family-primary;
  font-size: 14px;
  color: color(gray-500);
  text-align: center;
  margin: 0;
  font-style: italic;
}

/* Mobile styles (< 960px) */
@include mobile-only {
  .load-more-container {
    padding: spacing(lg) 0;
    gap: 12px;
  }

  .load-more-button {
    padding: 10px spacing(md);
    font-size: 14px;
  }

  .load-more-message {
    font-size: 13px;
  }
}

/* Desktop styles (> 1440px) */
@include desktop-large-up {
  .load-more-container {
    padding: 36px 0;
  }

  .load-more-button {
    padding: 14px 28px;
    font-size: 17px;
    min-width: 220px;
    min-height: 52px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .load-more-button {
    transition: none;
  }

  .load-more-button:hover:not(:disabled) {
    transform: none;
  }

  .load-more-button:active:not(:disabled) {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .load-more-button {
    border: 2px solid currentColor;
  }

  .load-more-button--disabled {
    border-color: color(gray-500);
  }
}

/* Loading state animation */
.load-more-button--loading .load-more-button__spinner {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@media (prefers-reduced-motion: reduce) {
  .load-more-button--loading .load-more-button__spinner {
    animation: none;
  }
}
</style>
