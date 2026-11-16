<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Services' })

const toast = useToast()
const { data: services, refresh, status } = await useFetch('/api/admin/services', { key: 'admin-services', default: () => [] })
const busy = ref<string | null>(null)

async function togglePublish(s: (typeof services.value)[number]) {
  busy.value = s.id
  try {
    const full = await $fetch<Record<string, unknown>>(`/api/admin/services/${s.id}`)
    await $fetch(`/api/admin/services/${s.id}`, { method: 'PUT', body: { ...pickService(full), isPublished: !s.isPublished } })
    await refresh()
  }
  catch (err) { toast.error('Could not update', parseApiError(err).message) }
  finally { busy.value = null }
}

async function move(index: number, delta: number) {
  const j = index + delta
  if (j < 0 || j >= services.value.length) return
  const list = [...services.value]
  ;[list[index], list[j]] = [list[j]!, list[index]!]
  services.value = list
  try { await $fetch('/api/admin/services/reorder', { method: 'PATCH', body: { ids: list.map(s => s.id) } }) }
  catch (err) { toast.error('Could not reorder', parseApiError(err).message); await refresh() }
}

async function remove(s: (typeof services.value)[number]) {
  if (!confirm(`Delete the “${s.name}” service? Past enquiries keep their record of it.`)) return
  busy.value = s.id
  try {
    await $fetch(`/api/admin/services/${s.id}`, { method: 'DELETE' })
    toast.success('Service deleted')
    await refresh()
  }
  catch (err) { toast.error('Could not delete', parseApiError(err).message) }
  finally { busy.value = null }
}
</script>

<template>
  <div>
    <AdminPageHeader title="Services" description="Edit service descriptions, images and ordering.">
      <template #actions>
        <NuxtLink to="/admin/services/new" class="admin-btn-primary"><AppIcon name="plus" :size="16" /> New service</NuxtLink>
      </template>
    </AdminPageHeader>

    <div v-if="services.length" class="admin-card divide-y divide-charcoal/10">
      <div v-for="(s, i) in services" :key="s.id" :class="['flex flex-wrap items-center gap-4 p-4', busy === s.id ? 'opacity-50' : '']">
        <div class="flex flex-col gap-1">
          <button class="admin-btn-secondary !p-1" :disabled="i === 0" aria-label="Move up" @click="move(i, -1)"><AppIcon name="chevron-down" :size="14" class="rotate-180" /></button>
          <button class="admin-btn-secondary !p-1" :disabled="i === services.length - 1" aria-label="Move down" @click="move(i, 1)"><AppIcon name="chevron-down" :size="14" /></button>
        </div>
        <NuxtLink :to="`/admin/services/${s.id}`" class="h-16 w-24 shrink-0 overflow-hidden rounded bg-rose/20">
          <AppImage :media="s.coverMedia" sizes="96px" />
        </NuxtLink>
        <div class="min-w-0 flex-1">
          <NuxtLink :to="`/admin/services/${s.id}`" class="font-medium hover:text-wine">{{ s.name }}</NuxtLink>
          <p class="line-clamp-1 text-xs text-ink-muted">{{ s.category?.name ? `${s.category.name} · ` : '' }}{{ s.summary }}</p>
          <span v-if="s.coverMedia?.isPlaceholder" class="mt-1 inline-block rounded-full bg-warning/15 px-2 py-0.5 text-[0.65rem] text-[#7a5212]">Placeholder image</span>
        </div>
        <button :class="['rounded-full px-3 py-1 text-xs font-medium', s.isPublished ? 'bg-success/12 text-success' : 'bg-charcoal/10 text-charcoal/70']" :disabled="busy === s.id" @click="togglePublish(s)">
          {{ s.isPublished ? 'Published' : 'Draft' }}
        </button>
        <div class="flex gap-2">
          <a v-if="s.isPublished" :href="`/services/${s.slug}`" target="_blank" class="admin-btn-secondary !p-2" aria-label="View on website"><AppIcon name="external" :size="16" /></a>
          <NuxtLink :to="`/admin/services/${s.id}`" class="admin-btn-secondary !p-2" aria-label="Edit"><AppIcon name="edit" :size="16" /></NuxtLink>
          <button class="admin-btn-secondary !p-2 hover:!text-danger" aria-label="Delete" @click="remove(s)"><AppIcon name="trash" :size="16" /></button>
        </div>
      </div>
    </div>
    <AdminEmpty v-else-if="status !== 'pending'" icon="briefcase" title="No services yet" text="Run the seed script or create your first service.">
      <NuxtLink to="/admin/services/new" class="admin-btn-primary"><AppIcon name="plus" :size="16" /> New service</NuxtLink>
    </AdminEmpty>
  </div>
</template>
