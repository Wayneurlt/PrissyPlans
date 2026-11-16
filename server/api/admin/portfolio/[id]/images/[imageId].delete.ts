export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const imageId = getRouterParam(event, 'imageId') || ''
  const prisma = usePrisma()
  const image = await prisma.portfolioImage.findFirst({ where: { id: imageId, projectId: id }, select: { id: true, mediaId: true, project: { select: { coverMediaId: true } } } })
  if (!image) throw createError({ statusCode: 404, statusMessage: 'Image not found' })

  await prisma.portfolioImage.delete({ where: { id: imageId } })
  if (image.project.coverMediaId === image.mediaId) {
    const next = await prisma.portfolioImage.findFirst({ where: { projectId: id }, orderBy: { sortOrder: 'asc' } })
    await prisma.portfolioProject.update({ where: { id }, data: { coverMediaId: next?.mediaId ?? null } })
  }
  await deleteMediaIfOrphaned(image.mediaId)
  return { ok: true }
})
