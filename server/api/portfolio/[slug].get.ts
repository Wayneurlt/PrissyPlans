import { getPublishedProject } from '~~/server/services/catalogue.service'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''
  const result = await getPublishedProject(slug)
  if (!result) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  return result
})
