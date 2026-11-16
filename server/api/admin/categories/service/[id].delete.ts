export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const prisma = usePrisma()
  const existing = await prisma.serviceCategory.findUnique({ where: { id }, select: { id: true } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  await prisma.serviceCategory.delete({ where: { id } })
  return { ok: true }
})
