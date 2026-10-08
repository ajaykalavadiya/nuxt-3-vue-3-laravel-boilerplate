import type { Category } from '~/types'

/** Every category, alphabetical and unpaginated — for select inputs. */
export function useCategoryOptions() {
  const { $api } = useNuxtApp()
  return useAsyncData(
    'category-options',
    () => $api<{ data: Category[] }>('/categories', { query: { all: 1 } }).then((res) => res.data),
    { default: () => [] },
  )
}
