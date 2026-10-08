import { http } from '@/lib/http'
import type { LoginResponse, Resource, User } from '@/types'

export const authApi = {
  login: (email: string, password: string) =>
    http<LoginResponse>('/login', { method: 'POST', body: { email, password, device_name: 'vue3' } }),

  me: () => http<Resource<User>>('/me').then((res) => res.data),

  logout: () => http<void>('/logout', { method: 'POST' }),
}
