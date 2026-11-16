import { listPublishedTestimonials } from '~~/server/services/catalogue.service'

export default defineEventHandler(async () => {
  return await listPublishedTestimonials()
})
