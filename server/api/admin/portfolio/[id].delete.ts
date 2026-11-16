export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const prisma = usePrisma()
  const project = await prisma.portfolioProject.findUnique({ where: { id }, select: { title: true, coverMediaId: true, images: { select: { mediaId: true } } } })
  if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found' })

  await prisma.portfolioProject.delete({ where: { id } })
  const mediaIds = new Set(project.images.map(i => i.mediaId))
  if (project.coverMediaId) mediaIds.add(project.coverMediaId)
  for (const mediaId of mediaIds) await deleteMediaIfOrphaned(mediaId)

  await logActivity({ actorId: admin.id, action: 'portfolio.deleted', entityType: 'portfolio', entityId: id, summary: `${admin.name} deleted project “${project.title}”` })
  return { ok: true }
})
