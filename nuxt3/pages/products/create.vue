<script setup lang="ts">
useHead({ title: 'New product' })

const { data: categories } = await useCategoryOptions()
const { submitting, errors, message, save } = useProductForm()
</script>

<template>
  <section class="product-page">
    <NuxtLink to="/products" class="product-page__back">← Back to products</NuxtLink>
    <h1>New product</h1>

    <div class="card product-page__card">
      <p v-if="message" class="alert alert--error" role="alert">{{ message }}</p>
      <ProductForm
        :categories="categories"
        :errors="errors"
        :submitting="submitting"
        submit-label="Create product"
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

}
</style>
