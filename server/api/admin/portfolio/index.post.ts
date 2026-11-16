import { portfolioInputSchema } from '#shared/schemas/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const input = await readValidatedBodyOrFail(event, portfolioInputSchema)
  try {
    const project = await usePrisma().portfolioProject.create({ data: input })
    await logActivity({ actorId: admin.id, action: 'portfolio.created', entityType: 'portfolio', entityId: project.id, summary: `${admin.name} created project “${project.title}”` })
    return { id: project.id, slug: project.slug }
  }
  catch (error) {
    handleUniqueConflict(error)
  }
})
