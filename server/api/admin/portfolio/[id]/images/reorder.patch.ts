import { reorderSchema } from '#shared/schemas/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const { ids } = await readValidatedBodyOrFail(event, reorderSchema)
  const prisma = usePrisma()
  await prisma.$transaction(ids.map((imageId, index) => prisma.portfolioImage.updateMany({ where: { id: imageId, projectId: id }, data: { sortOrder: index } })))
  return { ok: true }
})
