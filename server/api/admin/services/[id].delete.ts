export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const prisma = usePrisma()
  const service = await prisma.service.findUnique({ where: { id }, select: { name: true, coverMediaId: true, images: { select: { mediaId: true } } } })
  if (!service) throw createError({ statusCode: 404, statusMessage: 'Service not found' })

  await prisma.service.delete({ where: { id } })
  const mediaIds = new Set(service.images.map(i => i.mediaId))
  if (service.coverMediaId) mediaIds.add(service.coverMediaId)
  for (const mediaId of mediaIds) await deleteMediaIfOrphaned(mediaId)

  await logActivity({ actorId: admin.id, action: 'service.deleted', entityType: 'service', entityId: id, summary: `${admin.name} deleted service “${service.name}”` })
  return { ok: true }
})
