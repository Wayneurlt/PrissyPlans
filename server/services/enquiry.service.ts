import { Prisma } from '~~/prisma/generated/client'
import type { ContactMessage, EnquirySubmission } from '#shared/schemas/enquiry'
import { ENQUIRY_SERVICES, EVENT_TYPES } from '#shared/config/enquiry'
import { buildEnquiryMessage, buildWhatsAppLink } from '#shared/utils/whatsapp'
import { notifyAdminOfContactMessage, notifyAdminOfEnquiry, sendClientConfirmation } from './notifications.service'

export interface SubmissionMeta {
  ipHash?: string
  userAgent?: string
  referrer?: string
}

export interface EnquiryResult {
  id: string
  reference: string
  duplicate: boolean
  whatsappUrl: string
}

const enquiryInclude = { services: true, images: { include: { media: true } } } satisfies Prisma.EventEnquiryInclude

async function withUniqueReference<T>(create: (reference: string) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await create(generateEnquiryReference())
    }
    catch (error) {
      const isRefConflict = error instanceof Prisma.PrismaClientKnownRequestError
        && error.code === 'P2002'
        && String((error.meta as { target?: string[] })?.target ?? '').includes('reference')
      if (!isRefConflict) throw error
    }
  }
  throw new Error('Could not generate a unique enquiry reference')
}

async function buildWhatsAppUrl(reference: string, name: string): Promise<string> {
  const number = await getWhatsAppNumber()
  if (!number) return ''
  return buildWhatsAppLink(number, buildEnquiryMessage({ reference, name }))
}

/** Persists a multi-step enquiry, attaches uploaded images and sends notifications. Idempotent on submissionKey. */
export async function createEnquiry(input: EnquirySubmission, meta: SubmissionMeta): Promise<EnquiryResult> {
  const prisma = usePrisma()

  const existing = await prisma.eventEnquiry.findUnique({ where: { submissionKey: input.submissionKey } })
  if (existing) {
    return { id: existing.id, reference: existing.reference, duplicate: true, whatsappUrl: await buildWhatsAppUrl(existing.reference, existing.fullName) }
  }

  const eventType = EVENT_TYPES.find(t => t.key === input.eventType)!
  const category = eventType.categorySlug
    ? await prisma.eventCategory.findUnique({ where: { slug: eventType.categorySlug }, select: { id: true } })
    : null

  const budgetRanges = await getBudgetRanges()
  const budget = budgetRanges.find(b => b.key === input.budget)
  if (!budget) {
    throw createError({ statusCode: 422, statusMessage: 'Validation failed', data: { fieldErrors: { budget: 'Please choose a budget range' } } })
  }

  const serviceSlugs = ENQUIRY_SERVICES.filter(s => s.serviceSlug).map(s => s.serviceSlug as string)
  const serviceRows = await prisma.service.findMany({ where: { slug: { in: serviceSlugs } }, select: { id: true, slug: true } })
  const servicesData = input.services.map((key) => {
    const def = ENQUIRY_SERVICES.find(s => s.key === key)!
    const linked = def.serviceSlug ? serviceRows.find(r => r.slug === def.serviceSlug) : undefined
    const label = key === 'other' && input.servicesOther ? `Other: ${input.servicesOther}` : def.label
    return { key, label, serviceId: linked?.id ?? null }
  })

  // Only attach images that were uploaded for an enquiry, recently, and are not already attached.
  const imageIds = input.imageIds?.length
    ? (await prisma.mediaAsset.findMany({
        where: {
          id: { in: input.imageIds },
          folder: { contains: 'enquiries' },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          enquiryImages: { none: {} },
        },
        select: { id: true },
      })).map(m => m.id)
    : []

  const enquiry = await withUniqueReference(reference => prisma.eventEnquiry.create({
    data: {
      reference,
      submissionKey: input.submissionKey,
      eventTypeLabel: eventType.label,
      eventTypeOther: input.eventTypeOther ?? null,
      eventCategoryId: category?.id ?? null,
      eventDate: input.eventDate ? new Date(input.eventDate) : null,
      dateIsFlexible: input.dateIsFlexible,
      location: input.location ?? null,
      venue: input.venue ?? null,
      venueNotConfirmed: input.venueNotConfirmed,
      guestCount: input.guestCount ?? null,
      budgetKey: budget.key,
      budgetLabel: budget.label,
      theme: input.theme ?? null,
      colours: input.colours ?? null,
      vision: input.vision,
      additionalRequests: input.additionalRequests ?? null,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email.toLowerCase(),
      preferredContact: input.preferredContact as 'WHATSAPP' | 'PHONE' | 'EMAIL',
      sourcePage: input.sourcePage ?? null,
      referrer: meta.referrer ?? null,
      ipHash: meta.ipHash ?? null,
      userAgent: meta.userAgent ?? null,
      services: { create: servicesData },
      images: { create: imageIds.map(mediaId => ({ mediaId })) },
    },
    include: enquiryInclude,
  }))

  await logActivity({ action: 'enquiry.created', entityType: 'enquiry', entityId: enquiry.id, summary: `New ${enquiry.eventTypeLabel.toLowerCase()} enquiry ${enquiry.reference} from ${enquiry.fullName}` })

  // Notifications must never block or fail the submission.
  const [adminSent, clientSent] = await Promise.all([
    notifyAdminOfEnquiry(enquiry, enquiry.images.length).catch((error) => { console.error('[enquiry] admin notification failed', error); return false }),
    sendClientConfirmation(enquiry).catch((error) => { console.error('[enquiry] client confirmation failed', error); return false }),
  ])
  await prisma.eventEnquiry.update({
    where: { id: enquiry.id },
    data: { adminNotifiedAt: adminSent ? new Date() : null, clientNotifiedAt: clientSent ? new Date() : null },
  }).catch(() => {})

  return { id: enquiry.id, reference: enquiry.reference, duplicate: false, whatsappUrl: await buildWhatsAppUrl(enquiry.reference, enquiry.fullName) }
}

/** Stores a simple contact-page message as a lightweight enquiry so all leads live in one place. */
export async function createContactMessage(input: ContactMessage, meta: SubmissionMeta): Promise<EnquiryResult> {
  const prisma = usePrisma()
  const existing = await prisma.eventEnquiry.findUnique({ where: { submissionKey: input.submissionKey } })
  if (existing) {
    return { id: existing.id, reference: existing.reference, duplicate: true, whatsappUrl: await buildWhatsAppUrl(existing.reference, existing.fullName) }
  }

  const enquiry = await withUniqueReference(reference => prisma.eventEnquiry.create({
    data: {
      reference,
      submissionKey: input.submissionKey,
      eventTypeLabel: 'General enquiry',
      eventTypeOther: input.eventType ?? null,
      dateIsFlexible: true,
      venueNotConfirmed: true,
      vision: input.message,
      fullName: input.fullName,
      phone: input.phone ?? '',
      email: input.email.toLowerCase(),
      preferredContact: input.phone ? 'WHATSAPP' : 'EMAIL',
      sourcePage: '/contact',
      referrer: meta.referrer ?? null,
      ipHash: meta.ipHash ?? null,
      userAgent: meta.userAgent ?? null,
    },
    include: enquiryInclude,
  }))

  await logActivity({ action: 'enquiry.created', entityType: 'enquiry', entityId: enquiry.id, summary: `New contact message ${enquiry.reference} from ${enquiry.fullName}` })
  const adminSent = await notifyAdminOfContactMessage(enquiry).catch(() => false)
  await prisma.eventEnquiry.update({ where: { id: enquiry.id }, data: { adminNotifiedAt: adminSent ? new Date() : null } }).catch(() => {})

  return { id: enquiry.id, reference: enquiry.reference, duplicate: false, whatsappUrl: await buildWhatsAppUrl(enquiry.reference, enquiry.fullName) }
}
