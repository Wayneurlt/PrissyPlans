import { DEFAULT_BUDGET_RANGES, type BudgetRange } from '#shared/config/enquiry'
import { DEFAULT_SETTINGS, SETTING_DEFINITIONS } from '#shared/config/settings'
import { normalizeWhatsAppNumber } from '#shared/utils/whatsapp'

const CACHE_TTL_MS = 60_000
let cache: { value: Record<string, string>, expires: number } | null = null

/** Keys that must never be sent to the browser. */
const PRIVATE_KEYS = new Set(['enquiry.adminEmail'])

/** All settings: defaults overlaid with database values. Cached for one minute. */
export async function getSettings(): Promise<Record<string, string>> {
  if (cache && cache.expires > Date.now()) return cache.value
  const prisma = usePrisma()
  const rows = await prisma.websiteSetting.findMany({ select: { key: true, value: true } })
  const merged: Record<string, string> = { ...DEFAULT_SETTINGS }
  for (const row of rows) merged[row.key] = row.value
  cache = { value: merged, expires: Date.now() + CACHE_TTL_MS }
  return merged
}

export function invalidateSettingsCache() {
  cache = null
}

/** Settings safe to expose publicly, with the resolved WhatsApp number. */
export async function getPublicSettings(): Promise<Record<string, string>> {
  const all = await getSettings()
  const publicSettings: Record<string, string> = {}
  for (const [key, value] of Object.entries(all)) {
    if (!PRIVATE_KEYS.has(key)) publicSettings[key] = value
  }
  publicSettings['contact.whatsapp'] = await getWhatsAppNumber(all)
  return publicSettings
}

/** Resolved WhatsApp number: admin setting first, then the environment fallback. */
export async function getWhatsAppNumber(settings?: Record<string, string>): Promise<string> {
  const all = settings ?? await getSettings()
  const fromSettings = normalizeWhatsAppNumber(all['contact.whatsapp'] || '')
  if (fromSettings) return fromSettings
  return normalizeWhatsAppNumber(useRuntimeConfig().public.whatsappNumber || '')
}

export async function getBudgetRanges(settings?: Record<string, string>): Promise<BudgetRange[]> {
  const all = settings ?? await getSettings()
  try {
    const parsed = JSON.parse(all['enquiry.budgetRanges'] || '[]') as BudgetRange[]
    const valid = parsed.filter(r => r && typeof r.key === 'string' && typeof r.label === 'string')
    return valid.length ? valid : DEFAULT_BUDGET_RANGES
  }
  catch {
    return DEFAULT_BUDGET_RANGES
  }
}

export async function getAdminNotificationEmail(settings?: Record<string, string>): Promise<string> {
  const all = settings ?? await getSettings()
  return (all['enquiry.adminEmail'] || useRuntimeConfig().adminNotificationEmail || '').trim()
}

/** Ensures every catalogued setting exists in the database (used by the seed and admin page). */
export async function ensureSettingRows() {
  const prisma = usePrisma()
  for (const [index, def] of SETTING_DEFINITIONS.entries()) {
    await prisma.websiteSetting.upsert({
      where: { key: def.key },
      create: { key: def.key, group: def.group, label: def.label, type: def.type, value: def.value, help: def.help, sortOrder: index },
      update: { group: def.group, label: def.label, type: def.type, help: def.help, sortOrder: index },
    })
  }
  invalidateSettingsCache()
}
