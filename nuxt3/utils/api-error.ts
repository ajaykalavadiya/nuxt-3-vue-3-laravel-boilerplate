import type { ValidationErrors } from '~/types'

export interface ApiErrorInfo {
  status: number
  message: string
  errors: ValidationErrors
}

interface ErrorLike {
  statusCode?: number
  message?: string
  data?: { message?: string; errors?: ValidationErrors }
}

/**
 * Normalise errors from $api (FetchError) or useAsyncData (NuxtError) —
 * both carry `statusCode` and the Laravel JSON body in `data`.
 */
export function toApiError(error: unknown): ApiErrorInfo {
  const e = (error ?? {}) as ErrorLike
  return {
    status: e.statusCode ?? 0,
    message: e.data?.message ?? e.message ?? 'Unknown error',
    errors: e.data?.errors ?? {},
  }
}
