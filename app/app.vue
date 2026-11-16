<script setup lang="ts">
const { get } = useSiteSettings()
await callOnce('site-settings', loadSiteSettings)

const config = useRuntimeConfig()
const siteName = computed(() => get('seo.siteName', 'Prissy Plans Events'))

useHead({
  titleTemplate: title => (title ? `${title} · ${siteName.value}` : `${siteName.value} · ${get('seo.defaultTitle')}`),
  link: [{ rel: 'preconnect', href: 'https://images.unsplash.com' }, { rel: 'preconnect', href: 'https://res.cloudinary.com' }],
})

useSeoMeta({
  ogSiteName: siteName,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  description: () => get('seo.defaultDescription'),
  ogImage: () => {
    const img = get('seo.ogImage', '/brand/og-default.png')
    return img.startsWith('http') ? img : `${config.public.siteUrl.replace(/\/$/, '')}${img}`
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
