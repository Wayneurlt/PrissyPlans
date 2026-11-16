import { SETTING_GROUPS } from '#shared/config/settings'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const prisma = usePrisma()
  let rows = await prisma.websiteSetting.findMany({ orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }] })
  if (!rows.length) {
    await ensureSettingRows()
    rows = await prisma.websiteSetting.findMany({ orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }] })
  }
  const groups = Object.entries(SETTING_GROUPS).map(([key, label]) => ({
    key,
    label,
    settings: rows.filter(r => r.group === key).sort((a, b) => a.sortOrder - b.sortOrder).map(r => ({
      key: r.key, label: r.label, type: r.type, value: r.value, help: r.help, updatedAt: r.updatedAt,
    })),
  })).filter(g => g.settings.length)
  return { groups, env: { whatsappFallback: useRuntimeConfig().public.whatsappNumber || '', uploads: isCloudinaryConfigured(), mail: isMailConfigured() } }
})
