declare module '#app' {
  interface PageMeta {
    /** Page is only for signed-out visitors (e.g. login). Every other page requires auth. */
    guestOnly?: boolean
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchUser } = useAuth()
  await fetchUser()

  if (to.meta.guestOnly) {
    if (isAuthenticated.value) return navigateTo('/products')
    return
  }

  if (!isAuthenticated.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
