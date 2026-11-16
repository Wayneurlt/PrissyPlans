export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const project = await usePrisma().portfolioProject.findUnique({
    where: { id },
    include: { coverMedia: true, category: true, images: { include: { media: true }, orderBy: { sortOrder: 'asc' } } },
  })
  if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  return {
    ...project,
    coverMedia: toPublicMedia(project.coverMedia),
    images: project.images.map(i => ({ id: i.id, caption: i.caption, sortOrder: i.sortOrder, media: toPublicMedia(i.media) })),
  }
})
