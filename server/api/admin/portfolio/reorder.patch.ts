import { reorderSchema } from '#shared/schemas/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { ids } = await readValidatedBodyOrFail(event, reorderSchema)
  const prisma = usePrisma()
  await prisma.$transaction(ids.map((id, index) => prisma.portfolioProject.update({ where: { id }, data: { sortOrder: index } })))
  return { ok: true }
})
