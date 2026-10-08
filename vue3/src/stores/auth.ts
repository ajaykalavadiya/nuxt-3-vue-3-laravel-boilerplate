import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/api/auth'
import { tokenStorage } from '@/lib/http'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(tokenStorage.get())

  const isAuthenticated = computed(() => token.value !== null)

  async function login(email: string, password: string): Promise<void> {
    const res = await authApi.login(email, password)
    tokenStorage.set(res.token)
    token.value = res.token
    user.value = res.user
  }

  /** Load the user for a token restored from storage; drops the token if it is no longer valid. */
  async function fetchUser(): Promise<void> {
    if (!token.value || user.value) return
    try {
      user.value = await authApi.me()
    } catch {
      reset()
    }
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } finally {
      reset()
    }
  }

  function reset(): void {
    tokenStorage.clear()
    token.value = null
    user.value = null
  }

  return { user, token, isAuthenticated, login, fetchUser, logout, reset }
})
