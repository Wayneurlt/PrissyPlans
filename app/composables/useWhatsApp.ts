import { buildEnquiryMessage, buildWhatsAppLink, type WhatsAppEnquiryContext } from '#shared/utils/whatsapp'

export function useWhatsApp() {
  const { get, whatsappNumber } = useSiteSettings()

  const isConfigured = computed(() => Boolean(whatsappNumber.value))
  const label = computed(() => get('cta.whatsappLabel', 'Chat on WhatsApp'))

  function link(message?: string): string {
    if (!whatsappNumber.value) return ''
    return buildWhatsAppLink(whatsappNumber.value, message ?? get('cta.whatsappGreeting'))
  }

  function enquiryLink(ctx: WhatsAppEnquiryContext = {}): string {
    if (!whatsappNumber.value) return ''
    const greeting = get('cta.whatsappGreeting').split('\n')[0] || 'Hello Prissy Plans Events,'
    return buildWhatsAppLink(whatsappNumber.value, buildEnquiryMessage(ctx, greeting.replace(/[,.]?\s*I.*$/i, ',')))
  }

  return { isConfigured, label, link, enquiryLink, number: whatsappNumber }
}
