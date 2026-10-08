<script setup lang="ts">
import type { Product } from '~/types'

useHead({ title: 'Edit product' })

const route = useRoute()
const id = Number(route.params.id)
const isEdit = true

const { $api } = useNuxtApp()
const { data: product, status, error } = await useAsyncData(`product-${id}`, () =>
  $api<{ data: Product }>(`/products/${id}`).then((res) => res.data),
)
const loading = computed(() => status.value === 'pending')
const { data: categories } = await useCategoryOptions()

const { submitting, errors, message: saveMessage, save } = useProductForm(id)
const message = computed(() => {
  if (saveMessage.value) return saveMessage.value
  if (!error.value) return ''
  return [403, 404].includes(toApiError(error.value).status) ? 'Product not found.' : 'Failed to load product.'
})
</script>

<template>
  <section class="product-page">
    <NuxtLink to="/products" class="product-page__back">← Back to products</NuxtLink>
    <h1>{{ isEdit ? 'Edit product' : 'New product' }}</h1>

    <div class="card product-page__card">
      <p v-if="message" class="alert alert--error" role="alert">{{ message }}</p>
      <p v-if="loading" class="product-page__loading">Loading…</p>
      <ProductForm
        v-else-if="!isEdit || product"
        :initial="product ?? undefined"
        :categories="categories"
        :errors="errors"
        :submitting="submitting"
        :submit-label="isEdit ? 'Save changes' : 'Create product'"
        @submit="save"
        @cancel="navigateTo('/products')"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.product-page {
  max-width: 720px;
  margin: 0 auto;

  &__back {
    display: inline-block;
    margin-bottom: $spacing * 0.75;
    color: $text-muted;
    font-size: 0.85rem;
    text-decoration: none;

    &:hover {
      color: $text;
    }
  }

  h1 {
    margin-bottom: $spacing * 1.25;
    font-size: 1.6rem;
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: $spacing;
    padding: $spacing * 1.5;
  }

  &__loading {
    margin: 0;
    color: $text-muted;
  }
}
</style>
