<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { categoriesApi } from '@/api/categories'
import { productsApi } from '@/api/products'
import ProductForm from '@/components/ProductForm.vue'
import { ApiError } from '@/lib/http'
import type { Category, Product, ProductInput, ValidationErrors } from '@/types'

const props = defineProps<{ id?: number }>()

const router = useRouter()

const isEdit = computed(() => props.id !== undefined)
const product = ref<Product | null>(null)
const categories = ref<Category[]>([])
const loading = ref(true)
const submitting = ref(false)
const errors = ref<ValidationErrors>({})
const message = ref('')

onMounted(async () => {
  try {
    const [loadedProduct, loadedCategories] = await Promise.all([
      props.id === undefined ? null : productsApi.get(props.id),
      categoriesApi.all(),
    ])
    product.value = loadedProduct
    categories.value = loadedCategories
  } catch (e) {
    message.value = e instanceof ApiError && [403, 404].includes(e.status) ? 'Product not found.' : 'Failed to load product.'
  } finally {
    loading.value = false
  }
})

async function save(input: ProductInput): Promise<void> {
  submitting.value = true
  errors.value = {}
  message.value = ''
  try {
    if (props.id !== undefined) await productsApi.update(props.id, input)
    else await productsApi.create(input)
    await router.push({ name: 'products' })
  } catch (e) {
    if (e instanceof ApiError && e.status === 422) errors.value = e.errors
    else message.value = 'Something went wrong while saving. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="product-page">
    <RouterLink :to="{ name: 'products' }" class="product-page__back">← Back to products</RouterLink>
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
        @cancel="router.push({ name: 'products' })"
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
