<template>
  <div
    class="loading-spinner"
    :class="{ 'loading-spinner--small': size === 'small' }"
  >
    <div class="loading-spinner__circle" />
    <span
      v-if="text"
      class="loading-spinner__text"
    >{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'normal' | 'small'
  text?: string
}

withDefaults(defineProps<Props>(), {
  size: 'normal',
  text: '',
})
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading-spinner--small {
  gap: spacing(sm);
}

.loading-spinner__circle {
  width: 40px;
  height: 40px;
  border: 3px solid color(gray-100);
  border-top: 3px solid color(primary-accent);
  border-radius: radius(full);
  animation: spin 1s linear infinite;
}

.loading-spinner--small .loading-spinner__circle {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.loading-spinner__text {
  font-size: 14px;
  color: color(gray-500);
  text-align: center;
}

.loading-spinner--small .loading-spinner__text {
  font-size: 12px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner__circle {
    animation: none;
    border-top-color: color(primary-accent);
    border-right-color: color(primary-accent);
  }
}
</style>
