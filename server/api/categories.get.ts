import { listPortfolioCategories } from '~~/server/services/catalogue.service'

export default defineEventHandler(async () => {
  return await listPortfolioCategories()
})
