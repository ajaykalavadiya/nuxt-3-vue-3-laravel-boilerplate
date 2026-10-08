import { http } from '@/lib/http'
import type { Category, CategoryInput, Paginated, Resource } from '@/types'

export interface CategoryQuery {
  page?: number
  search?: string
  per_page?: number
}

export const categoriesApi = {
  list: (query: CategoryQuery = {}) => http<Paginated<Category>>('/categories', { query: { ...query } }),

  /** Every category, alphabetical and unpaginated — for select inputs. */
  all: () => http<{ data: Category[] }>('/categories', { query: { all: 1 } }).then((res) => res.data),

  create: (input: CategoryInput) =>
    http<Resource<Category>>('/categories', { method: 'POST', body: input }).then((res) => res.data),

  update: (id: number, input: CategoryInput) =>
    http<Resource<Category>>(`/categories/${id}`, { method: 'PUT', body: input }).then((res) => res.data),

  remove: (id: number) => http<void>(`/categories/${id}`, { method: 'DELETE' }),
}
