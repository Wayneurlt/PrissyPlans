export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  await deleteMediaIfOrphaned(id)
  return { ok: true }
})
