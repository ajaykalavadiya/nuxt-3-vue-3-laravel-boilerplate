import { http } from '@/lib/http'
import type { Paginated, Product, ProductInput, Resource } from '@/types'

export interface ProductQuery {
  page?: number
  search?: string
  per_page?: number
  category_id?: number
}

export const productsApi = {
  list: (query: ProductQuery = {}) => http<Paginated<Product>>('/products', { query: { ...query } }),

  get: (id: number) => http<Resource<Product>>(`/products/${id}`).then((res) => res.data),

  create: (input: ProductInput) =>
    http<Resource<Product>>('/products', { method: 'POST', body: input }).then((res) => res.data),

  update: (id: number, input: ProductInput) =>
    http<Resource<Product>>(`/products/${id}`, { method: 'PUT', body: input }).then((res) => res.data),

  remove: (id: number) => http<void>(`/products/${id}`, { method: 'DELETE' }),
}
