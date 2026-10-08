<script setup lang="ts">
defineProps<{ active: boolean }>()
</script>

<template>
  <span class="badge" :class="active ? 'badge--active' : 'badge--inactive'">
    {{ active ? 'Active' : 'Inactive' }}
  </span>
</template>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &--active {
    background: $primary-soft;
    color: $primary-dark;
  }

  &--inactive {
    background: $border;
    color: $text-muted;
  }
}
</style>
