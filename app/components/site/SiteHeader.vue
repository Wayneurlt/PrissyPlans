<script setup lang="ts">
/**
 * Always-solid header: a cream bar with the wine wordmark and charcoal links.
 * It sits in the page flow (sticky), so it is readable on every page and never
 * overlaps photography.
 */
const route = useRoute()
const { get } = useSiteSettings()
const { isConfigured, link, label } = useWhatsApp()

const nav = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Inspiration', to: '/inspiration' },
  { label: 'Contact', to: '/contact' },
]

const scrolled = ref(false)
const menuOpen = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 8
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') menuOpen.value = false
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  if (import.meta.client) document.documentElement.style.overflow = ''
})

watch(() => route.fullPath, () => { menuOpen.value = false })
watch(menuOpen, (open) => {
  if (import.meta.client) document.documentElement.style.overflow = open ? 'hidden' : ''
})

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <header
    :class="[
      'sticky top-0 z-50 border-b bg-cream/95 text-charcoal backdrop-blur-md transition-shadow duration-300',
      scrolled ? 'border-charcoal/10 shadow-[0_8px_24px_-18px_rgb(41_35_33_/_0.35)]' : 'border-charcoal/8',
    ]"
  >
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:bg-wine focus:px-4 focus:py-2 focus:text-champagne">Skip to content</a>

    <div class="container-x flex h-16 items-center justify-between gap-6 lg:h-20">
      <NuxtLink to="/" class="shrink-0" aria-label="Prissy Plans Events — home">
        <AppLogo form="wordmark" variant="wine" class="h-8 w-auto sm:h-9 lg:h-10" />
      </NuxtLink>

      <nav class="hidden items-center gap-9 xl:flex" aria-label="Primary">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          :class="[
            'relative py-2 font-label text-[0.74rem] uppercase tracking-[0.2em] transition-colors',
            isActive(item.to) ? 'text-wine' : 'text-charcoal/80 hover:text-wine',
          ]"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          {{ item.label }}
          <span :class="['absolute inset-x-0 -bottom-0.5 h-px bg-wine transition-transform duration-300 origin-left', isActive(item.to) ? 'scale-x-100' : 'scale-x-0']" />
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2 sm:gap-3">
        <NuxtLink to="/enquire" class="btn-primary hidden min-h-11 whitespace-nowrap px-6 py-3 sm:inline-flex">
          {{ get('hero.primaryCta', 'Plan Your Event') }}
        </NuxtLink>
        <button
          class="inline-flex h-11 w-11 items-center justify-center text-wine xl:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <AppIcon :name="menuOpen ? 'close' : 'menu'" :size="24" />
        </button>
      </div>
    </div>

    <!-- Teleported to <body>: the header's backdrop-filter would otherwise become the
         containing block for this fixed panel and collapse it to the header's height. -->
    <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-luxe"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-200 ease-luxe"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="menuOpen"
        id="mobile-menu"
        class="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-charcoal/10 bg-cream lg:top-20 xl:hidden"
      >
        <nav class="container-x flex min-h-full flex-col py-8" aria-label="Mobile">
          <ul>
            <li v-for="item in [{ label: 'Home', to: '/' }, ...nav]" :key="item.to">
              <NuxtLink
                :to="item.to"
                :class="['flex items-center justify-between border-b border-charcoal/10 py-4 font-serif text-3xl font-light', (item.to === '/' ? route.path === '/' : isActive(item.to)) ? 'text-wine italic' : 'text-charcoal']"
              >
                {{ item.label }}
                <AppIcon name="arrow-right" :size="18" class="text-mocha" />
              </NuxtLink>
            </li>
          </ul>
          <div class="mt-auto flex flex-col gap-3 pt-10">
            <NuxtLink to="/enquire" class="btn-primary w-full">{{ get('hero.primaryCta', 'Plan Your Event') }}</NuxtLink>
            <a v-if="isConfigured" :href="link()" target="_blank" rel="noopener noreferrer" class="btn-whatsapp w-full">
              <AppIcon name="whatsapp" :size="18" />
              {{ label }}
            </a>
          </div>
        </nav>
      </div>
    </Transition>
    </Teleport>
  </header>
</template>
