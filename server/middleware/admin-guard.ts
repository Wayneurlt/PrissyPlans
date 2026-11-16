/**
 * Server-side protection for the admin area.
 * - /api/admin/**  → 401 JSON when there is no valid session.
 * - /admin/**      → redirect to /admin/login when there is no valid session.
 * Page components additionally use the `admin` route middleware for client-side
 * navigation, but this server check is the one that matters.
 */
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  const isAdminApi = path.startsWith('/api/admin/')
  const isAdminPage = path === '/admin' || path.startsWith('/admin/')
  if (!isAdminApi && !isAdminPage) return

  // Public auth endpoints and the login page.
  if (path === '/api/admin/auth/login' || path === '/admin/login') return

  const session = await getUserSession(event)
  if (session?.user?.id) return

  if (isAdminApi) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const redirectTo = encodeURIComponent(path)
  return sendRedirect(event, `/admin/login?redirect=${redirectTo}`, 302)
})
