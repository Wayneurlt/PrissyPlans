import { ADMIN_UPLOAD } from '#shared/config/enquiry'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const prisma = usePrisma()
  const project = await prisma.portfolioProject.findUnique({ where: { id }, select: { id: true, slug: true, title: true, coverMediaId: true, _count: { select: { images: true } } } })
  if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found' })

  const files = await readImageUploads(event, ADMIN_UPLOAD)
  const assets = await storeUploadedImages(files, { folder: `portfolio/${project.slug}`, uploadedById: admin.id, altText: project.title })

  let order = project._count.images
  const created = []
  for (const asset of assets) {
    created.push(await prisma.portfolioImage.create({ data: { projectId: id, mediaId: asset.id, sortOrder: order++ }, include: { media: true } }))
  }
  if (!project.coverMediaId && assets[0]) {
    await prisma.portfolioProject.update({ where: { id }, data: { coverMediaId: assets[0].id } })
  }
  await logActivity({ actorId: admin.id, action: 'portfolio.images', entityType: 'portfolio', entityId: id, summary: `${admin.name} uploaded ${assets.length} image(s) to “${project.title}”` })
  return created.map(i => ({ id: i.id, caption: i.caption, sortOrder: i.sortOrder, media: toPublicMedia(i.media) }))
})
