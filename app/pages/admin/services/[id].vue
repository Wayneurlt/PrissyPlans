<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const id = String(route.params.id)
const { data: service, refresh, error } = await useFetch(`/api/admin/services/${id}` as '/api/admin/services/:id', { key: `admin-service-${id}` })
const { data: settings } = await useFetch('/api/admin/settings', { key: 'admin-settings' })
useHead({ title: () => service.value?.name || 'Service' })

const formKey = ref(0)
async function onSaved() {
  await refresh()
  formKey.value++
}
</script>

<template>
  <div>
    <div v-if="error" class="admin-card p-6 text-danger">Service not found.</div>
    <template v-else-if="service">
      <AdminPageHeader :title="service.name" back="/admin/services">
        <template #actions>
          <a v-if="service.isPublished" :href="`/services/${service.slug}`" target="_blank" class="admin-btn-secondary"><AppIcon name="external" :size="16" /> View on site</a>
        </template>
      </AdminPageHeader>

      <section class="admin-card mb-6 p-6">
        <h2 class="mb-1 font-serif text-2xl">Images</h2>
        <p class="mb-5 text-sm text-ink-muted">The cover appears on service cards and the page header. Extra images form the service gallery.</p>
        <AdminImageManager
          :endpoint="`/api/admin/services/${id}`"
          :images="service.images"
          :cover-media-id="service.coverMediaId"
          :uploads-enabled="Boolean(settings?.env.uploads)"
          @changed="refresh"
        />
      </section>

      <ServiceForm :key="formKey" :initial="service" @saved="onSaved" />
    </template>
  </div>
</template>
