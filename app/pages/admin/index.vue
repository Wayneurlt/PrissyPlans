<script setup lang="ts">
import { formatDate, relativeTime } from '#shared/utils/format'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Dashboard' })

const { user } = useUserSession()
const { data, status, refresh, error } = await useFetch('/api/admin/dashboard', { key: 'admin-dashboard' })

const stats = computed(() => data.value?.stats)
const cards = computed(() => stats.value
  ? [
      { label: 'Total enquiries', value: stats.value.total, to: '/admin/enquiries', hint: `${stats.value.last30} in the last 30 days` },
      { label: 'New', value: stats.value.new, to: '/admin/enquiries?status=NEW', hint: 'Awaiting first contact', accent: true },
      { label: 'Contacted', value: stats.value.contacted, to: '/admin/enquiries?status=CONTACTED', hint: `${stats.value.consultation} consultations · ${stats.value.proposal} proposals` },
      { label: 'Confirmed events', value: stats.value.confirmed, to: '/admin/enquiries?status=CONFIRMED', hint: `${stats.value.completed} completed` },
    ]
  : [])

const setupWarnings = computed(() => {
  const c = data.value?.config
  if (!c) return []
  return [
    !c.whatsapp && { text: 'WhatsApp number is not set, so WhatsApp buttons are hidden.', to: '/admin/settings' },
    !c.mail && { text: 'SMTP is not configured; notification emails are only logged on the server.', to: null },
    !c.adminEmail && { text: 'No notification inbox is set for new enquiries.', to: '/admin/settings' },
    !c.uploads && { text: 'Cloudinary is not configured, so image uploads are disabled.', to: null },
  ].filter(Boolean) as Array<{ text: string, to: string | null }>
})
</script>

<template>
  <div>
    <AdminPageHeader :title="`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`" description="An overview of enquiries and website content.">
      <template #actions>
        <button class="admin-btn-secondary" :disabled="status === 'pending'" @click="() => refresh()"><AppIcon name="refresh" :size="16" :class="status === 'pending' ? 'animate-spin' : ''" /> Refresh</button>
      </template>
    </AdminPageHeader>

    <div v-if="error" class="rounded-lg border border-danger/30 bg-white p-6 text-danger">Could not load the dashboard. {{ error.message }}</div>

    <template v-else-if="data">
      <div v-if="setupWarnings.length" class="mb-8 rounded-lg border border-warning/30 bg-warning/5 p-5">
        <p class="mb-2 flex items-center gap-2 text-sm font-medium text-[#7a5212]"><AppIcon name="alert" :size="16" /> Setup checklist</p>
        <ul class="space-y-1 text-sm text-charcoal/80">
          <li v-for="w in setupWarnings" :key="w.text" class="flex items-center gap-2">
            <span class="h-1 w-1 rounded-full bg-[#7a5212]" />
            {{ w.text }}
            <NuxtLink v-if="w.to" :to="w.to" class="underline">Fix</NuxtLink>
          </li>
        </ul>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <NuxtLink v-for="c in cards" :key="c.label" :to="c.to" :class="['admin-card group p-5 transition hover:border-wine/40', c.accent ? '!border-wine/30 !bg-wine text-champagne' : '']">
          <p :class="['text-sm', c.accent ? 'text-champagne/80' : 'text-ink-muted']">{{ c.label }}</p>
          <p class="mt-2 font-serif text-5xl">{{ c.value }}</p>
          <p :class="['mt-2 text-xs', c.accent ? 'text-champagne/70' : 'text-ink-muted']">{{ c.hint }}</p>
        </NuxtLink>
      </div>

      <div class="mt-8 grid gap-6 xl:grid-cols-3">
        <section class="admin-card xl:col-span-2">
          <div class="flex items-center justify-between border-b border-charcoal/10 px-5 py-4">
            <h2 class="font-serif text-2xl">Latest enquiries</h2>
            <NuxtLink to="/admin/enquiries" class="text-sm text-mocha hover:text-wine">View all</NuxtLink>
          </div>
          <ul v-if="data.recentEnquiries.length" class="divide-y divide-charcoal/10">
            <li v-for="e in data.recentEnquiries" :key="e.id">
              <NuxtLink :to="`/admin/enquiries/${e.id}`" class="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 transition hover:bg-cream/60">
                <div class="min-w-0 flex-1">
                  <p class="truncate font-medium">{{ e.fullName }}</p>
                  <p class="text-sm text-ink-muted">{{ e.eventTypeLabel }}<span v-if="e.eventDate"> · {{ formatDate(e.eventDate) }}</span><span v-if="e.budgetLabel"> · {{ e.budgetLabel }}</span></p>
                </div>
                <StatusBadge :status="e.status" />
                <span class="w-24 text-right text-xs text-ink-muted">{{ relativeTime(e.createdAt) }}</span>
              </NuxtLink>
            </li>
          </ul>
          <div v-else class="p-8 text-center text-sm text-ink-muted">No enquiries yet. They will appear here as soon as someone submits the form.</div>
        </section>

        <section class="admin-card">
          <div class="border-b border-charcoal/10 px-5 py-4"><h2 class="font-serif text-2xl">Upcoming events</h2></div>
          <ul v-if="data.upcoming.length" class="divide-y divide-charcoal/10">
            <li v-for="e in data.upcoming" :key="e.id">
              <NuxtLink :to="`/admin/enquiries/${e.id}`" class="flex items-center gap-4 px-5 py-3 transition hover:bg-cream/60">
                <div class="w-12 shrink-0 text-center">
                  <p class="font-serif text-2xl leading-none text-wine">{{ formatDate(e.eventDate, { day: 'numeric' }) }}</p>
                  <p class="text-[0.65rem] uppercase tracking-wider text-ink-muted">{{ formatDate(e.eventDate, { month: 'short' }) }}</p>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium">{{ e.fullName }}</p>
                  <p class="truncate text-xs text-ink-muted">{{ e.eventTypeLabel }}<span v-if="e.location"> · {{ e.location }}</span></p>
                </div>
                <StatusBadge :status="e.status" />
              </NuxtLink>
            </li>
          </ul>
          <p v-else class="p-6 text-sm text-ink-muted">No upcoming confirmed or in-progress events with dates.</p>
        </section>
      </div>

      <div class="mt-6 grid gap-6 xl:grid-cols-3">
        <section class="admin-card xl:col-span-2">
          <div class="border-b border-charcoal/10 px-5 py-4"><h2 class="font-serif text-2xl">Recent activity</h2></div>
          <ul v-if="data.activity.length" class="divide-y divide-charcoal/10">
            <li v-for="a in data.activity" :key="a.id" class="flex items-start gap-3 px-5 py-3 text-sm">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mocha" />
              <span class="flex-1">{{ a.summary }}</span>
              <span class="shrink-0 text-xs text-ink-muted">{{ relativeTime(a.createdAt) }}</span>
            </li>
          </ul>
          <p v-else class="p-6 text-sm text-ink-muted">No activity recorded yet.</p>
        </section>
        <section class="admin-card p-5">
          <h2 class="font-serif text-2xl">Website content</h2>
          <dl class="mt-4 space-y-3 text-sm">
            <div class="flex justify-between"><dt class="text-ink-muted">Published projects</dt><dd><NuxtLink to="/admin/portfolio" class="font-medium hover:text-wine">{{ data.stats.publishedProjects }}</NuxtLink></dd></div>
            <div class="flex justify-between"><dt class="text-ink-muted">Published services</dt><dd><NuxtLink to="/admin/services" class="font-medium hover:text-wine">{{ data.stats.publishedServices }}</NuxtLink></dd></div>
            <div class="flex justify-between"><dt class="text-ink-muted">Published testimonials</dt><dd><NuxtLink to="/admin/testimonials" class="font-medium hover:text-wine">{{ data.stats.publishedTestimonials }}</NuxtLink></dd></div>
          </dl>
          <div class="mt-6 flex flex-col gap-2">
            <NuxtLink to="/admin/portfolio/new" class="admin-btn-primary"><AppIcon name="plus" :size="16" /> New portfolio project</NuxtLink>
            <NuxtLink to="/admin/settings" class="admin-btn-secondary">Edit website content</NuxtLink>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
