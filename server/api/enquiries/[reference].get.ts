import { buildEnquiryMessage, buildWhatsAppLink } from '#shared/utils/whatsapp'

/** Minimal, non-personal confirmation data for the thank-you page. */
export default defineEventHandler(async (event) => {
  const reference = (getRouterParam(event, 'reference') || '').toUpperCase()
  if (!/^PPE-\d{4}-[A-Z0-9]{5}$/.test(reference)) {
    throw createError({ statusCode: 404, statusMessage: 'Enquiry not found' })
  }
  const enquiry = await usePrisma().eventEnquiry.findUnique({
    where: { reference },
    select: { reference: true, eventTypeLabel: true, createdAt: true, preferredContact: true },
  })
  if (!enquiry) throw createError({ statusCode: 404, statusMessage: 'Enquiry not found' })
  const number = await getWhatsAppNumber()
  return {
    ...enquiry,
    whatsappUrl: number ? buildWhatsAppLink(number, buildEnquiryMessage({ reference: enquiry.reference })) : '',
  }
})
