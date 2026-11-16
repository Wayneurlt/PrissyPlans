interface SeoOptions {
  title: string
  description?: string
  image?: string | null
  type?: 'website' | 'article'
  noindex?: boolean
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>
}

/** Page-level SEO: title, description, Open Graph, canonical URL and optional JSON-LD. */
export function usePageSeo(options: SeoOptions | (() => SeoOptions)) {
  const route = useRoute()
  const config = useRuntimeConfig()
  const { get } = useSiteSettings()
  const siteUrl = config.public.siteUrl.replace(/\/$/, '')

  const resolved = computed(() => (typeof options === 'function' ? options() : options))
  const canonical = computed(() => `${siteUrl}${route.path === '/' ? '' : route.path}`)
  const image = computed(() => {
    const img = resolved.value.image || get('seo.ogImage', '/brand/og-default.png')
    return img.startsWith('http') ? img : `${siteUrl}${img}`
  })

  useHead({
    title: () => resolved.value.title,
    link: [{ rel: 'canonical', href: canonical }],
    script: () => resolved.value.structuredData
      ? [{ type: 'application/ld+json', innerHTML: JSON.stringify(resolved.value.structuredData) }]
      : [],
  })

  useSeoMeta({
    description: () => resolved.value.description || get('seo.defaultDescription'),
    ogTitle: () => `${resolved.value.title} · ${get('seo.siteName', 'Prissy Plans Events')}`,
    ogDescription: () => resolved.value.description || get('seo.defaultDescription'),
    ogUrl: canonical,
    ogImage: image,
    ogType: () => resolved.value.type || 'website',
    twitterTitle: () => resolved.value.title,
    twitterDescription: () => resolved.value.description || get('seo.defaultDescription'),
    twitterImage: image,
    robots: () => (resolved.value.noindex ? 'noindex, nofollow' : 'index, follow'),
  })
}

export function useOrganisationSchema() {
  const config = useRuntimeConfig()
  const { get, real } = useSiteSettings()
  const siteUrl = config.public.siteUrl.replace(/\/$/, '')
  const sameAs = ['contact.instagram', 'contact.facebook', 'contact.tiktok'].map(k => real(k)).filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': get('seo.siteName', 'Prissy Plans Events'),
    'description': get('seo.defaultDescription'),
    'url': siteUrl,
    'image': `${siteUrl}/brand/og-default.png`,
    'logo': `${siteUrl}/brand/logo-square-512.png`,
    'areaServed': 'Kenya',
    ...(real('contact.email') ? { email: real('contact.email') } : {}),
    ...(real('contact.phone') ? { telephone: real('contact.phone') } : {}),
    ...(real('contact.location') ? { address: { '@type': 'PostalAddress', 'addressLocality': real('contact.location'), 'addressCountry': 'KE' } } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }
}
