<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

// Off-canvas state for small screens; the sidebar is always visible from `lg` up.
const sidebarOpen = ref(false)
watch(() => route.fullPath, () => (sidebarOpen.value = false))

const navItems = [
  { name: 'products', path: '/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { name: 'categories', path: '/categories', label: 'Categories', icon: 'M7 7h.01M7 3h5a2 2 0 011.41.59l7 7a2 2 0 010 2.82l-7 7a2 2 0 01-2.82 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
]

const initials = computed(() =>
  (auth.user?.name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)

async function logout(): Promise<void> {
  await auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="app-layout">
    <header class="topbar">
      <button class="topbar__toggle" aria-label="Open menu" :aria-expanded="sidebarOpen" @click="sidebarOpen = true">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div class="topbar__user">
        <span class="avatar" :title="auth.user?.email">{{ initials }}</span>
        <span class="topbar__name">{{ auth.user?.name }}</span>
        <button class="btn btn--ghost btn--sm" @click="logout">Log out</button>
      </div>
    </header>

    <div v-if="sidebarOpen" class="sidebar-backdrop" @click="sidebarOpen = false" />

    <aside class="sidebar" :class="{ 'is-open': sidebarOpen }">
      <RouterLink to="/" class="brand sidebar__brand">
        <span class="brand__logo">A</span>
        Acme SaaS
      </RouterLink>

      <nav class="sidebar__nav" aria-label="Main">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="sidebar__link"
          :class="{ 'is-active': route.path.startsWith(item.path) }"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path :d="item.icon" />
          </svg>
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <main class="app-layout__main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped lang="scss">
$sidebar-width: 240px;

.app-layout {
  min-height: 100vh;

  // Desktop: sidebar is a real grid column (in flow), not a fixed overlay.
  @include up(lg) {
    display: grid;
    grid-template-columns: $sidebar-width minmax(0, 1fr);
    grid-template-rows: auto 1fr;
    grid-template-areas:
      'sidebar topbar'
      'sidebar main';
  }
}

svg path {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: $spacing * 0.75;
  height: 60px;
  padding: 0 $spacing;
  background: $surface;
  border-bottom: 1px solid $border;

  @include up(lg) {
    grid-area: topbar;
    padding: 0 $spacing * 2;
  }

  &__toggle {
    @include flex-center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: $radius;
    background: transparent;
    color: $text;
    cursor: pointer;

    &:hover {
      background: $background;
    }

    &:focus-visible {
      @include focus-ring;
    }
  }

  // The sidebar is always visible on large screens.
  &__toggle {
    @include up(lg) {
      display: none;
    }
  }

  &__user {
    display: flex;
    align-items: center;
    gap: $spacing * 0.6;
    margin-left: auto;
  }

  &__name {
    display: none;
    font-size: 0.9rem;

    @include up(md) {
      display: inline;
    }
  }
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(15, 23, 42, 0.45);

  @include up(lg) {
    display: none;
  }
}

.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  width: $sidebar-width;
  padding: $spacing;
  background: $surface;
  border-right: 1px solid $border;
  transform: translateX(-100%);
  transition: transform $transition;

  &.is-open {
    transform: none;
    box-shadow: $shadow-lg;
  }

  @include up(lg) {
    grid-area: sidebar;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    transform: none;
    transition: none;
  }

  &__brand {
    padding: 0.25rem 0.5rem $spacing * 1.25;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.55rem 0.75rem;
    border-radius: $radius;
    color: $text-muted;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    transition: background $transition, color $transition;

    &:hover {
      background: $background;
      color: $text;
    }

    &:focus-visible {
      @include focus-ring;
    }

    &.is-active {
      background: $primary-soft;
      color: $primary-dark;
      font-weight: 600;
    }
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: $text;
  font-weight: 700;
  text-decoration: none;

  &__logo {
    @include flex-center;
    width: 28px;
    height: 28px;
    border-radius: $radius;
    background: $primary;
    color: #fff;
  }
}

.avatar {
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: $primary-soft;
  color: $primary-dark;
  font-size: 0.75rem;
  font-weight: 700;
}

.app-layout__main {
  max-width: 1100px;
  margin: 0 auto;
  padding: $spacing * 2 $spacing;

  @include up(lg) {
    grid-area: main;
    width: 100%;
    padding: $spacing * 2;
  }
}
</style>
