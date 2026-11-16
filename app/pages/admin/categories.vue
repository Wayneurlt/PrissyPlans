<script setup lang="ts">
import { slugify } from '#shared/utils/format'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Categories' })

const toast = useToast()
const { data, refresh } = await useFetch('/api/admin/categories', { key: 'admin-categories' })

type Kind = 'event' | 'service'
const editing = ref<{ kind: Kind, id: string | null } | null>(null)
const form = reactive({ name: '', slug: '', description: '', sortOrder: 0, showInPortfolio: true, showInEnquiry: true, isActive: true })
const errors = ref<Record<string, string>>({})
const saving = ref(false)

watch(() => form.name, (n) => { if (editing.value && !editing.value.id) form.slug = slugify(n) })

function open(kind: Kind, row?: Record<string, unknown>) {
  errors.value = {}
  Object.assign(form, {
    name: (row?.name as string) ?? '',
    slug: (row?.slug as string) ?? '',
    description: (row?.description as string) ?? '',
    sortOrder: (row?.sortOrder as number) ?? 0,
    showInPortfolio: (row?.showInPortfolio as boolean) ?? true,
    showInEnquiry: (row?.showInEnquiry as boolean) ?? true,
    isActive: (row?.isActive as boolean) ?? true,
  })
  editing.value = { kind, id: (row?.id as string) ?? null }
}

async function save() {
  if (!editing.value) return
  saving.value = true
  errors.value = {}
  const { kind, id } = editing.value
  const body = kind === 'event' ? { ...form } : { name: form.name, slug: form.slug, description: form.description, sortOrder: form.sortOrder }
  try {
    await $fetch(id ? `/api/admin/categories/${kind}/${id}` : `/api/admin/categories/${kind}`, { method: id ? 'PUT' : 'POST', body })
    toast.success('Category saved')
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

async function remove(kind: Kind, row: { id: string, name: string }) {
  if (!confirm(`Delete the “${row.name}” category?`)) return
  try {
    await $fetch(`/api/admin/categories/${kind}/${row.id}`, { method: 'DELETE' })
    toast.success('Category deleted')
    await refresh()
  }
  catch (err) { toast.error('Could not delete', parseApiError(err).message) }
}
</script>

<template>
  <div>
    <AdminPageHeader title="Categories" description="Event categories drive the portfolio filter. Service categories group services." />

    <section v-if="editing" class="admin-card mb-6 p-6">
      <h2 class="mb-5 font-serif text-2xl">{{ editing.id ? 'Edit' : 'New' }} {{ editing.kind }} category</h2>
      <form novalidate class="grid gap-5 md:grid-cols-2" @submit.prevent="save">
        <AdminField id="cat-name" label="Name" :error="errors.name"><input id="cat-name" v-model="form.name" class="admin-input"></AdminField>
        <AdminField id="cat-slug" label="Slug" :error="errors.slug"><input id="cat-slug" v-model="form.slug" class="admin-input"></AdminField>
        <div class="md:col-span-2">
          <AdminField id="cat-desc" label="Description" :error="errors.description" optional><input id="cat-desc" v-model="form.description" class="admin-input"></AdminField>
        </div>
        <AdminField id="cat-order" label="Display order"><input id="cat-order" v-model="form.sortOrder" type="number" min="0" class="admin-input"></AdminField>
        <div v-if="editing.kind === 'event'" class="space-y-3">
          <AdminToggle v-model="form.isActive" label="Active" />
          <AdminToggle v-model="form.showInPortfolio" label="Show in portfolio filter" />
        </div>
        <div class="flex gap-3 md:col-span-2">
          <button type="submit" class="admin-btn-primary" :disabled="saving">Save</button>
          <button type="button" class="admin-btn-secondary" @click="editing = null">Cancel</button>
        </div>
      </form>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="admin-card">
        <div class="flex items-center justify-between border-b border-charcoal/10 px-5 py-4">
          <h2 class="font-serif text-2xl">Event categories</h2>
          <button class="admin-btn-secondary !py-1.5" @click="open('event')"><AppIcon name="plus" :size="14" /> Add</button>
        </div>
        <ul class="divide-y divide-charcoal/10">
          <li v-for="c in data?.eventCategories || []" :key="c.id" class="flex items-center gap-3 px-5 py-3">
            <div class="flex-1">
              <p class="font-medium">{{ c.name }} <span v-if="!c.isActive" class="text-xs text-ink-muted">(inactive)</span></p>
              <p class="text-xs text-ink-muted">{{ c.projectCount }} projects · {{ c.enquiryCount }} enquiries</p>
            </div>
            <button class="admin-btn-secondary !p-2" aria-label="Edit" @click="open('event', c)"><AppIcon name="edit" :size="14" /></button>
            <button class="admin-btn-secondary !p-2 hover:!text-danger" aria-label="Delete" @click="remove('event', c)"><AppIcon name="trash" :size="14" /></button>
          </li>
        </ul>
      </section>
      <section class="admin-card">
        <div class="flex items-center justify-between border-b border-charcoal/10 px-5 py-4">
          <h2 class="font-serif text-2xl">Service categories</h2>
          <button class="admin-btn-secondary !py-1.5" @click="open('service')"><AppIcon name="plus" :size="14" /> Add</button>
        </div>
        <ul class="divide-y divide-charcoal/10">
          <li v-for="c in data?.serviceCategories || []" :key="c.id" class="flex items-center gap-3 px-5 py-3">
            <div class="flex-1">
              <p class="font-medium">{{ c.name }}</p>
              <p class="text-xs text-ink-muted">{{ c.serviceCount }} services</p>
            </div>
            <button class="admin-btn-secondary !p-2" aria-label="Edit" @click="open('service', c)"><AppIcon name="edit" :size="14" /></button>
            <button class="admin-btn-secondary !p-2 hover:!text-danger" aria-label="Delete" @click="remove('service', c)"><AppIcon name="trash" :size="14" /></button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
