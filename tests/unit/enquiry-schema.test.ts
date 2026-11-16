import { describe, expect, it } from 'vitest'
import { enquiryStepSchemas, enquirySubmissionSchema } from '#shared/schemas/enquiry'

const future = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

export const validSubmission = {
  submissionKey: 'unit-test-key-1234567890',
  eventType: 'birthday',
  eventDate: future,
  dateIsFlexible: false,
  location: 'Nairobi',
  venue: '',
  venueNotConfirmed: false,
  guestCount: '40',
  services: ['decoration'],
  budget: '50k-100k',
  vision: 'A relaxed garden birthday brunch with florals and a dessert table.',
  imageIds: [],
  fullName: 'Jane Doe',
  phone: '+254 712 345 678',
  email: 'jane@example.com',
  preferredContact: 'WHATSAPP',
  consent: true,
  website: '',
}

describe('enquiry step validation', () => {
  it('requires an event type', () => {
    const r = enquiryStepSchemas.eventType.safeParse({ eventType: '' })
    expect(r.success).toBe(false)
  })

  it('requires a description when the event type is Other', () => {
    expect(enquiryStepSchemas.eventType.safeParse({ eventType: 'other' }).success).toBe(false)
    expect(enquiryStepSchemas.eventType.safeParse({ eventType: 'other', eventTypeOther: 'Graduation' }).success).toBe(true)
  })

  it('accepts an unconfirmed date and venue', () => {
    const r = enquiryStepSchemas.details.safeParse({ dateIsFlexible: true, venueNotConfirmed: true })
    expect(r.success).toBe(true)
  })

  it('requires a date or the not-confirmed flag', () => {
    const r = enquiryStepSchemas.details.safeParse({ location: 'Nairobi' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0]?.path).toEqual(['eventDate'])
  })

  it('rejects past dates', () => {
    const r = enquiryStepSchemas.details.safeParse({ eventDate: '2020-01-01', location: 'Nairobi' })
    expect(r.success).toBe(false)
  })

  it('rejects an invalid guest count', () => {
    const r = enquiryStepSchemas.details.safeParse({ dateIsFlexible: true, location: 'x', guestCount: '-3' })
    expect(r.success).toBe(false)
  })

  it('requires at least one service', () => {
    expect(enquiryStepSchemas.services.safeParse({ services: [] }).success).toBe(false)
    expect(enquiryStepSchemas.services.safeParse({ services: ['planning', 'coordination'] }).success).toBe(true)
  })

  it('requires a meaningful vision', () => {
    expect(enquiryStepSchemas.vision.safeParse({ vision: 'short' }).success).toBe(false)
  })

  it('limits inspiration images to five', () => {
    const r = enquiryStepSchemas.vision.safeParse({ vision: 'x'.repeat(30), imageIds: ['1', '2', '3', '4', '5', '6'] })
    expect(r.success).toBe(false)
  })

  it('validates contact details and consent', () => {
    expect(enquiryStepSchemas.contact.safeParse({ fullName: 'J', phone: 'abc', email: 'nope', preferredContact: 'WHATSAPP', consent: false }).success).toBe(false)
    expect(enquiryStepSchemas.contact.safeParse({ fullName: 'Jane Doe', phone: '0712345678', email: 'jane@example.com', preferredContact: 'EMAIL', consent: true }).success).toBe(true)
  })
})

describe('full submission schema', () => {
  it('accepts a complete, valid enquiry', () => {
    const r = enquirySubmissionSchema.safeParse(validSubmission)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.guestCount).toBe(40)
  })

  it('rejects a filled honeypot', () => {
    expect(enquirySubmissionSchema.safeParse({ ...validSubmission, website: 'http://spam' }).success).toBe(false)
  })

  it('rejects a short idempotency key', () => {
    expect(enquirySubmissionSchema.safeParse({ ...validSubmission, submissionKey: 'abc' }).success).toBe(false)
  })
})
