export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const rows = await usePrisma().testimonial.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }], include: { photoMedia: true } })
  return rows.map(t => ({ ...t, photoMedia: toPublicMedia(t.photoMedia) }))
})
