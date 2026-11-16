import { portfolioInputSchema } from '#shared/schemas/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const input = await readValidatedBodyOrFail(event, portfolioInputSchema)
  const prisma = usePrisma()
  const existing = await prisma.portfolioProject.findUnique({ where: { id }, select: { id: true } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  try {
    const project = await prisma.portfolioProject.update({ where: { id }, data: input })
    await logActivity({ actorId: admin.id, action: 'portfolio.updated', entityType: 'portfolio', entityId: id, summary: `${admin.name} updated project “${project.title}”` })
    return { id: project.id, slug: project.slug, updatedAt: project.updatedAt }
  }
  catch (error) {
    handleUniqueConflict(error)
  }
})
