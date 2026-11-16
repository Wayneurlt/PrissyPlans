import { testimonialInputSchema } from '#shared/schemas/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const input = await readValidatedBodyOrFail(event, testimonialInputSchema)
  const prisma = usePrisma()
  const existing = await prisma.testimonial.findUnique({ where: { id }, select: { id: true } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Testimonial not found' })
  const testimonial = await prisma.testimonial.update({ where: { id }, data: input })
  await logActivity({ actorId: admin.id, action: 'testimonial.updated', entityType: 'testimonial', entityId: id, summary: `${admin.name} updated the testimonial from ${testimonial.clientName}` })
  return { id: testimonial.id }
})
