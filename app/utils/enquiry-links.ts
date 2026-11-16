import { ENQUIRY_SERVICES, EVENT_TYPES } from '#shared/config/enquiry'

/** Query parameters that prefill the enquiry form for a given service page. */
export function enquiryQueryForService(slug: string): Record<string, string> {
  const service = ENQUIRY_SERVICES.find(s => s.serviceSlug === slug)
  if (service) return { service: service.key }
  const bySlug: Record<string, string> = {
    'weddings-engagements': 'wedding',
    'birthdays-private-celebrations': 'birthday',
    'baby-bridal-showers': 'baby-shower',
    'corporate-events': 'corporate',
  }
  const type = bySlug[slug]
  return type ? { type } : {}
}

/** Query parameters that prefill the enquiry form from a portfolio category. */
export function enquiryQueryForCategory(categorySlug: string | null | undefined): Record<string, string> {
  if (!categorySlug) return {}
  const match = EVENT_TYPES.find(t => t.categorySlug === categorySlug)
  return match ? { type: match.key } : {}
}

/** Splits long-form text into paragraphs (double newline separated). */
export function paragraphs(text: string | null | undefined): string[] {
  if (!text) return []
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
}
