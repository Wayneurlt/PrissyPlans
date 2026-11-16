export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const service = await usePrisma().service.findUnique({
    where: { id },
    include: { coverMedia: true, category: true, images: { include: { media: true }, orderBy: { sortOrder: 'asc' } } },
  })
  if (!service) throw createError({ statusCode: 404, statusMessage: 'Service not found' })
  return {
    ...service,
    coverMedia: toPublicMedia(service.coverMedia),
    images: service.images.map(i => ({ id: i.id, sortOrder: i.sortOrder, media: toPublicMedia(i.media) })),
  }
})
