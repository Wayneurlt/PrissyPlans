import { CONTACT_METHODS, ENQUIRY_SERVICES, ENQUIRY_UPLOAD, EVENT_TYPES } from '#shared/config/enquiry'

/** Options for the multi-step enquiry form. Budget ranges come from the admin-editable settings. */
export default defineEventHandler(async () => {
  const settings = await getSettings()
  return {
    eventTypes: EVENT_TYPES.map(t => ({ key: t.key, label: t.label })),
    services: ENQUIRY_SERVICES.map(s => ({ key: s.key, label: s.label })),
    budgetRanges: await getBudgetRanges(settings),
    contactMethods: CONTACT_METHODS.map(c => ({ key: c.key, label: c.label })),
    upload: { maxFiles: ENQUIRY_UPLOAD.maxFiles, maxBytes: ENQUIRY_UPLOAD.maxBytes, enabled: isCloudinaryConfigured() },
    successMessage: settings['enquiry.successMessage'],
  }
})
