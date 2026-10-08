import { createPinia } from 'pinia'
import { createApp } from 'vue'
import '@/assets/styles/main.scss'
import App from './App.vue'
import { onUnauthorized } from '@/lib/http'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App).use(createPinia()).use(router)

onUnauthorized(() => {
  useAuthStore().reset()
  router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
})

app.mount('#app')
