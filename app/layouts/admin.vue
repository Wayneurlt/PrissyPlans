<script setup lang="ts">
const route = useRoute()
const { user, clear } = useUserSession()
const toast = useToast()
const sidebarOpen = ref(false)

const nav = [
  { label: 'Dashboard', to: '/admin', icon: 'dashboard', exact: true },
  { label: 'Enquiries', to: '/admin/enquiries', icon: 'inbox' },
  { label: 'Portfolio', to: '/admin/portfolio', icon: 'grid' },
  { label: 'Services', to: '/admin/services', icon: 'briefcase' },
  { label: 'Testimonials', to: '/admin/testimonials', icon: 'quote' },
  { label: 'Categories', to: '/admin/categories', icon: 'tag' },
  { label: 'Website settings', to: '/admin/settings', icon: 'settings' },
]

function isActive(item: { to: string, exact?: boolean }) {
  return item.exact ? route.path === item.to : route.path.startsWith(item.to)
}

watch(() => route.fullPath, () => { sidebarOpen.value = false })

async function logout() {
  try {
    await $fetch('/api/admin/auth/logout', { method: 'POST' })
    await clear()
    await navigateTo('/admin/login')
  }
  catch {
    toast.error('Could not sign out', 'Please try again.')
  }
}

useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }], bodyAttrs: { class: 'bg-[#f8f6f2]' } })
</script>

<template>
  <div class="min-h-screen bg-[#f8f6f2] text-charcoal">
    <a href="#admin-main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-wine focus:px-4 focus:py-2 focus:text-champagne">Skip to content</a>

    <!-- Mobile top bar -->
    <div class="sticky top-0 z-40 flex items-center justify-between border-b border-charcoal/10 bg-wine px-4 py-3 text-champagne lg:hidden">
      <NuxtLink to="/admin"><AppLogo variant="cream" class="h-9 w-auto" /></NuxtLink>
      <button class="inline-flex h-10 w-10 items-center justify-center" :aria-expanded="sidebarOpen" aria-label="Toggle navigation" @click="sidebarOpen = !sidebarOpen">
        <AppIcon :name="sidebarOpen ? 'close' : 'menu'" :size="22" />
      </button>
    </div>

    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-wine text-champagne transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
      aria-label="Admin navigation"
    >
      <div class="px-6 py-6">
        <NuxtLink to="/admin"><AppLogo variant="cream" class="h-14 w-auto" /></NuxtLink>
        <p class="mt-3 font-label text-[0.58rem] uppercase tracking-[0.3em] text-champagne/50">Studio dashboard</p>
      </div>
      <nav class="flex-1 space-y-1 overflow-y-auto px-3">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          :class="['flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition', isActive(item) ? 'bg-champagne/12 text-champagne' : 'text-champagne/70 hover:bg-champagne/8 hover:text-champagne']"
          :aria-current="isActive(item) ? 'page' : undefined"
        >
          <AppIcon :name="item.icon" :size="18" />
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="border-t border-champagne/10 p-4">
        <NuxtLink to="/" target="_blank" class="mb-3 flex items-center gap-2 px-2 text-xs text-champagne/60 hover:text-champagne">
          <AppIcon name="external" :size="14" /> View website
        </NuxtLink>
        <div class="flex items-center justify-between gap-2 px-2">
          <div class="min-w-0">
            <p class="truncate text-sm">{{ user?.name }}</p>
            <p class="truncate text-xs text-champagne/50">{{ user?.email }}</p>
          </div>
          <button class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-champagne/70 hover:bg-champagne/10 hover:text-champagne" aria-label="Sign out" title="Sign out" @click="logout">
            <AppIcon name="logout" :size="18" />
          </button>
        </div>
      </div>
    </aside>
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-charcoal/40 lg:hidden" aria-hidden="true" @click="sidebarOpen = false" />

    <main id="admin-main" class="lg:pl-64">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <slot />
      </div>
    </main>
    <AppToasts />
  </div>
</template>
