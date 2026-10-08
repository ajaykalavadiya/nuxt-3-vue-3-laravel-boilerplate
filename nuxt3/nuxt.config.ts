// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  typescript: {
    strict: true,
  },
  runtimeConfig: {
    public: {
      // Override with NUXT_PUBLIC_API_BASE
      apiBase: 'http://localhost:8000/api',
    },
  },
  // The e2e suite builds into separate dirs so it never clobbers a running `nuxt dev`.
  ...(process.env.E2E_BUILD && {
    buildDir: '.nuxt-e2e',
    nitro: { output: { dir: '.output-e2e' } },
  }),
  css: ['~/assets/styles/main.scss'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~/assets/styles/variables" as *;\n`,
        },
      },
    },
  },
})
