<script setup lang="ts">
import { reactive } from 'vue'
import type { CategoryInput, ValidationErrors } from '@/types'

const props = withDefaults(
  defineProps<{
    initial?: Partial<CategoryInput>
    errors?: ValidationErrors
    submitting?: boolean
    submitLabel?: string
  }>(),
  { initial: () => ({}), errors: () => ({}), submitting: false, submitLabel: 'Save' },
)

const emit = defineEmits<{ submit: [input: CategoryInput]; cancel: [] }>()

const form = reactive<CategoryInput>({
  name: props.initial.name ?? '',
  description: props.initial.description ?? '',
})

const errorFor = (field: keyof CategoryInput): string | undefined => props.errors[field]?.[0]

function onSubmit(): void {
  emit('submit', { ...form, description: form.description?.trim() || null })
}
</script>

<template>
  <form class="category-form" novalidate @submit.prevent="onSubmit">
    <div class="field" :class="{ 'field--error': errorFor('name') }">
      <label for="category-name">Name</label>
      <input id="category-name" v-model.trim="form.name" type="text" required autofocus />
      <span v-if="errorFor('name')" class="field__error">{{ errorFor('name') }}</span>
    </div>

    <div class="field" :class="{ 'field--error': errorFor('description') }">
      <label for="category-description">Description</label>
      <textarea id="category-description" v-model="form.description" rows="3" />
      <span v-if="errorFor('description')" class="field__error">{{ errorFor('description') }}</span>
    </div>

    <div class="category-form__actions">
      <button type="button" class="btn btn--ghost" @click="emit('cancel')">Cancel</button>
      <button type="submit" class="btn btn--primary" :disabled="submitting">
        {{ submitting ? 'Saving…' : submitLabel }}
      </button>
    </div>
  </form>
</template>

<style scoped lang="scss">
.category-form {
  display: flex;
  flex-direction: column;
  gap: $spacing * 1.25;

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing * 0.75;
    padding-top: $spacing * 1.25;
    border-top: 1px solid $border;
  }
}
</style>
