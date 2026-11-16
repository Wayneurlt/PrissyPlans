<script setup lang="ts">
import { formatDate } from '#shared/utils/format'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Portfolio' })

const toast = useToast()
const { data: projects, refresh, status } = await useFetch('/api/admin/portfolio', { key: 'admin-portfolio', default: () => [] })
const busy = ref<string | null>(null)

async function togglePublish(p: (typeof projects.value)[number]) {
  busy.value = p.id
  try {
    const full = await $fetch<Record<string, unknown>>(`/api/admin/portfolio/${p.id}`)
    await $fetch(`/api/admin/portfolio/${p.id}`, { method: 'PUT', body: { ...pickProject(full), isPublished: !p.isPublished } })
    await refresh()
  }
  catch (err) { toast.error('Could not update', parseApiError(err).message) }
  finally { busy.value = null }
}

async function move(index: number, delta: number) {
  const j = index + delta
  if (j < 0 || j >= projects.value.length) return
  const list = [...projects.value]
  ;[list[index], list[j]] = [list[j]!, list[index]!]
  projects.value = list
  try { await $fetch('/api/admin/portfolio/reorder', { method: 'PATCH', body: { ids: list.map(p => p.id) } }) }
  catch (err) { toast.error('Could not reorder', parseApiError(err).message); await refresh() }
}

async function remove(p: (typeof projects.value)[number]) {
  if (!confirm(`Delete “${p.title}” and all its images? This cannot be undone.`)) return
  busy.value = p.id
  try {
    await $fetch(`/api/admin/portfolio/${p.id}`, { method: 'DELETE' })
    toast.success('Project deleted')
    await refresh()
  }
  catch (err) { toast.error('Could not delete', parseApiError(err).message) }
  finally { busy.value = null }
}
</script>

<template>
  <div>
    <AdminPageHeader title="Portfolio" description="Create projects, upload photographs and choose what appears on the website.">
      <template #actions>
        <NuxtLink to="/admin/portfolio/new" class="admin-btn-primary"><AppIcon name="plus" :size="16" /> New project</NuxtLink>
      </template>
    </AdminPageHeader>

    <div v-if="projects.some(p => p.isSample)" class="mb-6 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm">
      <AppIcon name="info" :size="18" class="mt-0.5 shrink-0 text-[#7a5212]" />
      <p>Projects marked <strong>Sample</strong> were seeded with placeholder stock imagery to preview the layout. Replace them with real projects, or unpublish or delete them before launch.</p>
    </div>

    <div v-if="projects.length" class="admin-card divide-y divide-charcoal/10">
      <div v-for="(p, i) in projects" :key="p.id" :class="['flex flex-wrap items-center gap-4 p-4', busy === p.id ? 'opacity-50' : '']">
        <div class="flex flex-col gap-1">
          <button class="admin-btn-secondary !p-1" :disabled="i === 0" aria-label="Move up" @click="move(i, -1)"><AppIcon name="chevron-down" :size="14" class="rotate-180" /></button>
          <button class="admin-btn-secondary !p-1" :disabled="i === projects.length - 1" aria-label="Move down" @click="move(i, 1)"><AppIcon name="chevron-down" :size="14" /></button>
        </div>
        <NuxtLink :to="`/admin/portfolio/${p.id}`" class="h-16 w-24 shrink-0 overflow-hidden rounded bg-rose/20">
          <AppImage :media="p.coverMedia" sizes="96px" />
        </NuxtLink>
        <div class="min-w-0 flex-1">
          <NuxtLink :to="`/admin/portfolio/${p.id}`" class="font-medium hover:text-wine">{{ p.title }}</NuxtLink>
          <p class="text-xs text-ink-muted">
            {{ p.category?.name || 'Uncategorised' }} · {{ p.imageCount }} image{{ p.imageCount === 1 ? '' : 's' }}<span v-if="p.eventDate"> · {{ formatDate(p.eventDate, { month: 'short', year: 'numeric' }) }}</span>
          </p>
          <div class="mt-1 flex flex-wrap gap-1.5">
            <span v-if="p.isFeatured" class="rounded-full bg-gold/20 px-2 py-0.5 text-[0.65rem] text-[#7a5d22]">Featured</span>
            <span v-if="p.isSample" class="rounded-full bg-warning/15 px-2 py-0.5 text-[0.65rem] text-[#7a5212]">Sample</span>
          </div>
        </div>
        <button :class="['rounded-full px-3 py-1 text-xs font-medium', p.isPublished ? 'bg-success/12 text-success' : 'bg-charcoal/10 text-charcoal/70']" :disabled="busy === p.id" :title="p.isPublished ? 'Click to unpublish' : 'Click to publish'" @click="togglePublish(p)">
          {{ p.isPublished ? 'Published' : 'Draft' }}
        </button>
        <div class="flex gap-2">
          <a v-if="p.isPublished" :href="`/portfolio/${p.slug}`" target="_blank" class="admin-btn-secondary !p-2" aria-label="View on website"><AppIcon name="external" :size="16" /></a>
          <NuxtLink :to="`/admin/portfolio/${p.id}`" class="admin-btn-secondary !p-2" aria-label="Edit"><AppIcon name="edit" :size="16" /></NuxtLink>
          <button class="admin-btn-secondary !p-2 hover:!text-danger" aria-label="Delete" @click="remove(p)"><AppIcon name="trash" :size="16" /></button>
        </div>
      </div>
    </div>
    <AdminEmpty v-else-if="status !== 'pending'" icon="grid" title="No portfolio projects yet" text="Create your first project and upload photographs from the event.">
      <NuxtLink to="/admin/portfolio/new" class="admin-btn-primary"><AppIcon name="plus" :size="16" /> New project</NuxtLink>
    </AdminEmpty>
  </div>
</template>
