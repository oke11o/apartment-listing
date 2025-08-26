// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Nuxt 3 configuration

  // Modules
  modules: ["@pinia/nuxt", "@nuxt/image"],
  devtools: { enabled: true },

  // App configuration
  app: {
    head: {
      title: "Список квартир",
      meta: [
        { name: "description", content: "Поиск и фильтрация квартир" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { charset: "utf-8" },
      ],
      script: [
        {
          innerHTML: `
            // Скрываем контент до загрузки Vue
            document.documentElement.style.visibility = 'hidden';
            document.documentElement.style.opacity = '0';
          `,
          type: "text/javascript",
        },
      ],
    },
  },

  // CSS - Critical CSS first for better performance
  css: [
    "~/assets/css/fonts.css",
    "~/assets/scss/critical.scss", // Critical above-the-fold styles
    "~/assets/scss/main.scss",
  ],

  // Runtime config
  runtimeConfig: {
    // Private keys (only available on server-side)
    // apiSecret: '123',

    // Public keys (exposed to client-side)
    public: {
      apiBase: "/api",
    },
  },

  // Build configuration for browser compatibility and optimization
  build: {
    transpile: [
      "intersection-observer",
      "resize-observer-polyfill",
      "smoothscroll-polyfill",
    ],
  },

  // Nitro configuration for Vercel deployment
  nitro: {
    preset: "vercel",
    vercel: {
      functions: {
        maxDuration: 30,
      },
    },
  },

  // Vite configuration with optimizations
  vite: {
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // Global imports removed - using @use in main.scss instead
        },
      },
    },
    build: {
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            "vue-vendor": ["vue", "@vue/runtime-core"],
            "pinia-vendor": ["pinia"],
            utils: [
              "~/composables/useApiCache",
              "~/composables/useImageOptimization",
            ],
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        "intersection-observer",
        "resize-observer-polyfill",
        "smoothscroll-polyfill",
      ],
    },
  },

  // TypeScript configuration - полностью отключено
  typescript: {
    strict: false,
    typeCheck: false,
    includeWorkspace: false,
  },

  // Note: chunk optimization is handled by Vite/Rollup defaults in Nuxt 3

  // PostCSS configuration for autoprefixer
  postcss: {
    plugins: {
      autoprefixer: {},
    },
  },

  // Image optimization
  image: {
    dir: "public",
    quality: 80,
    format: ["webp", "png", "jpg"],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },
});
