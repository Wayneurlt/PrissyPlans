import { DEFAULT_SETTINGS } from '#shared/config/settings'

type SettingsMap = Record<string, string>

/** Loads public settings once (SSR) and shares them through Nuxt state. */
export async function loadSiteSettings() {
  const state = useState<SettingsMap>('site-settings', () => ({}))
  if (Object.keys(state.value).length) return
  try {
    state.value = await $fetch<SettingsMap>('/api/settings')
  }
  catch (error) {
    console.error('[settings] failed to load, using defaults', error)
    state.value = { ...DEFAULT_SETTINGS }
  }
}

export function isPlaceholderValue(value: string | undefined | null): boolean {
  return !value || value.trim().startsWith('[PLACEHOLDER')
}

export function useSiteSettings() {
  const settings = useState<SettingsMap>('site-settings', () => ({}))

  function get(key: string, fallback = ''): string {
    const value = settings.value[key]
    if (value !== undefined && value !== null && value !== '') return value
    return DEFAULT_SETTINGS[key] ?? fallback
  }

  /** Returns the value unless it is an unconfigured placeholder. */
  function real(key: string): string {
    const value = get(key)
    return isPlaceholderValue(value) ? '' : value
  }

  return {
    settings,
    get,
    real,
    whatsappNumber: computed(() => get('contact.whatsapp')),
    instagram: computed(() => real('contact.instagram')),
    email: computed(() => real('contact.email')),
    phone: computed(() => real('contact.phone')),
    location: computed(() => real('contact.location')),
    hours: computed(() => real('contact.hours')),
  }
}
