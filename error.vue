<template>
  <div class="error-page">
    <div class="error-container">
      <h1 class="error-title">
        {{ error.statusCode }}
      </h1>
      <p class="error-message">
        {{ error.statusMessage }}
      </p>

      <div class="error-actions">
        <button
          class="error-button error-button--primary"
          @click="handleError"
        >
          Попробовать снова
        </button>

        <NuxtLink
          to="/"
          class="error-button error-button--secondary"
        >
          На главную
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  error: {
    statusCode: number
    statusMessage: string
    message?: string
  }
}

const props = defineProps<Props>()

// Handle error recovery
const handleError = async () => {
  await clearError({ redirect: '/' })
}

// Set error page meta
useHead({
  title: `Ошибка ${props.error.statusCode}`,
  meta: [
    { name: 'description', content: 'Произошла ошибка при загрузке страницы' },
  ],
})
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: spacing(lg);
  background: color(gray-50);
}

.error-container {
  text-align: center;
  max-width: 500px;
}

.error-title {
  font-size: 4rem;
  font-weight: 700;
  color: color(primary);
  margin: 0 0 spacing(md);
}

.error-message {
  font-size: 1.25rem;
  color: color(gray-600);
  margin: 0 0 spacing(xl);
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: spacing(md);
  justify-content: center;
  flex-wrap: wrap;
}

.error-button {
  @include button-base;
  padding: spacing(md) spacing(xl);
  font-size: 1rem;
  text-decoration: none;

  &--primary {
    @include button-primary;
  }

  &--secondary {
    background: color(white);
    color: color(gray-700);
    border: 1px solid color(gray-300);

    &:hover {
      background: color(gray-50);
    }
  }
}

@include mobile-only {
  .error-title {
    font-size: 3rem;
  }

  .error-message {
    font-size: 1.125rem;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .error-button {
    width: 100%;
    max-width: 200px;
  }
}
</style>
