import type { Product, ProductInput, ValidationErrors } from '~/types'

/** Shared submit handling for the create and edit product pages. */
export function useProductForm(id?: number) {
  const { $api } = useNuxtApp()
  const submitting = ref(false)
  const errors = ref<ValidationErrors>({})
  const message = ref('')

  async function save(input: ProductInput): Promise<void> {
    submitting.value = true
    errors.value = {}
    message.value = ''
    try {
      await $api<{ data: Product }>(id === undefined ? '/products' : `/products/${id}`, {
        method: id === undefined ? 'POST' : 'PUT',
        body: input,
      })
      await navigateTo('/products')
    } catch (e) {
      const err = toApiError(e)
      if (err.status === 422) errors.value = err.errors
      else message.value = 'Something went wrong while saving. Please try again.'
    } finally {
      submitting.value = false
    }
  }

  return { submitting, errors, message, save }
}
