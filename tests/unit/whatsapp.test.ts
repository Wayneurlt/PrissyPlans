import { describe, expect, it } from 'vitest'
import { buildEnquiryMessage, buildWhatsAppLink, formatPhoneForDisplay, normalizeWhatsAppNumber } from '#shared/utils/whatsapp'

describe('normalizeWhatsAppNumber', () => {
  it('strips formatting and the leading plus', () => {
    expect(normalizeWhatsAppNumber('+254 712 345 678')).toBe('254712345678')
    expect(normalizeWhatsAppNumber('(254) 712-345-678')).toBe('254712345678')
  })

  it('converts Kenyan local numbers to international format', () => {
    expect(normalizeWhatsAppNumber('0712345678')).toBe('254712345678')
    expect(normalizeWhatsAppNumber('0112345678')).toBe('254112345678')
  })

  it('rejects empty and implausible numbers', () => {
    expect(normalizeWhatsAppNumber('')).toBe('')
    expect(normalizeWhatsAppNumber('12345')).toBe('')
    expect(normalizeWhatsAppNumber('[PLACEHOLDER: phone]')).toBe('')
    expect(normalizeWhatsAppNumber('1'.repeat(16))).toBe('')
  })
})

describe('buildWhatsAppLink', () => {
  it('builds a wa.me link that works on mobile and desktop', () => {
    expect(buildWhatsAppLink('+254 712 345 678')).toBe('https://wa.me/254712345678')
  })

  it('URL-encodes the prefilled message', () => {
    const link = buildWhatsAppLink('0712345678', 'Hello & welcome?')
    expect(link).toBe('https://wa.me/254712345678?text=Hello%20%26%20welcome%3F')
  })

  it('returns an empty string when no number is configured', () => {
    expect(buildWhatsAppLink('', 'Hi')).toBe('')
  })
})

describe('buildEnquiryMessage', () => {
  it('mentions the reference after a submission', () => {
    const msg = buildEnquiryMessage({ reference: 'PPE-2611-ABCDE', name: 'Jane Doe' })
    expect(msg).toContain('PPE-2611-ABCDE')
    expect(msg).toContain('Jane Doe')
  })

  it('mentions the service on service pages', () => {
    expect(buildEnquiryMessage({ service: 'Event Coordination' })).toContain('Event Coordination')
  })

  it('falls back to a general greeting', () => {
    expect(buildEnquiryMessage()).toContain('enquire about planning an event')
  })
})

describe('formatPhoneForDisplay', () => {
  it('formats Kenyan numbers', () => {
    expect(formatPhoneForDisplay('0712345678')).toBe('+254 712 345 678')
  })
})
