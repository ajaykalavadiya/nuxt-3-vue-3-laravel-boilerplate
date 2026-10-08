<script setup lang="ts">
import type { Paginated, Product } from '~/types'

useHead({ title: 'Products' })

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()

// The URL query is the source of truth, so filters survive reloads and SSR.
const page = computed(() => Number(route.query.page) || 1)
const searchQuery = computed(() => (typeof route.query.search === 'string' ? route.query.search : ''))
const categoryQuery = computed(() => Number(route.query.category_id) || undefined)
const search = ref(searchQuery.value)
const categoryId = ref<number | ''>(categoryQuery.value ?? '')

const { data: result, status, error: loadError, refresh } = await useAsyncData(
  'products',
  () =>
    $api<Paginated<Product>>('/products', {
      query: { page: page.value, search: searchQuery.value || undefined, category_id: categoryQuery.value },
    }),
  { watch: [page, searchQuery, categoryQuery] },
)
const { data: categories } = await useCategoryOptions()
const loading = computed(() => status.value === 'pending')
const actionError = ref('')
const error = computed(() => actionError.value || (loadError.value ? 'Failed to load products.' : ''))
const deletingId = ref<number | null>(null)

function setQuery(next: { page?: number; search?: string; category_id?: number }): void {
  const merged = { page: page.value, search: searchQuery.value, category_id: categoryQuery.value, ...next }
  router.replace({
    query: {
      ...(merged.search && { search: merged.search }),
      ...(merged.category_id && { category_id: merged.category_id }),
      ...(merged.page > 1 && { page: merged.page }),
    },
  })
}

let debounce: ReturnType<typeof setTimeout> | undefined
watch(search, (value) => {
  clearTimeout(debounce)
  debounce = setTimeout(() => setQuery({ search: value, page: 1 }), 300)
})

watch(categoryId, (value) => setQuery({ category_id: value || undefined, page: 1 }))

const goTo = (newPage: number): void => setQuery({ page: newPage })

async function remove(product: Product): Promise<void> {
  if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
  deletingId.value = product.id
  actionError.value = ''
  try {
    await $api(`/products/${product.id}`, { method: 'DELETE' })
    // Deleting the last item on the last page leaves us past the end.
    if (result.value?.data.length === 1 && page.value > 1) goTo(page.value - 1)
    else await refresh()
  } catch {
    actionError.value = `Failed to delete "${product.name}".`
  } finally {
    deletingId.value = null
  }
}
</script>
<template>
  <section class="products">
    <header class="page-header">
      <div>
        <h1>Products</h1>
        <p>Manage the catalogue your customers can buy.</p>
      </div>
      <NuxtLink to="/products/create" class="btn btn--primary">+ New product</NuxtLink>
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
                <NuxtLink :to="`/products/${product.id}/edit`" class="btn btn--ghost btn--sm">
                  Edit
                </NuxtLink>
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
