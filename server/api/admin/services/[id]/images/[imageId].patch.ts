/** Marks an image as the service cover. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const imageId = getRouterParam(event, 'imageId') || ''
  const body = await readBody(event).catch(() => ({})) as { cover?: boolean }
  const prisma = usePrisma()
  const image = await prisma.serviceImage.findFirst({ where: { id: imageId, serviceId: id } })
  if (!image) throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  if (body.cover) await prisma.service.update({ where: { id }, data: { coverMediaId: image.mediaId } })
  return { ok: true }
})
