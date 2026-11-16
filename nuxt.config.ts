import tailwindcss from '@tailwindcss/vite'

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const cloudinaryCloudName = process.env.NUXT_CLOUDINARY_CLOUD_NAME || ''

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/fonts', '@nuxt/image', 'nuxt-auth-utils'],

  css: ['~/assets/css/main.css'],

  // Components are grouped in folders (ui/, site/, enquiry/, admin/) for organisation only;
  // they are referenced by file name, e.g. <AppLogo>, <PageHero>, <StatusBadge>.
  components: [{ path: '~/components', pathPrefix: false }],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s · Prissy Plans Events',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#3B0019' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/brand/favicon-32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/brand/apple-touch-icon.png' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  fonts: {
    families: [
      { name: 'Cormorant Garamond', provider: 'google', weights: [300, 400, 500, 600], styles: ['normal', 'italic'] },
      { name: 'DM Sans', provider: 'google', weights: [300, 400, 500, 600] },
      { name: 'Josefin Sans', provider: 'google', weights: [300, 400, 500] },
    ],
  },

  image: {
    quality: 80,
    format: ['avif', 'webp'],
    screens: { xs: 360, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536, '2xl': 1920 },
    cloudinary: {
      baseURL: cloudinaryCloudName ? `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/` : '',
    },
    unsplash: {},
  },

  runtimeConfig: {
    // Server-only secrets. Override with NUXT_* environment variables.
    cloudinary: {
      cloudName: '',
      apiKey: '',
      apiSecret: '',
      folder: 'prissy-plans',
    },
    smtp: {
      host: '',
      port: '587',
      secure: 'false',
      user: '',
      pass: '',
    },
    mailFrom: 'Prissy Plans Events <no-reply@example.com>',
    adminNotificationEmail: '',
    ipHashSalt: 'change-me',
    session: {
      name: 'ppe_admin_session',
      maxAge: 60 * 60 * 8,
      cookie: { sameSite: 'lax' },
    },
    public: {
      siteUrl,
      whatsappNumber: '',
      cloudinaryCloudName,
    },
  },

  routeRules: {
    '/admin/**': { ssr: true, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/api/**': { headers: { 'Cache-Control': 'no-store' } },
    '/brand/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
  },

  nitro: {
    compressPublicAssets: true,
  },

  typescript: {
    strict: true,
  },
})
