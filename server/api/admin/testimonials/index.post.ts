import { testimonialInputSchema } from '#shared/schemas/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const input = await readValidatedBodyOrFail(event, testimonialInputSchema)
  const testimonial = await usePrisma().testimonial.create({ data: input })
  await logActivity({ actorId: admin.id, action: 'testimonial.created', entityType: 'testimonial', entityId: testimonial.id, summary: `${admin.name} added a testimonial from ${testimonial.clientName}` })
  return { id: testimonial.id }
})
