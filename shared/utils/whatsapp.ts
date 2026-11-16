/**
 * WhatsApp click-to-chat helpers (no API credentials required).
 * Works on mobile (opens the app) and desktop (WhatsApp Web / desktop app).
 */

/**
 * Normalises a phone number to the digits-only international format WhatsApp expects.
 * - Strips spaces, dashes, brackets and a leading "+".
 * - Converts a Kenyan local number (07XX… / 01XX…, 10 digits) to 254XXXXXXXXX.
 * Returns an empty string when the input cannot be a valid number.
 */
export function normalizeWhatsAppNumber(input: string): string {
  if (!input) return ''
  let digits = input.replace(/[^\d]/g, '')
  if (!digits) return ''
  if (digits.length === 10 && digits.startsWith('0')) {
    digits = `254${digits.slice(1)}`
  }
  if (digits.length < 8 || digits.length > 15) return ''
  return digits
}

export function buildWhatsAppLink(number: string, message?: string): string {
  const digits = normalizeWhatsAppNumber(number)
  if (!digits) return ''
  const base = `https://wa.me/${digits}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

export function formatPhoneForDisplay(number: string): string {
  const digits = normalizeWhatsAppNumber(number)
  if (!digits) return number
  if (digits.startsWith('254') && digits.length === 12) {
    return `+254 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
  }
  return `+${digits}`
}

export interface WhatsAppEnquiryContext {
  reference?: string
  name?: string
  eventType?: string
  eventDate?: string
  service?: string
}

/** Builds a friendly prefilled message for the different WhatsApp entry points. */
export function buildEnquiryMessage(ctx: WhatsAppEnquiryContext = {}, greeting = 'Hello Prissy Plans Events,'): string {
  const lines: string[] = [greeting]
  if (ctx.reference) {
    lines.push(`I just submitted an event enquiry (reference ${ctx.reference}) and would love to discuss it further.`)
  }
  else if (ctx.service) {
    lines.push(`I'm interested in your ${ctx.service} service and would like to find out more.`)
  }
  else if (ctx.eventType) {
    lines.push(`I'd like to enquire about planning a ${ctx.eventType.toLowerCase()}.`)
  }
  else {
    lines.push("I'd like to enquire about planning an event.")
  }
  if (ctx.eventDate) lines.push(`Preferred date: ${ctx.eventDate}.`)
  if (ctx.name) lines.push(`My name is ${ctx.name}.`)
  return lines.join(' ')
}
