import { enquirySubmissionSchema } from '#shared/schemas/enquiry'
import { createEnquiry } from '~~/server/services/enquiry.service'

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, { scope: 'enquiry', limit: 8, windowSeconds: 60 * 60 })
  const input = await readValidatedBodyOrFail(event, enquirySubmissionSchema)

  // Honeypot + minimum fill time act as lightweight spam protection.
  if (input.website) {
    throw createError({ statusCode: 400, statusMessage: 'Submission rejected' })
  }
  if (input.startedAt && Date.now() - input.startedAt < 3000) {
    throw createError({ statusCode: 400, statusMessage: 'Submission rejected', data: { message: 'That was quick. Please review your details and try again.' } })
  }

  const result = await createEnquiry(input, {
    ipHash: hashIp(getClientIp(event)),
    userAgent: getUserAgent(event),
    referrer: getRequestHeader(event, 'referer')?.slice(0, 300),
  })

  setResponseStatus(event, result.duplicate ? 200 : 201)
  return result
})
