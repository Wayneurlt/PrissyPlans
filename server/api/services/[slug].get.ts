import { getPublishedService } from '~~/server/services/catalogue.service'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''
  const service = await getPublishedService(slug)
  if (!service) throw createError({ statusCode: 404, statusMessage: 'Service not found' })
  return service
})
