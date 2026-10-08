/** Provides `$api`: a $fetch instance bound to the Laravel API that sends the bearer token. */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const { token, clear } = useAuth()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    headers: { Accept: 'application/json' },
    onRequest({ options }) {
      if (token.value) options.headers.set('Authorization', `Bearer ${token.value}`)
    },
    async onResponseError({ response }) {
      if (response.status === 401 && token.value) {
        clear()
        await nuxtApp.runWithContext(() => navigateTo('/login'))
      }
    },
  })

  return { provide: { api } }
})
