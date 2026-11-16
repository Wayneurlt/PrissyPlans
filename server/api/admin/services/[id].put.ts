import { serviceInputSchema } from '#shared/schemas/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const input = await readValidatedBodyOrFail(event, serviceInputSchema)
  const prisma = usePrisma()
  const existing = await prisma.service.findUnique({ where: { id }, select: { id: true } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Service not found' })
  try {
    const service = await prisma.service.update({ where: { id }, data: input })
    await logActivity({ actorId: admin.id, action: 'service.updated', entityType: 'service', entityId: id, summary: `${admin.name} updated service “${service.name}”` })
    return { id: service.id, slug: service.slug, updatedAt: service.updatedAt }
  }
  catch (error) {
    handleUniqueConflict(error)
  }
})
