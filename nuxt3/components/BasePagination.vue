<script setup lang="ts">
import type { PaginationMeta } from '@/types'

defineProps<{ meta: PaginationMeta }>()
const emit = defineEmits<{ change: [page: number] }>()
</script>

<template>
  <nav class="pagination" aria-label="Pagination">
    <span class="pagination__info">
      <template v-if="meta.total">Showing {{ meta.from }}–{{ meta.to }} of {{ meta.total }}</template>
      <template v-else>No results</template>
    </span>
    <div class="pagination__controls">
      <button
        class="btn btn--ghost btn--sm"
        :disabled="meta.current_page <= 1"
        @click="emit('change', meta.current_page - 1)"
      >
        Previous
      </button>
      <span class="pagination__page">{{ meta.current_page }} / {{ meta.last_page }}</span>
      <button
        class="btn btn--ghost btn--sm"
        :disabled="meta.current_page >= meta.last_page"
        @click="emit('change', meta.current_page + 1)"
      >
        Next
      </button>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: $spacing * 0.75;
  padding: $spacing;
  border-top: 1px solid $border;
  font-size: 0.85rem;
  color: $text-muted;

  &__controls {
    display: flex;
    align-items: center;
    gap: $spacing * 0.5;
  }

  &__page {
    min-width: 4rem;
    text-align: center;
  }
}
</style>
