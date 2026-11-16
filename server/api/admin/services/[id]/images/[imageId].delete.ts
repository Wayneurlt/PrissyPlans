export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const imageId = getRouterParam(event, 'imageId') || ''
  const prisma = usePrisma()
  const image = await prisma.serviceImage.findFirst({ where: { id: imageId, serviceId: id }, select: { id: true, mediaId: true, service: { select: { coverMediaId: true } } } })
  if (!image) throw createError({ statusCode: 404, statusMessage: 'Image not found' })

  await prisma.serviceImage.delete({ where: { id: imageId } })
  if (image.service.coverMediaId === image.mediaId) {
    const next = await prisma.serviceImage.findFirst({ where: { serviceId: id }, orderBy: { sortOrder: 'asc' } })
    await prisma.service.update({ where: { id }, data: { coverMediaId: next?.mediaId ?? null } })
  }
  await deleteMediaIfOrphaned(image.mediaId)
  return { ok: true }
})
