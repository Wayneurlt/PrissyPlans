export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const enquiry = await usePrisma().eventEnquiry.findUnique({
    where: { id },
    include: {
      services: true,
      images: { include: { media: true } },
      notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      eventCategory: { select: { name: true, slug: true } },
    },
  })
  if (!enquiry) throw createError({ statusCode: 404, statusMessage: 'Enquiry not found' })
  return {
    ...enquiry,
    images: enquiry.images.map(i => ({ id: i.id, media: toPublicMedia(i.media) })),
    notes: enquiry.notes.map(n => ({ id: n.id, type: n.type, body: n.body, followUpAt: n.followUpAt, createdAt: n.createdAt, author: n.author?.name ?? 'System' })),
  }
})
