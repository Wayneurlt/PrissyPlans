/**
 * Enquiry form configuration shared by the public form, server validation and admin UI.
 * Budget ranges are defaults; the live values are editable in Admin → Settings → Enquiry form.
 */

export const EVENT_TYPES = [
  { key: 'wedding', label: 'Wedding', categorySlug: 'weddings' },
  { key: 'birthday', label: 'Birthday', categorySlug: 'birthdays' },
  { key: 'baby-shower', label: 'Baby Shower', categorySlug: 'baby-showers' },
  { key: 'bridal-shower', label: 'Bridal Shower', categorySlug: 'bridal-showers' },
  { key: 'engagement', label: 'Engagement', categorySlug: 'engagements' },
  { key: 'corporate', label: 'Corporate Event', categorySlug: 'corporate-events' },
  { key: 'private-party', label: 'Private Party', categorySlug: 'private-celebrations' },
  { key: 'other', label: 'Other', categorySlug: null },
] as const

export type EventTypeKey = (typeof EVENT_TYPES)[number]['key']

export const ENQUIRY_SERVICES = [
  { key: 'planning', label: 'Event Planning', serviceSlug: 'event-planning' },
  { key: 'decoration', label: 'Decoration & Styling', serviceSlug: 'event-decoration-styling' },
  { key: 'coordination', label: 'Event Coordination', serviceSlug: 'event-coordination' },
  { key: 'full-service', label: 'Full-Service Event Management', serviceSlug: null },
  { key: 'other', label: 'Other', serviceSlug: null },
] as const

export type EnquiryServiceKey = (typeof ENQUIRY_SERVICES)[number]['key']

export interface BudgetRange {
  key: string
  label: string
}

/** Default budget ranges in Kenyan Shillings. Indicative only; never shown as prices. */
export const DEFAULT_BUDGET_RANGES: BudgetRange[] = [
  { key: 'below-50k', label: 'Below KES 50,000' },
  { key: '50k-100k', label: 'KES 50,000 – 100,000' },
  { key: '100k-250k', label: 'KES 100,000 – 250,000' },
  { key: '250k-500k', label: 'KES 250,000 – 500,000' },
  { key: 'above-500k', label: 'Above KES 500,000' },
  { key: 'undecided', label: 'Not yet decided' },
]

export const CONTACT_METHODS = [
  { key: 'WHATSAPP', label: 'WhatsApp' },
  { key: 'PHONE', label: 'Phone call' },
  { key: 'EMAIL', label: 'Email' },
] as const

export const ENQUIRY_STATUSES = [
  { key: 'NEW', label: 'New', tone: 'wine' },
  { key: 'CONTACTED', label: 'Contacted', tone: 'mocha' },
  { key: 'CONSULTATION_SCHEDULED', label: 'Consultation scheduled', tone: 'gold' },
  { key: 'PROPOSAL_SENT', label: 'Proposal sent', tone: 'gold' },
  { key: 'CONFIRMED', label: 'Confirmed', tone: 'success' },
  { key: 'COMPLETED', label: 'Completed', tone: 'charcoal' },
  { key: 'DECLINED', label: 'Declined', tone: 'danger' },
] as const

export type EnquiryStatusKey = (typeof ENQUIRY_STATUSES)[number]['key']

export const ENQUIRY_UPLOAD = {
  maxFiles: 5,
  maxBytes: 8 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
} as const

export const ADMIN_UPLOAD = {
  maxFiles: 20,
  maxBytes: 15 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
} as const
