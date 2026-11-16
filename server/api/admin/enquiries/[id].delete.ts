export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const prisma = usePrisma()
  const existing = await prisma.eventEnquiry.findUnique({ where: { id }, select: { reference: true, images: { select: { mediaId: true } } } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Enquiry not found' })

  await prisma.eventEnquiry.delete({ where: { id } })
  for (const image of existing.images) await deleteMediaIfOrphaned(image.mediaId)
  await logActivity({ actorId: admin.id, action: 'enquiry.deleted', entityType: 'enquiry', entityId: id, summary: `${admin.name} deleted enquiry ${existing.reference}` })
  return { ok: true }
})
