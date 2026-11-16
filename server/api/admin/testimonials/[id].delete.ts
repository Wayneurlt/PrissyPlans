export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const prisma = usePrisma()
  const existing = await prisma.testimonial.findUnique({ where: { id }, select: { clientName: true, photoMediaId: true } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Testimonial not found' })
  await prisma.testimonial.delete({ where: { id } })
  if (existing.photoMediaId) await deleteMediaIfOrphaned(existing.photoMediaId)
  await logActivity({ actorId: admin.id, action: 'testimonial.deleted', entityType: 'testimonial', entityId: id, summary: `${admin.name} deleted the testimonial from ${existing.clientName}` })
  return { ok: true }
})
