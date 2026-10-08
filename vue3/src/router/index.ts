import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
    title?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true, title: 'Sign in' },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: { name: 'products' } },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/ProductListView.vue'),
          meta: { title: 'Products' },
        },
        {
          path: 'products/new',
          name: 'product-create',
          component: () => import('@/views/ProductFormView.vue'),
          meta: { title: 'New product' },
        },
        {
          path: 'products/:id(\\d+)/edit',
          name: 'product-edit',
          component: () => import('@/views/ProductFormView.vue'),
          props: (route) => ({ id: Number(route.params.id) }),
          meta: { title: 'Edit product' },
        },
        {
          path: 'categories',
          name: 'categories',
          component: () => import('@/views/CategoryListView.vue'),
          meta: { title: 'Categories' },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.fetchUser()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'products' }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Acme SaaS` : 'Acme SaaS'
})

export default router
