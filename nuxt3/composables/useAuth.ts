import type { LoginResponse, Resource, User } from '~/types'

/**
 * Token lives in a cookie so it is available during SSR as well as on the client;
 * the user is shared state hydrated from the server render.
 */
export function useAuth() {
  const token = useCookie<string | null>('auth_token', {
    sameSite: 'lax',
    secure: !import.meta.dev,
    maxAge: 60 * 60 * 24 * 7,
  })
  const user = useState<User | null>('auth_user', () => null)
  const isAuthenticated = computed(() => Boolean(token.value))

  async function login(email: string, password: string): Promise<void> {
    const res = await useNuxtApp().$api<LoginResponse>('/login', {
      method: 'POST',
      body: { email, password, device_name: 'nuxt3' },
    })
    token.value = res.token
    user.value = res.user
  }

  /** Load the user for a token restored from the cookie; drops the token if it is no longer valid. */
  async function fetchUser(): Promise<void> {
    if (!token.value || user.value) return
    try {
      user.value = (await useNuxtApp().$api<Resource<User>>('/me')).data
    } catch {
      clear()
    }
  }

  async function logout(): Promise<void> {
    try {
      await useNuxtApp().$api('/logout', { method: 'POST' })
    } finally {
      clear()
    }
  }

  function clear(): void {
    token.value = null
    user.value = null
  }

  return { token, user, isAuthenticated, login, fetchUser, logout, clear }
}
