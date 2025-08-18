<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// App initialization is handled by plugins/app-init.client.ts
// SEO and meta configuration is in nuxt.config.ts

// Mark non-critical content as loaded to prevent FOUC
onMounted(() => {
  nextTick(() => {
    const nonCriticalElements = document.querySelectorAll('.non-critical')
    nonCriticalElements.forEach(el => el.classList.add('loaded'))
  })
})
</script>
