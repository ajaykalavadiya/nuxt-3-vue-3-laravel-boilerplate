<script setup lang="ts">
import { reactive } from 'vue'
import type { Category, ProductInput, ValidationErrors } from '@/types'

const props = withDefaults(
  defineProps<{
    initial?: Partial<ProductInput>
    categories?: Category[]
    errors?: ValidationErrors
    submitting?: boolean
    submitLabel?: string
  }>(),
  { initial: () => ({}), categories: () => [], errors: () => ({}), submitting: false, submitLabel: 'Save' },
)

const emit = defineEmits<{ submit: [input: ProductInput]; cancel: [] }>()

const form = reactive<ProductInput>({
  category_id: props.initial.category_id ?? null,
  name: props.initial.name ?? '',
  sku: props.initial.sku ?? '',
  description: props.initial.description ?? '',
  price: props.initial.price ?? 0,
  stock: props.initial.stock ?? 0,
  is_active: props.initial.is_active ?? true,
})

const errorFor = (field: keyof ProductInput): string | undefined => props.errors[field]?.[0]

function onSubmit(): void {
  emit('submit', { ...form, description: form.description?.trim() || null })
}
</script>

<template>
  <form class="product-form" novalidate @submit.prevent="onSubmit">
    <div class="product-form__grid">
      <div class="field" :class="{ 'field--error': errorFor('name') }">
        <label for="name">Name</label>
        <input id="name" v-model.trim="form.name" type="text" required />
        <span v-if="errorFor('name')" class="field__error">{{ errorFor('name') }}</span>
      </div>

      <div class="field" :class="{ 'field--error': errorFor('sku') }">
        <label for="sku">SKU</label>
        <input id="sku" v-model.trim="form.sku" type="text" required />
        <span v-if="errorFor('sku')" class="field__error">{{ errorFor('sku') }}</span>
      </div>

      <div class="field product-form__full" :class="{ 'field--error': errorFor('category_id') }">
        <label for="category_id">Category</label>
        <select id="category_id" v-model="form.category_id">
          <option :value="null">Uncategorised</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
        <span v-if="errorFor('category_id')" class="field__error">{{ errorFor('category_id') }}</span>
      </div>

      <div class="field" :class="{ 'field--error': errorFor('price') }">
        <label for="price">Price (USD)</label>
        <input id="price" v-model.number="form.price" type="number" min="0" step="0.01" required />
        <span v-if="errorFor('price')" class="field__error">{{ errorFor('price') }}</span>
      </div>

      <div class="field" :class="{ 'field--error': errorFor('stock') }">
        <label for="stock">Stock</label>
        <input id="stock" v-model.number="form.stock" type="number" min="0" step="1" required />
        <span v-if="errorFor('stock')" class="field__error">{{ errorFor('stock') }}</span>
      </div>

      <div class="field product-form__full" :class="{ 'field--error': errorFor('description') }">
        <label for="description">Description</label>
        <textarea id="description" v-model="form.description" rows="4" />
        <span v-if="errorFor('description')" class="field__error">{{ errorFor('description') }}</span>
      </div>

      <label class="toggle product-form__full">
        <input v-model="form.is_active" type="checkbox" />
        <span class="toggle__track" aria-hidden="true" />
        <span>Active — visible to customers</span>
      </label>
    </div>

    <div class="product-form__actions">
      <button type="button" class="btn btn--ghost" @click="emit('cancel')">Cancel</button>
      <button type="submit" class="btn btn--primary" :disabled="submitting">
        {{ submitting ? 'Saving…' : submitLabel }}
      </button>
    </div>
  </form>
</template>

<style scoped lang="scss">
.product-form {
  &__grid {
    display: grid;
    gap: $spacing * 1.25;

    @include up(sm) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__full {
    grid-column: 1 / -1;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing * 0.75;
    margin-top: $spacing * 1.5;
    padding-top: $spacing * 1.25;
    border-top: 1px solid $border;
  }
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: $spacing * 0.75;
  font-size: 0.9rem;
  cursor: pointer;

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  &__track {
    position: relative;
    flex-shrink: 0;
    width: 40px;
    height: 22px;
    border-radius: 999px;
    background: $border;
    transition: background $transition;

    &::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: $surface;
      box-shadow: $shadow;
      transition: transform $transition;
    }
  }

  input:checked + &__track {
    background: $primary;

    &::after {
      transform: translateX(18px);
    }
  }

  input:focus-visible + &__track {
    @include focus-ring;
  }
}
</style>
