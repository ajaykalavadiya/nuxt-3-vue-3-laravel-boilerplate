import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi } from '@/api/auth'
import { tokenStorage } from '@/lib/http'
import { useAuthStore } from './auth'

vi.mock('@/api/auth', () => ({
  authApi: { login: vi.fn(), me: vi.fn(), logout: vi.fn() },
}))

const user = { id: 1, name: 'Demo User', email: 'demo@example.com' }

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('stores the token and user on login', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ token: 't1', user })
    const auth = useAuthStore()

    await auth.login('demo@example.com', 'password')

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user).toEqual(user)
    expect(tokenStorage.get()).toBe('t1')
  })

  it('restores the user from a stored token', async () => {
    tokenStorage.set('t1')
    vi.mocked(authApi.me).mockResolvedValue(user)
    const auth = useAuthStore()

    await auth.fetchUser()

    expect(auth.user).toEqual(user)
  })

  it('drops an invalid stored token', async () => {
    tokenStorage.set('stale')
    vi.mocked(authApi.me).mockRejectedValue(new Error('401'))
    const auth = useAuthStore()

    await auth.fetchUser()

    expect(auth.isAuthenticated).toBe(false)
    expect(tokenStorage.get()).toBeNull()
  })

  it('clears local state on logout even if the API call fails', async () => {
    tokenStorage.set('t1')
    vi.mocked(authApi.logout).mockRejectedValue(new Error('network'))
    const auth = useAuthStore()

    await expect(auth.logout()).rejects.toThrow('network')

    expect(auth.isAuthenticated).toBe(false)
    expect(tokenStorage.get()).toBeNull()
  })
})
