<script setup lang="ts">
import { ENQUIRY_STATUSES } from '#shared/config/enquiry'
import { formatDate, relativeTime } from '#shared/utils/format'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Enquiries' })

const route = useRoute()
const router = useRouter()

const q = ref(String(route.query.q || ''))
const status = ref(String(route.query.status || ''))
const eventType = ref(String(route.query.eventType || ''))
const page = ref(Number(route.query.page) || 1)
const debouncedQ = ref(q.value)

let timer: ReturnType<typeof setTimeout> | undefined
watch(q, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => { debouncedQ.value = v; page.value = 1 }, 300)
})
watch([status, eventType], () => { page.value = 1 })

const query = computed(() => ({
  ...(debouncedQ.value ? { q: debouncedQ.value } : {}),
  ...(status.value ? { status: status.value } : {}),
  ...(eventType.value ? { eventType: eventType.value } : {}),
  ...(page.value > 1 ? { page: page.value } : {}),
}))
watch(query, v => router.replace({ query: v }))

const { data, status: fetchStatus, error } = await useFetch('/api/admin/enquiries', { key: 'admin-enquiries', query, watch: [query] })
</script>

<template>
  <div>
    <AdminPageHeader title="Enquiries" description="Every enquiry and contact message submitted through the website." />

    <div class="mb-4 flex flex-wrap gap-2">
      <button :class="['rounded-full border px-3 py-1.5 text-sm transition', !status ? 'border-wine bg-wine text-champagne' : 'border-charcoal/15 bg-white hover:border-charcoal/40']" @click="status = ''">All <span class="opacity-60">{{ data?.total ?? '' }}</span></button>
      <button
        v-for="s in ENQUIRY_STATUSES"
        :key="s.key"
        :class="['rounded-full border px-3 py-1.5 text-sm transition', status === s.key ? 'border-wine bg-wine text-champagne' : 'border-charcoal/15 bg-white hover:border-charcoal/40']"
        @click="status = s.key"
      >
        {{ s.label }} <span class="opacity-60">{{ data?.statusCounts?.[s.key] ?? 0 }}</span>
      </button>
    </div>

    <div class="admin-card mb-4 flex flex-col gap-3 p-3 sm:flex-row">
      <div class="relative flex-1">
        <AppIcon name="search" :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input v-model="q" type="search" class="admin-input !pl-9" placeholder="Search name, email, phone, reference or location" aria-label="Search enquiries">
      </div>
      <select v-model="eventType" class="admin-input sm:w-56" aria-label="Filter by event type">
        <option value="">All event types</option>
        <option v-for="t in data?.eventTypes || []" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <div v-if="error" class="admin-card p-6 text-danger">Could not load enquiries. {{ error.message }}</div>

    <div v-else class="admin-card relative overflow-hidden">
      <div v-if="fetchStatus === 'pending'" class="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-wine" />
      <div v-if="data?.items.length" class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-charcoal/10 bg-cream/50 text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th class="px-4 py-3 font-medium">Client</th>
              <th class="px-4 py-3 font-medium">Event</th>
              <th class="hidden px-4 py-3 font-medium md:table-cell">Date</th>
              <th class="hidden px-4 py-3 font-medium lg:table-cell">Budget</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="hidden px-4 py-3 text-right font-medium sm:table-cell">Received</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-charcoal/10">
            <tr v-for="e in data.items" :key="e.id" class="cursor-pointer transition hover:bg-cream/50" @click="navigateTo(`/admin/enquiries/${e.id}`)">
              <td class="px-4 py-3">
                <NuxtLink :to="`/admin/enquiries/${e.id}`" class="font-medium hover:text-wine" @click.stop>{{ e.fullName }}</NuxtLink>
                <p class="text-xs text-ink-muted">{{ e.reference }} · {{ e.email }}</p>
              </td>
              <td class="px-4 py-3">
                {{ e.eventTypeLabel }}
                <p class="text-xs text-ink-muted">
                  <span v-if="e.guestCount">{{ e.guestCount }} guests</span>
                  <span v-if="e._count.images"> · {{ e._count.images }} image{{ e._count.images > 1 ? 's' : '' }}</span>
                </p>
              </td>
              <td class="hidden px-4 py-3 md:table-cell">{{ e.eventDate ? formatDate(e.eventDate, { day: 'numeric', month: 'short', year: 'numeric' }) : (e.dateIsFlexible ? 'TBC' : '—') }}</td>
              <td class="hidden px-4 py-3 text-ink-muted lg:table-cell">{{ e.budgetLabel || '—' }}</td>
              <td class="px-4 py-3"><StatusBadge :status="e.status" /></td>
              <td class="hidden px-4 py-3 text-right text-xs text-ink-muted sm:table-cell">{{ relativeTime(e.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <AdminEmpty v-else-if="fetchStatus !== 'pending'" title="No enquiries found" :text="q || status || eventType ? 'Try clearing the search or filters.' : 'Enquiries submitted on the website will appear here.'" class="!border-0" />

      <div v-if="data && data.pages > 1" class="flex items-center justify-between border-t border-charcoal/10 px-4 py-3 text-sm">
        <span class="text-ink-muted">Page {{ data.page }} of {{ data.pages }}</span>
        <div class="flex gap-2">
          <button class="admin-btn-secondary !py-1.5" :disabled="page <= 1" @click="page--">Previous</button>
          <button class="admin-btn-secondary !py-1.5" :disabled="page >= data.pages" @click="page++">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
