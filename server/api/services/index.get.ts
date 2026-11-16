import { listPublishedServices } from '~~/server/services/catalogue.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const featured = query.featured === '1' || query.featured === 'true'
  const limit = query.limit ? Math.min(Number(query.limit) || 0, 50) || undefined : undefined
  return await listPublishedServices({ featured, limit })
})
