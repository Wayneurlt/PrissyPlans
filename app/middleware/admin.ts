/**
 * Client-side companion to the server middleware: keeps SPA navigation honest.
 * Real protection happens on the server (server/middleware/admin-guard.ts + requireAdmin).
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetch } = useUserSession()
  if (!loggedIn.value) await fetch()
  if (!loggedIn.value) {
    return navigateTo({ path: '/admin/login', query: { redirect: to.fullPath } })
  }
})
