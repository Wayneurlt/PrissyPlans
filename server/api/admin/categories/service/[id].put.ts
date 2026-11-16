import { serviceCategoryInputSchema } from '#shared/schemas/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const input = await readValidatedBodyOrFail(event, serviceCategoryInputSchema)
  try {
    const category = await usePrisma().serviceCategory.update({ where: { id }, data: input })
    return { id: category.id }
  }
  catch (error) {
    handleUniqueConflict(error)
  }
})
