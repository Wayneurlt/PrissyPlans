<script setup lang="ts">
import { toDateInputValue } from '#shared/utils/format'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Testimonials' })

const toast = useToast()
const { data: testimonials, refresh, status } = await useFetch('/api/admin/testimonials', { key: 'admin-testimonials', default: () => [] })
const { data: settings } = await useFetch('/api/admin/settings', { key: 'admin-settings' })

type Row = (typeof testimonials.value)[number]

const blank = () => ({ clientName: '', eventType: '', quote: '', rating: '' as number | '', eventDate: '', photoMediaId: '', photoUrl: '', isPublished: false, sortOrder: 0 })
const editing = ref<string | 'new' | null>(null)
const form = reactive(blank())
const errors = ref<Record<string, string>>({})
const saving = ref(false)
const uploading = ref(false)

function startNew() {
  Object.assign(form, blank())
  errors.value = {}
  editing.value = 'new'
}

function startEdit(t: Row) {
  Object.assign(form, {
    clientName: t.clientName,
    eventType: t.eventType ?? '',
    quote: t.quote,
    rating: t.rating ?? '',
    eventDate: toDateInputValue(t.eventDate),
    photoMediaId: t.photoMediaId ?? '',
    photoUrl: t.photoMedia?.url ?? '',
    isPublished: t.isPublished,
    sortOrder: t.sortOrder,
  })
  errors.value = {}
  editing.value = t.id
}

async function uploadPhoto(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const body = new FormData()
  body.append('files', file, file.name)
  uploading.value = true
  try {
    const [media] = await $fetch<Array<{ id: string, url: string }>>('/api/admin/media/upload?folder=testimonials', { method: 'POST', body })
    if (media) { form.photoMediaId = media.id; form.photoUrl = media.url }
  }
  catch (err) { toast.error('Upload failed', parseApiError(err).message) }
  finally { uploading.value = false; input.value = '' }
}

async function save() {
  saving.value = true
  errors.value = {}
  try {
    const { photoUrl, ...body } = form
    void photoUrl
    if (editing.value === 'new') await $fetch('/api/admin/testimonials', { method: 'POST', body })
    else await $fetch(`/api/admin/testimonials/${editing.value}`, { method: 'PUT', body })
    toast.success('Testimonial saved')
    editing.value = null
    await refresh()
  }
  catch (err) {
    const { message, fieldErrors } = parseApiError(err)
    errors.value = fieldErrors
    toast.error('Could not save', message)
  }
  finally { saving.value = false }
}

async function togglePublish(t: Row) {
  try {
    await $fetch(`/api/admin/testimonials/${t.id}`, {
      method: 'PUT',
      body: { clientName: t.clientName, eventType: t.eventType ?? '', quote: t.quote, rating: t.rating ?? '', eventDate: toDateInputValue(t.eventDate), photoMediaId: t.photoMediaId ?? '', isPublished: !t.isPublished, sortOrder: t.sortOrder },
    })
    await refresh()
  }
  catch (err) { toast.error('Could not update', parseApiError(err).message) }
}

async function remove(t: Row) {
  if (!confirm(`Delete the testimonial from ${t.clientName}?`)) return
  try {
    await $fetch(`/api/admin/testimonials/${t.id}`, { method: 'DELETE' })
    toast.success('Testimonial deleted')
    if (editing.value === t.id) editing.value = null
    await refresh()
  }
  catch (err) { toast.error('Could not delete', parseApiError(err).message) }
}
</script>

<template>
  <div>
    <AdminPageHeader title="Testimonials" description="Only add genuine client feedback, with the client's permission. The homepage section stays hidden until at least one is published.">
      <template #actions>
        <button class="admin-btn-primary" @click="startNew"><AppIcon name="plus" :size="16" /> Add testimonial</button>
      </template>
    </AdminPageHeader>

    <section v-if="editing" class="admin-card mb-6 p-6">
      <h2 class="mb-5 font-serif text-2xl">{{ editing === 'new' ? 'New testimonial' : 'Edit testimonial' }}</h2>
      <form novalidate class="grid gap-5 md:grid-cols-2" @submit.prevent="save">
        <AdminField id="t-name" label="Client name" :error="errors.clientName">
          <input id="t-name" v-model="form.clientName" class="admin-input" placeholder="e.g. Amina & David">
        </AdminField>
        <AdminField id="t-type" label="Event type" :error="errors.eventType" optional>
          <input id="t-type" v-model="form.eventType" class="admin-input" placeholder="e.g. Wedding, Nairobi">
        </AdminField>
        <div class="md:col-span-2">
          <AdminField id="t-quote" label="Quote" :error="errors.quote">
            <textarea id="t-quote" v-model="form.quote" class="admin-input min-h-28" />
          </AdminField>
        </div>
        <AdminField id="t-rating" label="Rating" :error="errors.rating" optional>
          <select id="t-rating" v-model="form.rating" class="admin-input">
            <option value="">No rating</option>
            <option v-for="n in 5" :key="n" :value="n">{{ n }} star{{ n > 1 ? 's' : '' }}</option>
          </select>
        </AdminField>
        <AdminField id="t-date" label="Event date" :error="errors.eventDate" optional>
          <input id="t-date" v-model="form.eventDate" type="date" class="admin-input">
        </AdminField>
        <div>
          <p class="admin-label">Client photo <span class="font-normal text-charcoal/40">(optional)</span></p>
          <div class="flex items-center gap-3">
            <div class="h-14 w-14 overflow-hidden rounded-full bg-rose/30">
              <img v-if="form.photoUrl" :src="form.photoUrl" alt="" class="h-full w-full object-cover">
            </div>
            <label v-if="settings?.env.uploads" class="admin-btn-secondary cursor-pointer">
              <AppIcon :name="uploading ? 'spinner' : 'upload'" :size="16" /> {{ form.photoUrl ? 'Replace' : 'Upload' }}
              <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" @change="uploadPhoto">
            </label>
            <button v-if="form.photoUrl" type="button" class="text-sm text-danger" @click="form.photoMediaId = ''; form.photoUrl = ''">Remove</button>
            <span v-if="!settings?.env.uploads" class="text-xs text-ink-muted">Uploads need Cloudinary.</span>
          </div>
        </div>
        <div class="space-y-4">
          <AdminToggle v-model="form.isPublished" label="Published" />
          <AdminField id="t-order" label="Display order">
            <input id="t-order" v-model="form.sortOrder" type="number" min="0" class="admin-input">
          </AdminField>
        </div>
        <div class="flex gap-3 md:col-span-2">
          <button type="submit" class="admin-btn-primary" :disabled="saving"><AppIcon v-if="saving" name="spinner" :size="16" /> Save</button>
          <button type="button" class="admin-btn-secondary" @click="editing = null">Cancel</button>
        </div>
      </form>
    </section>

    <div v-if="testimonials.length" class="grid gap-4 md:grid-cols-2">
      <article v-for="t in testimonials" :key="t.id" class="admin-card flex flex-col p-5">
        <p class="flex-1 font-serif text-lg leading-snug">“{{ t.quote }}”</p>
        <div class="mt-4 flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-medium">{{ t.clientName }}</p>
            <p class="text-xs text-ink-muted">{{ t.eventType }}<span v-if="t.rating"> · {{ t.rating }}/5</span></p>
          </div>
          <div class="flex items-center gap-2">
            <button :class="['rounded-full px-3 py-1 text-xs font-medium', t.isPublished ? 'bg-success/12 text-success' : 'bg-charcoal/10 text-charcoal/70']" @click="togglePublish(t)">{{ t.isPublished ? 'Published' : 'Draft' }}</button>
            <button class="admin-btn-secondary !p-2" aria-label="Edit" @click="startEdit(t)"><AppIcon name="edit" :size="16" /></button>
            <button class="admin-btn-secondary !p-2 hover:!text-danger" aria-label="Delete" @click="remove(t)"><AppIcon name="trash" :size="16" /></button>
          </div>
        </div>
      </article>
    </div>
    <AdminEmpty v-else-if="status !== 'pending' && !editing" icon="quote" title="No testimonials yet" text="When clients share feedback, add it here and publish it to show the testimonials section on the homepage.">
      <button class="admin-btn-primary" @click="startNew"><AppIcon name="plus" :size="16" /> Add testimonial</button>
    </AdminEmpty>
  </div>
</template>
