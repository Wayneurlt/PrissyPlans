import { z } from 'zod'
import { CONTACT_METHODS, ENQUIRY_SERVICES, EVENT_TYPES } from '#shared/config/enquiry'

const eventTypeKeys = EVENT_TYPES.map(t => t.key) as [string, ...string[]]
const serviceKeys = ENQUIRY_SERVICES.map(s => s.key) as [string, ...string[]]
const contactKeys = CONTACT_METHODS.map(c => c.key) as [string, ...string[]]

const optionalText = (max: number) => z.string().trim().max(max, `Please keep this under ${max} characters`).optional().or(z.literal('')).transform(v => v || undefined)

const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Please enter a valid phone number')
  .max(20, 'Please enter a valid phone number')
  .regex(/^[+\d][\d\s()-]{6,}$/, 'Please enter a valid phone number')

export const enquiryStepSchemas = {
  eventType: z.object({
    eventType: z.enum(eventTypeKeys, { message: 'Please choose an event type' }),
    eventTypeOther: optionalText(80),
  }).superRefine((data, ctx) => {
    if (data.eventType === 'other' && !data.eventTypeOther) {
      ctx.addIssue({ code: 'custom', path: ['eventTypeOther'], message: 'Tell us what kind of event you are planning' })
    }
  }),

  details: z.object({
    eventDate: z.string().trim().optional().or(z.literal('')).transform(v => v || undefined),
    dateIsFlexible: z.boolean().default(false),
    location: optionalText(120),
    venue: optionalText(120),
    venueNotConfirmed: z.boolean().default(false),
    guestCount: z.union([z.number(), z.string()]).optional().transform((v) => {
      if (v === undefined || v === '' || v === null) return undefined
      const n = typeof v === 'number' ? v : Number.parseInt(v, 10)
      return Number.isFinite(n) ? n : Number.NaN
    }).refine(v => v === undefined || (Number.isInteger(v) && v >= 1 && v <= 100000), 'Enter an estimated number of guests'),
  }).superRefine((data, ctx) => {
    if (!data.eventDate && !data.dateIsFlexible) {
      ctx.addIssue({ code: 'custom', path: ['eventDate'], message: 'Choose a date, or tick that the date is not yet confirmed' })
    }
    if (data.eventDate) {
      const d = new Date(data.eventDate)
      if (Number.isNaN(d.getTime())) {
        ctx.addIssue({ code: 'custom', path: ['eventDate'], message: 'Please enter a valid date' })
      }
      else if (d.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
        ctx.addIssue({ code: 'custom', path: ['eventDate'], message: 'The event date should be in the future' })
      }
    }
    if (!data.location && !data.venue && !data.venueNotConfirmed) {
      ctx.addIssue({ code: 'custom', path: ['location'], message: 'Add a location, or tick that the venue is not yet confirmed' })
    }
  }),

  services: z.object({
    services: z.array(z.enum(serviceKeys)).min(1, 'Select at least one service'),
    servicesOther: optionalText(120),
  }).superRefine((data, ctx) => {
    if (data.services.includes('other') && !data.servicesOther) {
      ctx.addIssue({ code: 'custom', path: ['servicesOther'], message: 'Tell us what else you need' })
    }
  }),

  budget: z.object({
    budget: z.string().trim().min(1, 'Please choose a budget range'),
  }),

  vision: z.object({
    theme: optionalText(120),
    colours: optionalText(160),
    vision: z.string().trim().min(20, 'Share a little more about your vision (at least 20 characters)').max(3000, 'Please keep this under 3000 characters'),
    additionalRequests: optionalText(2000),
    imageIds: z.array(z.string().min(1)).max(5, 'You can attach up to 5 inspiration images').default([]),
  }),

  contact: z.object({
    fullName: z.string().trim().min(2, 'Please enter your full name').max(120),
    phone: phoneSchema,
    email: z.email('Please enter a valid email address').max(160),
    preferredContact: z.enum(contactKeys, { message: 'Choose how you would like us to contact you' }),
    consent: z.literal(true, { message: 'Please confirm we may contact you about your enquiry' }),
  }),
}

export const enquirySubmissionSchema = z.object({
  submissionKey: z.string().trim().min(16).max(80),
  sourcePage: z.string().trim().max(200).optional(),
  /** Honeypot. Must stay empty; bots tend to fill it. */
  website: z.string().max(0, 'Spam detected').optional().or(z.literal('')),
  startedAt: z.number().optional(),
})
  .and(enquiryStepSchemas.eventType)
  .and(enquiryStepSchemas.details)
  .and(enquiryStepSchemas.services)
  .and(enquiryStepSchemas.budget)
  .and(enquiryStepSchemas.vision)
  .and(enquiryStepSchemas.contact)

export type EnquirySubmission = z.infer<typeof enquirySubmissionSchema>

export const contactMessageSchema = z.object({
  submissionKey: z.string().trim().min(16).max(80),
  fullName: z.string().trim().min(2, 'Please enter your name').max(120),
  email: z.email('Please enter a valid email address').max(160),
  phone: phoneSchema.optional().or(z.literal('')).transform(v => v || undefined),
  eventType: z.string().trim().max(80).optional().or(z.literal('')).transform(v => v || undefined),
  message: z.string().trim().min(10, 'Please tell us a little about your event').max(3000),
  website: z.string().max(0, 'Spam detected').optional().or(z.literal('')),
})

export type ContactMessage = z.infer<typeof contactMessageSchema>
