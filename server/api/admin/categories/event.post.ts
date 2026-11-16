import { eventCategoryInputSchema } from '#shared/schemas/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const input = await readValidatedBodyOrFail(event, eventCategoryInputSchema)
  try {
    const category = await usePrisma().eventCategory.create({ data: input })
    return { id: category.id }
  }
  catch (error) {
    handleUniqueConflict(error)
  }
})
