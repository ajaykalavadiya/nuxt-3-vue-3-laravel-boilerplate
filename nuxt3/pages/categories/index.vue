<script setup lang="ts">
import type { Category, CategoryInput, Paginated, ValidationErrors } from '~/types'

useHead({ title: 'Categories' })

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()

// The URL query is the source of truth, so filters survive reloads and SSR.
const page = computed(() => Number(route.query.page) || 1)
const searchQuery = computed(() => (typeof route.query.search === 'string' ? route.query.search : ''))
const search = ref(searchQuery.value)

const { data: result, status, error: loadError, refresh } = await useAsyncData(
  'categories',
  () => $api<Paginated<Category>>('/categories', { query: { page: page.value, search: searchQuery.value || undefined } }),
  { watch: [page, searchQuery] },
)
const loading = computed(() => status.value === 'pending')
const actionError = ref('')
const error = computed(() => actionError.value || (loadError.value ? 'Failed to load categories.' : ''))
const deletingId = ref<number | null>(null)

// Modal state: `editing` is null when creating a new category.
const modalOpen = ref(false)
const editing = ref<Category | null>(null)
const formKey = ref(0)
const submitting = ref(false)
const formErrors = ref<ValidationErrors>({})
const formMessage = ref('')
const modalTitle = computed(() => (editing.value ? 'Edit category' : 'New category'))

function setQuery(next: { page?: number; search?: string }): void {
  const merged = { page: page.value, search: searchQuery.value, ...next }
  router.replace({ query: { ...(merged.search && { search: merged.search }), ...(merged.page > 1 && { page: merged.page }) } })
}

let debounce: ReturnType<typeof setTimeout> | undefined
watch(search, (value) => {
  clearTimeout(debounce)
  debounce = setTimeout(() => setQuery({ search: value, page: 1 }), 300)
})

const goTo = (newPage: number): void => setQuery({ page: newPage })

// Product pages cache the category dropdown; drop it so they refetch after changes.
const invalidateOptions = (): void => clearNuxtData('category-options')

function openModal(category: Category | null = null): void {
  editing.value = category
  formErrors.value = {}
  formMessage.value = ''
  formKey.value++ // remount the form so it picks up fresh initial values
  modalOpen.value = true
}

function closeModal(): void {
  if (submitting.value) return
  modalOpen.value = false
}

async function save(input: CategoryInput): Promise<void> {
  submitting.value = true
  formErrors.value = {}
  formMessage.value = ''
  try {
    await $api<{ data: Category }>(editing.value ? `/categories/${editing.value.id}` : '/categories', {
      method: editing.value ? 'PUT' : 'POST',
      body: input,
    })
    modalOpen.value = false
    invalidateOptions()
    if (!editing.value && page.value > 1) goTo(1)
    else await refresh()
  } catch (e) {
    const err = toApiError(e)
    if (err.status === 422) formErrors.value = err.errors
    else formMessage.value = 'Something went wrong while saving. Please try again.'
  } finally {
    submitting.value = false
  }
}

async function remove(category: Category): Promise<void> {
  const count = category.products_count ?? 0
  const note = count ? ` Its ${count} product${count === 1 ? '' : 's'} will become uncategorised.` : ''
  if (!confirm(`Delete "${category.name}"?${note}`)) return
  deletingId.value = category.id
  actionError.value = ''
  try {
    await $api(`/categories/${category.id}`, { method: 'DELETE' })
    invalidateOptions()
    // Deleting the last item on the last page leaves us past the end.
    if (result.value?.data.length === 1 && page.value > 1) goTo(page.value - 1)
    else await refresh()
  } catch {
    actionError.value = `Failed to delete "${category.name}".`
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <section class="categories">
    <header class="page-header">
      <div>
        <h1>Categories</h1>
        <p>Group products so they are easier to find.</p>
      </div>
      <button class="btn btn--primary" @click="openModal()">+ New category</button>
    </header>

    <div class="card">
      <div class="toolbar">
        <input v-model="search" type="search" placeholder="Search by name…" aria-label="Search categories" />
      </div>

      <p v-if="error" class="alert alert--error categories__alert" role="alert">{{ error }}</p>

      <div class="table-wrap" :class="{ 'is-loading': loading }">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th class="num">Products</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in result?.data" :key="category.id">
              <td>
                <strong>{{ category.name }}</strong>
                <small v-if="category.description">{{ category.description }}</small>
              </td>
              <td class="num">
                <NuxtLink :to="{ path: '/products', query: { category_id: category.id } }">
                  {{ category.products_count ?? 0 }}
                </NuxtLink>
              </td>
              <td class="actions">
                <button class="btn btn--ghost btn--sm" @click="openModal(category)">Edit</button>
                <button class="btn btn--danger btn--sm" :disabled="deletingId === category.id" @click="remove(category)">
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="result && result.data.length === 0">
              <td colspan="3" class="empty">
                {{ search ? `No categories match “${search}”.` : 'No categories yet — create your first one.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination v-if="result" :meta="result.meta" @change="goTo" />
    </div>

    <BaseModal :open="modalOpen" :title="modalTitle" @close="closeModal">
      <p v-if="formMessage" class="alert alert--error categories__form-alert" role="alert">{{ formMessage }}</p>
      <CategoryForm
        :key="formKey"
        :initial="editing ?? undefined"
        :errors="formErrors"
        :submitting="submitting"
        :submit-label="editing ? 'Save changes' : 'Create category'"
        @submit="save"
        @cancel="closeModal"
      />
    </BaseModal>
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

.categories {
  &__alert {
    margin: $spacing;
  }

  &__form-alert {
    margin: 0 0 $spacing;
  }
}
</style>
