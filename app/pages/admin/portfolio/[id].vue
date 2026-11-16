<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const id = String(route.params.id)
const { data: project, refresh, error } = await useFetch(`/api/admin/portfolio/${id}` as '/api/admin/portfolio/:id', { key: `admin-project-${id}` })
const { data: settings } = await useFetch('/api/admin/settings', { key: 'admin-settings' })
useHead({ title: () => project.value?.title || 'Project' })

const formKey = ref(0)
async function onSaved() {
  await refresh()
  formKey.value++
}
</script>

<template>
  <div>
    <div v-if="error" class="admin-card p-6 text-danger">Project not found.</div>
    <template v-else-if="project">
      <AdminPageHeader :title="project.title" back="/admin/portfolio">
        <template #actions>
          <a v-if="project.isPublished" :href="`/portfolio/${project.slug}`" target="_blank" class="admin-btn-secondary"><AppIcon name="external" :size="16" /> View on site</a>
        </template>
      </AdminPageHeader>

      <section class="admin-card mb-6 p-6">
        <h2 class="mb-1 font-serif text-2xl">Photographs</h2>
        <p class="mb-5 text-sm text-ink-muted">The cover image is used on cards and as the page header. Order controls the gallery sequence.</p>
        <AdminImageManager
          :endpoint="`/api/admin/portfolio/${id}`"
          :images="project.images"
          :cover-media-id="project.coverMediaId"
          :uploads-enabled="Boolean(settings?.env.uploads)"
          with-captions
          @changed="refresh"
        />
      </section>

      <PortfolioForm :key="formKey" :initial="project" @saved="onSaved" />
    </template>
  </div>
</template>
