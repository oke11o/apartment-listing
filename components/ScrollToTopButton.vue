<template>
  <Transition name="scroll-to-top">
    <button
      v-if="props.visible"
      class="scroll-to-top-button"
      type="button"
      :aria-label="props.ariaLabel"
      @click="scrollToTop"
    >
      <NuxtImg
        src="/icons/arrow-up-white.svg"
        alt="Стрелка вверх"
        class="scroll-to-top-button__icon"
        width="24"
        height="24"
      />
    </button>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  scrollPosition?: number
  ariaLabel?: string
}

interface Emits {
  (_e: 'scroll-to-top'): void
}

const props = withDefaults(defineProps<Props>(), {
  scrollPosition: 0,
  ariaLabel: 'Прокрутить страницу наверх',
})

const emit = defineEmits<Emits>()

const scrollToTop = () => {
  // Emit event for parent component handling
  emit('scroll-to-top')

  // Fallback smooth scroll behavior
  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
}
</script>
