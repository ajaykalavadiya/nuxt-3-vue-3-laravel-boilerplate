<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categoriesApi } from '@/api/categories'
import { productsApi } from '@/api/products'
import BasePagination from '@/components/BasePagination.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { formatPrice } from '@/lib/format'
import type { Category, Paginated, Product } from '@/types'

const route = useRoute()
const router = useRouter()

const result = ref<Paginated<Product> | null>(null)
const categories = ref<Category[]>([])
const loading = ref(false)
const error = ref('')
const search = ref(typeof route.query.search === 'string' ? route.query.search : '')
const categoryId = ref<number | ''>(Number(route.query.category_id) || '')
const page = ref(Number(route.query.page) || 1)
const deletingId = ref<number | null>(null)

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    result.value = await productsApi.list({
      page: page.value,
      search: search.value,
      category_id: categoryId.value || undefined,
    })
    // Deleting the last item on the last page leaves us past the end.
    if (result.value.data.length === 0 && page.value > 1) {
      page.value = result.value.meta.last_page
      return load()
    }
  } catch {
    error.value = 'Failed to load products.'
  } finally {
    loading.value = false
  }
}

let debounce: ReturnType<typeof setTimeout> | undefined
watch(search, () => {
  clearTimeout(debounce)
  debounce = setTimeout(() => {
    page.value = 1
    load()
  }, 300)
})

watch(categoryId, () => {
  page.value = 1
  load()
})

// Keep filters/page in the URL so the list survives reloads and back navigation.
watch([search, categoryId, page], () => {
  router.replace({
    query: {
      ...(search.value && { search: search.value }),
      ...(categoryId.value && { category_id: categoryId.value }),
      ...(page.value > 1 && { page: page.value }),
    },
  })
})

function goTo(newPage: number): void {
  page.value = newPage
  load()
}

async function remove(product: Product): Promise<void> {
  if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
  deletingId.value = product.id
  try {
    await productsApi.remove(product.id)
    await load()
  } catch {
    error.value = `Failed to delete "${product.name}".`
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  load()
  categoriesApi
    .all()
    .then((list) => (categories.value = list))
    .catch(() => {})
})
</script>

<template>
  <section class="products">
    <header class="page-header">
      <div>
        <h1>Products</h1>
        <p>Manage the catalogue your customers can buy.</p>
      </div>
      <RouterLink :to="{ name: 'product-create' }" class="btn btn--primary">+ New product</RouterLink>
    </header>

    <div class="card">
      <div class="toolbar">
        <input v-model="search" type="search" placeholder="Search by name or SKU…" aria-label="Search products" />
        <select v-model="categoryId" aria-label="Filter by category">
          <option value="">All categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
      </div>

      <p v-if="error" class="alert alert--error products__alert" role="alert">{{ error }}</p>

      <div class="table-wrap" :class="{ 'is-loading': loading }">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th class="num">Price</th>
              <th class="num">Stock</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in result?.data" :key="product.id">
              <td>
                <strong>{{ product.name }}</strong>
                <small v-if="product.description">{{ product.description }}</small>
              </td>
              <td><code>{{ product.sku }}</code></td>
              <td :class="{ muted: !product.category }">{{ product.category?.name ?? 'Uncategorised' }}</td>
              <td class="num">{{ formatPrice(product.price) }}</td>
              <td class="num" :class="{ 'is-low': product.stock < 10 }">{{ product.stock }}</td>
              <td><StatusBadge :active="product.is_active" /></td>
              <td class="actions">
                <RouterLink :to="{ name: 'product-edit', params: { id: product.id } }" class="btn btn--ghost btn--sm">
                  Edit
                </RouterLink>
                <button class="btn btn--danger btn--sm" :disabled="deletingId === product.id" @click="remove(product)">
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="result && result.data.length === 0">
              <td colspan="7" class="empty">
                {{
                  search
                    ? `No products match “${search}”.`
                    : categoryId
                      ? 'No products in this category.'
                      : 'No products yet — create your first one.'
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination v-if="result" :meta="result.meta" @change="goTo" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing * 0.75;
  padding: $spacing;
  border-bottom: 1px solid $border;

  input,
  select {
    padding: 0.5rem 0.75rem;
    border: 1px solid $border;
    border-radius: $radius;
    background: $surface;
    color: $text;
    font: inherit;

    &:focus {
      border-color: $primary;
      @include focus-ring;
    }
  }

  input[type='search'] {
    flex: 1 1 220px;
    max-width: 320px;
  }
}

.products__alert {
  margin: $spacing;
}

.is-low {
  color: $warning;
  font-weight: 600;
}
</style>
