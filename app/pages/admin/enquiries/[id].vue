<script setup lang="ts">
import { CONTACT_METHODS, ENQUIRY_STATUSES } from '#shared/config/enquiry'
import { formatDate, formatDateTime, toDateInputValue } from '#shared/utils/format'
import { buildWhatsAppLink } from '#shared/utils/whatsapp'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const toast = useToast()
const id = String(route.params.id)
const { data: enquiry, refresh, error } = await useFetch(`/api/admin/enquiries/${id}` as '/api/admin/enquiries/:id', { key: `admin-enquiry-${id}` })
useHead({ title: () => enquiry.value ? `${enquiry.value.reference} · ${enquiry.value.fullName}` : 'Enquiry' })

const statusDraft = ref(enquiry.value?.status ?? 'NEW')
const statusNote = ref('')
const followUp = ref(toDateInputValue(enquiry.value?.followUpAt))
const savingStatus = ref(false)
watch(enquiry, (e) => {
  if (!e) return
  statusDraft.value = e.status
  followUp.value = toDateInputValue(e.followUpAt)
})

const noteBody = ref('')
const noteType = ref<'NOTE' | 'FOLLOW_UP'>('NOTE')
const noteFollowUp = ref('')
const savingNote = ref(false)
const deleting = ref(false)
const lightboxIndex = ref<number | null>(null)

const gallery = computed(() => (enquiry.value?.images ?? []).map(i => ({ media: i.media, caption: null })))
const contactLabel = computed(() => CONTACT_METHODS.find(c => c.key === enquiry.value?.preferredContact)?.label)
const whatsappHref = computed(() => enquiry.value?.phone ? buildWhatsAppLink(enquiry.value.phone, `Hello ${enquiry.value.fullName.split(' ')[0]}, thank you for your enquiry (${enquiry.value.reference}) with Prissy Plans Events.`) : '')

const details = computed(() => {
  const e = enquiry.value
  if (!e) return []
  return [
    ['Event type', e.eventTypeOther ? `${e.eventTypeLabel} — ${e.eventTypeOther}` : e.eventTypeLabel],
    ['Event date', e.eventDate ? formatDate(e.eventDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : (e.dateIsFlexible ? 'Not yet confirmed' : '—')],
    ['Location', e.location || '—'],
    ['Venue', e.venue || (e.venueNotConfirmed ? 'Not yet confirmed' : '—')],
    ['Guests', e.guestCount ? String(e.guestCount) : '—'],
    ['Services', e.services.map(s => s.label).join(', ') || '—'],
    ['Budget range', e.budgetLabel || '—'],
    ['Theme', e.theme || '—'],
    ['Colours', e.colours || '—'],
  ] as Array<[string, string]>
})

async function saveStatus() {
  savingStatus.value = true
  try {
    await $fetch(`/api/admin/enquiries/${id}`, {
      method: 'PATCH',
      body: { status: statusDraft.value, note: statusNote.value || undefined, followUpAt: followUp.value },
    })
    statusNote.value = ''
    toast.success('Enquiry updated')
    await refresh()
  }
  catch (err) { toast.error('Could not update', parseApiError(err).message) }
  finally { savingStatus.value = false }
}

async function addNote() {
  if (!noteBody.value.trim()) return
  savingNote.value = true
  try {
    await $fetch(`/api/admin/enquiries/${id}/notes`, { method: 'POST', body: { body: noteBody.value, type: noteType.value, followUpAt: noteType.value === 'FOLLOW_UP' ? noteFollowUp.value : '' } })
    noteBody.value = ''
    noteFollowUp.value = ''
    noteType.value = 'NOTE'
    toast.success('Note added')
    await refresh()
  }
  catch (err) { toast.error('Could not add note', parseApiError(err).message) }
  finally { savingNote.value = false }
}

async function remove() {
  if (!confirm(`Delete enquiry ${enquiry.value?.reference}? This permanently removes the enquiry, its notes and uploaded images.`)) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/enquiries/${id}`, { method: 'DELETE' })
    toast.success('Enquiry deleted')
    await navigateTo('/admin/enquiries')
  }
  catch (err) { toast.error('Could not delete', parseApiError(err).message) }
  finally { deleting.value = false }
}

const noteIcons: Record<string, string> = { NOTE: 'edit', FOLLOW_UP: 'calendar', STATUS_CHANGE: 'refresh' }
</script>

<template>
  <div>
    <div v-if="error" class="admin-card p-6">
      <p class="text-danger">{{ error.statusCode === 404 ? 'This enquiry does not exist or was deleted.' : error.message }}</p>
      <NuxtLink to="/admin/enquiries" class="admin-btn-secondary mt-4">Back to enquiries</NuxtLink>
    </div>

    <template v-else-if="enquiry">
      <AdminPageHeader :title="enquiry.fullName" :description="`${enquiry.reference} · received ${formatDateTime(enquiry.createdAt)}`" back="/admin/enquiries">
        <template #actions>
          <StatusBadge :status="enquiry.status" class="self-center" />
          <button class="admin-btn-danger" :disabled="deleting" @click="remove"><AppIcon name="trash" :size="16" /> Delete</button>
        </template>
      </AdminPageHeader>

      <div class="grid gap-6 xl:grid-cols-3">
        <div class="space-y-6 xl:col-span-2">
          <section class="admin-card p-6">
            <h2 class="mb-4 font-serif text-2xl">Event details</h2>
            <dl class="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <div v-for="[k, v] in details" :key="k">
                <dt class="text-xs uppercase tracking-wider text-ink-muted">{{ k }}</dt>
                <dd class="mt-1 text-sm">{{ v }}</dd>
              </div>
            </dl>
          </section>

          <section class="admin-card p-6">
            <h2 class="mb-3 font-serif text-2xl">{{ enquiry.eventTypeLabel === 'General enquiry' ? 'Message' : 'Their vision' }}</h2>
            <p class="whitespace-pre-line text-[0.95rem] leading-relaxed text-charcoal/90">{{ enquiry.vision }}</p>
            <template v-if="enquiry.additionalRequests">
              <h3 class="mb-2 mt-6 text-xs uppercase tracking-wider text-ink-muted">Additional requirements</h3>
              <p class="whitespace-pre-line text-sm leading-relaxed">{{ enquiry.additionalRequests }}</p>
            </template>
          </section>

          <section v-if="gallery.length" class="admin-card p-6">
            <h2 class="mb-4 font-serif text-2xl">Inspiration images</h2>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button v-for="(img, i) in gallery" :key="i" class="aspect-square overflow-hidden rounded-md bg-rose/20" :aria-label="`Open image ${i + 1}`" @click="lightboxIndex = i">
                <AppImage :media="img.media" sizes="200px" />
              </button>
            </div>
            <ImageLightbox v-model="lightboxIndex" :images="gallery" />
          </section>

          <section class="admin-card p-6">
            <h2 class="mb-4 font-serif text-2xl">Notes & follow-ups</h2>
            <form class="space-y-3 rounded-md bg-cream/60 p-4" @submit.prevent="addNote">
              <textarea v-model="noteBody" class="admin-input min-h-24" placeholder="Add an internal note: call summary, ideas, next steps…" aria-label="Note" />
              <div class="flex flex-wrap items-center gap-3">
                <select v-model="noteType" class="admin-input !w-auto" aria-label="Note type">
                  <option value="NOTE">Note</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                </select>
                <input v-if="noteType === 'FOLLOW_UP'" v-model="noteFollowUp" type="date" class="admin-input !w-auto" aria-label="Follow-up date">
                <button type="submit" class="admin-btn-primary ml-auto" :disabled="savingNote || !noteBody.trim()"><AppIcon v-if="savingNote" name="spinner" :size="16" /> Add note</button>
              </div>
            </form>
            <ol v-if="enquiry.notes.length" class="mt-6 space-y-4">
              <li v-for="n in enquiry.notes" :key="n.id" class="flex gap-3">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-mocha"><AppIcon :name="noteIcons[n.type] || 'edit'" :size="14" /></span>
                <div class="flex-1">
                  <p class="whitespace-pre-line text-sm">{{ n.body }}</p>
                  <p class="mt-1 text-xs text-ink-muted">
                    {{ n.author }} · {{ formatDateTime(n.createdAt) }}
                    <span v-if="n.followUpAt" class="ml-1 rounded bg-gold/20 px-1.5 py-0.5 text-[#7a5d22]">Follow up {{ formatDate(n.followUpAt) }}</span>
                  </p>
                </div>
              </li>
            </ol>
            <p v-else class="mt-4 text-sm text-ink-muted">No notes yet.</p>
          </section>
        </div>

        <div class="space-y-6">
          <section class="admin-card p-6">
            <h2 class="mb-4 font-serif text-2xl">Client</h2>
            <dl class="space-y-3 text-sm">
              <div><dt class="text-xs uppercase tracking-wider text-ink-muted">Email</dt><dd class="mt-0.5 break-all"><a :href="`mailto:${enquiry.email}?subject=${encodeURIComponent(`Your enquiry ${enquiry.reference}`)}`" class="hover:text-wine">{{ enquiry.email }}</a></dd></div>
              <div v-if="enquiry.phone"><dt class="text-xs uppercase tracking-wider text-ink-muted">Phone</dt><dd class="mt-0.5"><a :href="`tel:${enquiry.phone.replace(/\s+/g, '')}`" class="hover:text-wine">{{ enquiry.phone }}</a></dd></div>
              <div><dt class="text-xs uppercase tracking-wider text-ink-muted">Prefers</dt><dd class="mt-0.5">{{ contactLabel }}</dd></div>
            </dl>
            <div class="mt-5 flex flex-col gap-2">
              <a v-if="whatsappHref" :href="whatsappHref" target="_blank" rel="noopener noreferrer" class="admin-btn bg-whatsapp text-white hover:bg-[#1ebe5b]"><AppIcon name="whatsapp" :size="16" /> WhatsApp client</a>
              <a :href="`mailto:${enquiry.email}?subject=${encodeURIComponent(`Your enquiry ${enquiry.reference}`)}`" class="admin-btn-secondary"><AppIcon name="mail" :size="16" /> Email client</a>
            </div>
          </section>

          <section class="admin-card p-6">
            <h2 class="mb-4 font-serif text-2xl">Status</h2>
            <form class="space-y-4" @submit.prevent="saveStatus">
              <AdminField id="status" label="Pipeline stage">
                <select id="status" v-model="statusDraft" class="admin-input">
                  <option v-for="s in ENQUIRY_STATUSES" :key="s.key" :value="s.key">{{ s.label }}</option>
                </select>
              </AdminField>
              <AdminField id="followup" label="Next follow-up" optional>
                <input id="followup" v-model="followUp" type="date" class="admin-input">
              </AdminField>
              <AdminField id="status-note" label="Note for this change" optional>
                <input id="status-note" v-model="statusNote" class="admin-input" placeholder="e.g. Consultation booked for Tuesday">
              </AdminField>
              <button type="submit" class="admin-btn-primary w-full" :disabled="savingStatus"><AppIcon v-if="savingStatus" name="spinner" :size="16" /> Save</button>
            </form>
          </section>

          <section class="admin-card p-6 text-xs text-ink-muted">
            <h2 class="mb-3 text-xs uppercase tracking-wider">Record</h2>
            <dl class="space-y-1.5">
              <div class="flex justify-between gap-3"><dt>Source</dt><dd class="text-right">{{ enquiry.sourcePage || '—' }}</dd></div>
              <div class="flex justify-between gap-3"><dt>First contacted</dt><dd>{{ enquiry.contactedAt ? formatDateTime(enquiry.contactedAt) : '—' }}</dd></div>
              <div class="flex justify-between gap-3"><dt>Admin notified</dt><dd>{{ enquiry.adminNotifiedAt ? formatDateTime(enquiry.adminNotifiedAt) : 'Not sent' }}</dd></div>
              <div class="flex justify-between gap-3"><dt>Client confirmation</dt><dd>{{ enquiry.clientNotifiedAt ? formatDateTime(enquiry.clientNotifiedAt) : 'Not sent' }}</dd></div>
              <div class="flex justify-between gap-3"><dt>Last activity</dt><dd>{{ formatDateTime(enquiry.lastActivityAt) }}</dd></div>
            </dl>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>
