export interface User {
  id: number
  name: string
  email: string
}

export interface Category {
  id: number
  name: string
  description: string | null
  products_count?: number
  created_at: string
  updated_at: string
}

export type CategoryInput = Pick<Category, 'name' | 'description'>

export interface Product {
  id: number
  category_id: number | null
  category: Category | null
  name: string
  sku: string
  description: string | null
  price: number
  stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProductInput = Pick<Product, 'category_id' | 'name' | 'sku' | 'description' | 'price' | 'stock' | 'is_active'>

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface Resource<T> {
  data: T
}

export interface LoginResponse {
  token: string
  user: User
}

export type ValidationErrors = Record<string, string[]>
