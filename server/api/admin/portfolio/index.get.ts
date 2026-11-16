export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const rows = await usePrisma().portfolioProject.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: { coverMedia: true, category: { select: { id: true, name: true, slug: true } }, _count: { select: { images: true } } },
  })
  return rows.map(p => ({
    id: p.id, title: p.title, slug: p.slug, summary: p.summary, category: p.category, eventDate: p.eventDate,
    isPublished: p.isPublished, isFeatured: p.isFeatured, isSample: p.isSample, sortOrder: p.sortOrder,
    coverMedia: toPublicMedia(p.coverMedia), imageCount: p._count.images, updatedAt: p.updatedAt,
  }))
})
