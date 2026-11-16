import { ADMIN_UPLOAD } from '#shared/config/enquiry'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const prisma = usePrisma()
  const service = await prisma.service.findUnique({ where: { id }, select: { id: true, slug: true, name: true, coverMediaId: true, _count: { select: { images: true } } } })
  if (!service) throw createError({ statusCode: 404, statusMessage: 'Service not found' })

  const files = await readImageUploads(event, ADMIN_UPLOAD)
  const assets = await storeUploadedImages(files, { folder: `services/${service.slug}`, uploadedById: admin.id, altText: service.name })

  let order = service._count.images
  const created = []
  for (const asset of assets) {
    created.push(await prisma.serviceImage.create({ data: { serviceId: id, mediaId: asset.id, sortOrder: order++ }, include: { media: true } }))
  }
  if (!service.coverMediaId && assets[0]) {
    await prisma.service.update({ where: { id }, data: { coverMediaId: assets[0].id } })
  }
  await logActivity({ actorId: admin.id, action: 'service.images', entityType: 'service', entityId: id, summary: `${admin.name} uploaded ${assets.length} image(s) to “${service.name}”` })
  return created.map(i => ({ id: i.id, sortOrder: i.sortOrder, media: toPublicMedia(i.media) }))
})
