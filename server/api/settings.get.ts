/** Public website settings (contact details, hero copy, CTAs). Private keys are stripped server-side. */
export default defineEventHandler(async () => {
  return await getPublicSettings()
})
