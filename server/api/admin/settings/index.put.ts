import { settingsUpdateSchema } from '#shared/schemas/admin'
import { SETTING_DEFINITIONS } from '#shared/config/settings'
import { normalizeWhatsAppNumber } from '#shared/utils/whatsapp'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const { values } = await readValidatedBodyOrFail(event, settingsUpdateSchema)
  const prisma = usePrisma()

  const fieldErrors: Record<string, string> = {}
  const updates: Array<{ key: string, value: string }> = []

  for (const [key, rawValue] of Object.entries(values)) {
    const def = SETTING_DEFINITIONS.find(d => d.key === key)
    if (!def) continue
    let value = rawValue.trim()
    if (def.type === 'JSON') {
      try {
        const parsed = JSON.parse(value || '[]')
        value = JSON.stringify(parsed)
      }
      catch {
        fieldErrors[key] = 'Must be valid JSON'
        continue
      }
    }
    if (def.type === 'EMAIL' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !value.startsWith('[PLACEHOLDER')) {
      fieldErrors[key] = 'Enter a valid email address'
      continue
    }
    if (def.type === 'URL' && value && !/^(https?:\/\/|\/)/.test(value)) {
      fieldErrors[key] = 'Enter a full URL starting with https://'
      continue
    }
    if (key === 'contact.whatsapp' && value && !normalizeWhatsAppNumber(value)) {
      fieldErrors[key] = 'Enter the number in international format, e.g. 2547XXXXXXXX'
      continue
    }
    if (key === 'contact.whatsapp' && value) value = normalizeWhatsAppNumber(value)
    updates.push({ key, value })
  }

  if (Object.keys(fieldErrors).length) {
    throw createError({ statusCode: 422, statusMessage: 'Validation failed', data: { fieldErrors } })
  }

  await prisma.$transaction(updates.map(u => prisma.websiteSetting.update({ where: { key: u.key }, data: { value: u.value } })))
  invalidateSettingsCache()
  await logActivity({ actorId: admin.id, action: 'settings.updated', entityType: 'settings', summary: `${admin.name} updated ${updates.length} website setting(s)` })
  return { ok: true, updated: updates.length }
})
