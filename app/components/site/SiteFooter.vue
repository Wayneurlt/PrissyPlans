<script setup lang="ts">
const { get, real, instagram } = useSiteSettings()
const year = new Date().getFullYear()

const socials = computed(() => [
  { name: 'Instagram', icon: 'instagram', href: instagram.value },
  { name: 'Facebook', icon: 'facebook', href: real('contact.facebook') },
  { name: 'TikTok', icon: 'tiktok', href: real('contact.tiktok') },
].filter(s => s.href))

const links = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Inspiration', to: '/inspiration' },
  { label: 'Contact', to: '/contact' },
  { label: 'Plan your event', to: '/enquire' },
]

const contact = computed(() => [
  { icon: 'map-pin', value: get('contact.location') },
  { icon: 'mail', value: get('contact.email') },
  { icon: 'phone', value: get('contact.phone') },
  { icon: 'clock', value: get('contact.hours') },
])
</script>

<template>
  <footer class="bg-wine-deep text-champagne">
    <div class="container-x py-14 sm:py-16">
      <div class="grid gap-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
        <div class="sm:col-span-2 lg:col-span-1">
          <AppLogo variant="cream" class="h-20 w-auto" />
          <p class="mt-5 max-w-sm text-sm leading-relaxed text-champagne/70">{{ get('footer.note') }}</p>
          <div v-if="socials.length" class="mt-6 flex gap-3">
            <a
              v-for="s in socials"
              :key="s.name"
              :href="s.href"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-champagne/25 transition hover:border-champagne hover:bg-champagne hover:text-wine"
              :aria-label="s.name"
            >
              <AppIcon :name="s.icon" :size="16" />
            </a>
          </div>
        </div>

        <nav aria-label="Footer">
          <p class="eyebrow-light mb-4">Explore</p>
          <ul class="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-1">
            <li v-for="l in links" :key="l.to"><NuxtLink :to="l.to" class="text-champagne/80 transition hover:text-champagne">{{ l.label }}</NuxtLink></li>
          </ul>
        </nav>

        <div>
          <p class="eyebrow-light mb-4">Get in touch</p>
          <ul class="space-y-2.5 text-sm text-champagne/80">
            <li v-for="c in contact" :key="c.icon" class="flex items-start gap-3">
              <AppIcon :name="c.icon" :size="15" class="mt-0.5 shrink-0 opacity-60" />
              <span class="min-w-0 break-words">{{ c.value }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 flex flex-col gap-2 border-t border-champagne/15 pt-6 text-xs text-champagne/50 sm:flex-row sm:items-center sm:justify-between">
        <p>© {{ year }} Prissy Plans Events · {{ get('footer.tagline') }}</p>
        <NuxtLink to="/admin" class="transition hover:text-champagne">Admin</NuxtLink>
      </div>
    </div>
  </footer>
</template>
