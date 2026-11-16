import { reorderSchema } from '#shared/schemas/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const { ids } = await readValidatedBodyOrFail(event, reorderSchema)
  const prisma = usePrisma()
  await prisma.$transaction(ids.map((imageId, index) => prisma.serviceImage.updateMany({ where: { id: imageId, serviceId: id }, data: { sortOrder: index } })))
  return { ok: true }
})
