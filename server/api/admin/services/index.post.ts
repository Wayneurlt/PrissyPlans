import { serviceInputSchema } from '#shared/schemas/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const input = await readValidatedBodyOrFail(event, serviceInputSchema)
  try {
    const service = await usePrisma().service.create({ data: input })
    await logActivity({ actorId: admin.id, action: 'service.created', entityType: 'service', entityId: service.id, summary: `${admin.name} created service “${service.name}”` })
    return { id: service.id, slug: service.slug }
  }
  catch (error) {
    handleUniqueConflict(error)
  }
})
