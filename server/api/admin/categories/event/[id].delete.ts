export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const prisma = usePrisma()
  const existing = await prisma.eventCategory.findUnique({ where: { id }, include: { _count: { select: { projects: true } } } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  if (existing._count.projects > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Category in use', data: { message: 'Move or delete the projects in this category first.' } })
  }
  await prisma.eventCategory.delete({ where: { id } })
  return { ok: true }
})
