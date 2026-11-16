export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const rows = await usePrisma().service.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { coverMedia: true, category: { select: { id: true, name: true, slug: true } }, _count: { select: { images: true } } },
  })
  return rows.map(s => ({
    id: s.id, name: s.name, slug: s.slug, tagline: s.tagline, summary: s.summary, category: s.category,
    isPublished: s.isPublished, isFeatured: s.isFeatured, sortOrder: s.sortOrder,
    coverMedia: toPublicMedia(s.coverMedia), imageCount: s._count.images, updatedAt: s.updatedAt,
  }))
})
