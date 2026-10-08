<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError } from '@/lib/http'
import { useAuthStore } from '@/stores/auth'
import type { ValidationErrors } from '@/types'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: 'demo@example.com', password: 'password' })
const errors = ref<ValidationErrors>({})
const message = ref('')
const submitting = ref(false)

/** Only follow same-origin relative redirects to avoid open-redirects. */
function redirectTarget(): string {
  const target = route.query.redirect
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : '/products'
}

async function submit(): Promise<void> {
  submitting.value = true
  errors.value = {}
  message.value = ''
  try {
    await auth.login(form.email, form.password)
    await router.replace(redirectTarget())
  } catch (e) {
    if (e instanceof ApiError && e.status === 422) errors.value = e.errors
    else if (e instanceof ApiError && e.status === 429) message.value = 'Too many attempts. Try again in a minute.'
    else message.value = 'Could not reach the server. Is the API running?'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login">
    <div class="login__card card">
      <div class="login__header">
        <span class="login__logo">A</span>
        <h1>Welcome back</h1>
        <p>Sign in to your Acme SaaS workspace</p>
      </div>

      <p v-if="message" class="alert alert--error" role="alert">{{ message }}</p>

      <form class="login__form" novalidate @submit.prevent="submit">
        <div class="field" :class="{ 'field--error': errors.email }">
          <label for="email">Email</label>
          <input id="email" v-model.trim="form.email" type="email" autocomplete="email" required />
          <span v-if="errors.email" class="field__error">{{ errors.email[0] }}</span>
        </div>

        <div class="field" :class="{ 'field--error': errors.password }">
          <label for="password">Password</label>
          <input id="password" v-model="form.password" type="password" autocomplete="current-password" required />
          <span v-if="errors.password" class="field__error">{{ errors.password[0] }}</span>
        </div>

        <button type="submit" class="btn btn--primary btn--block" :disabled="submitting">
          {{ submitting ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p class="login__hint">Demo: <code>demo@example.com</code> / <code>password</code></p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login {
  @include flex-center;
  min-height: 100vh;
  padding: $spacing;
  background: radial-gradient(circle at top, $primary-soft, transparent 60%), $background;

  &__card {
    width: 100%;
    max-width: 400px;
    padding: $spacing * 2;
    box-shadow: $shadow-lg;
  }

  &__header {
    margin-bottom: $spacing * 1.5;
    text-align: center;

    h1 {
      font-size: 1.5rem;
    }

    p {
      margin: 0.4rem 0 0;
      color: $text-muted;
      font-size: 0.9rem;
    }
  }

  &__logo {
    @include flex-center;
    width: 44px;
    height: 44px;
    margin: 0 auto $spacing;
    border-radius: $radius-lg;
    background: $primary;
    color: #fff;
    font-size: 1.25rem;
    font-weight: 700;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $spacing;
    margin-top: $spacing;
  }

  &__hint {
    margin: $spacing * 1.5 0 0;
    color: $text-muted;
    font-size: 0.8rem;
    text-align: center;
  }
}
</style>
