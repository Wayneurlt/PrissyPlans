import { listPublishedProjects } from '~~/server/services/catalogue.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = typeof query.category === 'string' && query.category !== 'all' ? query.category : undefined
  const featured = query.featured === '1' || query.featured === 'true'
  const limit = query.limit ? Math.min(Number(query.limit) || 0, 100) || undefined : undefined
  return await listPublishedProjects({ category, featured, limit })
})
