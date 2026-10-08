<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categoriesApi } from '@/api/categories'
import BaseModal from '@/components/BaseModal.vue'
import BasePagination from '@/components/BasePagination.vue'
import CategoryForm from '@/components/CategoryForm.vue'
import { ApiError } from '@/lib/http'
import type { Category, CategoryInput, Paginated, ValidationErrors } from '@/types'

const route = useRoute()
const router = useRouter()

const result = ref<Paginated<Category> | null>(null)
const loading = ref(false)
const error = ref('')
const search = ref(typeof route.query.search === 'string' ? route.query.search : '')
const page = ref(Number(route.query.page) || 1)
const deletingId = ref<number | null>(null)

// Modal state: `editing` is null when creating a new category.
const modalOpen = ref(false)
const editing = ref<Category | null>(null)
const formKey = ref(0)
const submitting = ref(false)
const formErrors = ref<ValidationErrors>({})
const formMessage = ref('')
const modalTitle = computed(() => (editing.value ? 'Edit category' : 'New category'))

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    result.value = await categoriesApi.list({ page: page.value, search: search.value })
    // Deleting the last item on the last page leaves us past the end.
    if (result.value.data.length === 0 && page.value > 1) {
      page.value = result.value.meta.last_page
      return load()
    }
  } catch {
    error.value = 'Failed to load categories.'
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

watch([search, page], () => {
  router.replace({ query: { ...(search.value && { search: search.value }), ...(page.value > 1 && { page: page.value }) } })
})

function goTo(newPage: number): void {
  page.value = newPage
  load()
}

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
    if (editing.value) await categoriesApi.update(editing.value.id, input)
    else {
      await categoriesApi.create(input)
      page.value = 1
    }
    modalOpen.value = false
    await load()
  } catch (e) {
    if (e instanceof ApiError && e.status === 422) formErrors.value = e.errors
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
  try {
    await categoriesApi.remove(category.id)
    await load()
  } catch {
    error.value = `Failed to delete "${category.name}".`
  } finally {
    deletingId.value = null
  }
}

onMounted(load)
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
                <RouterLink :to="{ name: 'products', query: { category_id: category.id } }">
                  {{ category.products_count ?? 0 }}
                </RouterLink>
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
