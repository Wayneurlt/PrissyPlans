import { contactMessageSchema } from '#shared/schemas/enquiry'
import { createContactMessage } from '~~/server/services/enquiry.service'

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, { scope: 'contact', limit: 6, windowSeconds: 60 * 60 })
  const input = await readValidatedBodyOrFail(event, contactMessageSchema)
  if (input.website) throw createError({ statusCode: 400, statusMessage: 'Submission rejected' })
  const result = await createContactMessage(input, {
    ipHash: hashIp(getClientIp(event)),
    userAgent: getUserAgent(event),
    referrer: getRequestHeader(event, 'referer')?.slice(0, 300),
  })
  setResponseStatus(event, result.duplicate ? 200 : 201)
  return result
})
