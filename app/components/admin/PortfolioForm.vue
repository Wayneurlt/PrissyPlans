<script setup lang="ts">
import { slugify, toDateInputValue } from '#shared/utils/format'

interface ProjectData {
  id?: string
  title: string
  slug: string
  summary: string | null
  description: string | null
  categoryId: string | null
  eventDate: string | Date | null
  location: string | null
  venue: string | null
  guestCount: number | null
  coverMediaId: string | null
  isPublished: boolean
  isFeatured: boolean
  isSample: boolean
  sortOrder: number
  seoTitle: string | null
  seoDescription: string | null
}

const props = defineProps<{ initial?: Partial<ProjectData> | null }>()
const emit = defineEmits<{ saved: [result: { id: string }] }>()
const toast = useToast()

const { data: categories } = await useFetch('/api/admin/categories', { key: 'admin-categories' })

const form = reactive({
  title: props.initial?.title ?? '',
  slug: props.initial?.slug ?? '',
  summary: props.initial?.summary ?? '',
  description: props.initial?.description ?? '',
  categoryId: props.initial?.categoryId ?? '',
  eventDate: toDateInputValue(props.initial?.eventDate ?? null),
  location: props.initial?.location ?? '',
  venue: props.initial?.venue ?? '',
  guestCount: props.initial?.guestCount ?? ('' as number | ''),
  coverMediaId: props.initial?.coverMediaId ?? '',
  isPublished: props.initial?.isPublished ?? false,
  isFeatured: props.initial?.isFeatured ?? false,
  isSample: props.initial?.isSample ?? false,
  sortOrder: props.initial?.sortOrder ?? 0,
  seoTitle: props.initial?.seoTitle ?? '',
  seoDescription: props.initial?.seoDescription ?? '',
})
const slugTouched = ref(Boolean(props.initial?.slug))
watch(() => form.title, (t) => { if (!slugTouched.value) form.slug = slugify(t) })

const errors = ref<Record<string, string>>({})
const saving = ref(false)

async function save() {
  errors.value = {}
  saving.value = true
  try {
    const url = props.initial?.id ? `/api/admin/portfolio/${props.initial.id}` : '/api/admin/portfolio'
    const result = await $fetch<{ id: string }>(url, { method: props.initial?.id ? 'PUT' : 'POST', body: { ...form } })
    toast.success(props.initial?.id ? 'Project saved' : 'Project created')
    emit('saved', result)
  }
  catch (err) {
    const { message, fieldErrors } = parseApiError(err)
    errors.value = fieldErrors
    toast.error('Could not save project', message)
  }
  finally { saving.value = false }
}
</script>

<template>
  <form novalidate class="grid gap-6 xl:grid-cols-3" @submit.prevent="save">
    <div class="space-y-6 xl:col-span-2">
      <section class="admin-card space-y-5 p-6">
        <AdminField id="title" label="Project title" :error="errors.title">
          <input id="title" v-model="form.title" class="admin-input" :aria-invalid="Boolean(errors.title)">
        </AdminField>
        <AdminField id="slug" label="URL slug" :error="errors.slug" :help="`/portfolio/${form.slug || 'your-project'}`">
          <input id="slug" v-model="form.slug" class="admin-input" @input="slugTouched = true">
        </AdminField>
        <AdminField id="summary" label="Short summary" :error="errors.summary" help="One or two sentences shown on cards." optional>
          <textarea id="summary" v-model="form.summary" class="admin-input min-h-20" />
        </AdminField>
        <AdminField id="description" label="Full description" :error="errors.description" help="Separate paragraphs with a blank line." optional>
          <textarea id="description" v-model="form.description" class="admin-input min-h-48" />
        </AdminField>
      </section>

      <section class="admin-card grid gap-5 p-6 sm:grid-cols-2">
        <AdminField id="category" label="Event category" :error="errors.categoryId">
          <select id="category" v-model="form.categoryId" class="admin-input">
            <option value="">Uncategorised</option>
            <option v-for="c in categories?.eventCategories || []" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </AdminField>
        <AdminField id="eventDate" label="Event date" :error="errors.eventDate" optional>
          <input id="eventDate" v-model="form.eventDate" type="date" class="admin-input">
        </AdminField>
        <AdminField id="location" label="Location" :error="errors.location" optional>
          <input id="location" v-model="form.location" class="admin-input" placeholder="e.g. Nairobi">
        </AdminField>
        <AdminField id="venue" label="Venue" :error="errors.venue" optional>
          <input id="venue" v-model="form.venue" class="admin-input">
        </AdminField>
        <AdminField id="guestCount" label="Guest count" :error="errors.guestCount" optional>
          <input id="guestCount" v-model="form.guestCount" type="number" min="1" class="admin-input">
        </AdminField>
      </section>

      <section class="admin-card space-y-5 p-6">
        <h2 class="font-serif text-xl">Search engines</h2>
        <AdminField id="seoTitle" label="SEO title" :error="errors.seoTitle" help="Defaults to the project title." optional>
          <input id="seoTitle" v-model="form.seoTitle" class="admin-input">
        </AdminField>
        <AdminField id="seoDescription" label="Meta description" :error="errors.seoDescription" help="Defaults to the summary." optional>
          <textarea id="seoDescription" v-model="form.seoDescription" class="admin-input min-h-20" />
        </AdminField>
      </section>
    </div>

    <div class="space-y-6">
      <section class="admin-card space-y-5 p-6">
        <AdminToggle v-model="form.isPublished" label="Published" description="Visible on the public website." />
        <AdminToggle v-model="form.isFeatured" label="Featured" description="Shown on the homepage." />
        <AdminToggle v-model="form.isSample" label="Sample / placeholder" description="Labels the project as using placeholder imagery. Turn off once real photos are uploaded." />
        <AdminField id="sortOrder" label="Display order" help="Lower numbers appear first." :error="errors.sortOrder">
          <input id="sortOrder" v-model="form.sortOrder" type="number" min="0" class="admin-input">
        </AdminField>
        <button type="submit" class="admin-btn-primary w-full" :disabled="saving"><AppIcon v-if="saving" name="spinner" :size="16" /> {{ initial?.id ? 'Save changes' : 'Create project' }}</button>
        <p v-if="!initial?.id" class="text-xs text-ink-muted">You can upload images after creating the project.</p>
      </section>
      <slot name="aside" />
    </div>
  </form>
</template>
