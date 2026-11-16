<script setup lang="ts">
import { slugify } from '#shared/utils/format'

interface ServiceData {
  id?: string
  name: string
  slug: string
  tagline: string | null
  summary: string
  description: string
  includes: string[]
  suitableFor: string[]
  categoryId: string | null
  coverMediaId: string | null
  isPublished: boolean
  isFeatured: boolean
  sortOrder: number
  seoTitle: string | null
  seoDescription: string | null
}

const props = defineProps<{ initial?: Partial<ServiceData> | null }>()
const emit = defineEmits<{ saved: [result: { id: string }] }>()
const toast = useToast()

const { data: categories } = await useFetch('/api/admin/categories', { key: 'admin-categories' })

const form = reactive({
  name: props.initial?.name ?? '',
  slug: props.initial?.slug ?? '',
  tagline: props.initial?.tagline ?? '',
  summary: props.initial?.summary ?? '',
  description: props.initial?.description ?? '',
  includes: [...(props.initial?.includes ?? [])],
  suitableFor: [...(props.initial?.suitableFor ?? [])],
  categoryId: props.initial?.categoryId ?? '',
  coverMediaId: props.initial?.coverMediaId ?? '',
  isPublished: props.initial?.isPublished ?? false,
  isFeatured: props.initial?.isFeatured ?? false,
  sortOrder: props.initial?.sortOrder ?? 0,
  seoTitle: props.initial?.seoTitle ?? '',
  seoDescription: props.initial?.seoDescription ?? '',
})
const slugTouched = ref(Boolean(props.initial?.slug))
watch(() => form.name, (n) => { if (!slugTouched.value) form.slug = slugify(n) })

const errors = ref<Record<string, string>>({})
const saving = ref(false)

async function save() {
  errors.value = {}
  saving.value = true
  try {
    const body = { ...form, includes: form.includes.filter(Boolean), suitableFor: form.suitableFor.filter(Boolean) }
    const url = props.initial?.id ? `/api/admin/services/${props.initial.id}` : '/api/admin/services'
    const result = await $fetch<{ id: string }>(url, { method: props.initial?.id ? 'PUT' : 'POST', body })
    toast.success(props.initial?.id ? 'Service saved' : 'Service created')
    emit('saved', result)
  }
  catch (err) {
    const { message, fieldErrors } = parseApiError(err)
    errors.value = fieldErrors
    toast.error('Could not save service', message)
  }
  finally { saving.value = false }
}
</script>

<template>
  <form novalidate class="grid gap-6 xl:grid-cols-3" @submit.prevent="save">
    <div class="space-y-6 xl:col-span-2">
      <section class="admin-card space-y-5 p-6">
        <div class="grid gap-5 sm:grid-cols-2">
          <AdminField id="name" label="Service name" :error="errors.name">
            <input id="name" v-model="form.name" class="admin-input">
          </AdminField>
          <AdminField id="slug" label="URL slug" :error="errors.slug" :help="`/services/${form.slug || 'service'}`">
            <input id="slug" v-model="form.slug" class="admin-input" @input="slugTouched = true">
          </AdminField>
        </div>
        <AdminField id="tagline" label="Tagline" :error="errors.tagline" optional>
          <input id="tagline" v-model="form.tagline" class="admin-input" placeholder="A short, elegant line">
        </AdminField>
        <AdminField id="summary" label="Summary" :error="errors.summary" help="Shown on service cards (10–400 characters).">
          <textarea id="summary" v-model="form.summary" class="admin-input min-h-20" />
        </AdminField>
        <AdminField id="description" label="Description" :error="errors.description" help="Separate paragraphs with a blank line. Do not include fixed prices.">
          <textarea id="description" v-model="form.description" class="admin-input min-h-48" />
        </AdminField>
      </section>

      <section class="admin-card grid gap-6 p-6 md:grid-cols-2">
        <div>
          <p class="admin-label">What's included</p>
          <AdminListEditor id="includes" v-model="form.includes" placeholder="e.g. Floral design and installations" />
        </div>
        <div>
          <p class="admin-label">Suitable for</p>
          <AdminListEditor id="suitableFor" v-model="form.suitableFor" placeholder="e.g. Garden weddings" />
        </div>
      </section>

      <section class="admin-card space-y-5 p-6">
        <h2 class="font-serif text-xl">Search engines</h2>
        <AdminField id="seoTitle" label="SEO title" :error="errors.seoTitle" optional>
          <input id="seoTitle" v-model="form.seoTitle" class="admin-input">
        </AdminField>
        <AdminField id="seoDescription" label="Meta description" :error="errors.seoDescription" optional>
          <textarea id="seoDescription" v-model="form.seoDescription" class="admin-input min-h-20" />
        </AdminField>
      </section>
    </div>

    <div class="space-y-6">
      <section class="admin-card space-y-5 p-6">
        <AdminField id="category" label="Category" :error="errors.categoryId">
          <select id="category" v-model="form.categoryId" class="admin-input">
            <option value="">No category</option>
            <option v-for="c in categories?.serviceCategories || []" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </AdminField>
        <AdminToggle v-model="form.isPublished" label="Published" description="Visible on the public website." />
        <AdminToggle v-model="form.isFeatured" label="Featured" />
        <AdminField id="sortOrder" label="Display order" help="Lower numbers appear first." :error="errors.sortOrder">
          <input id="sortOrder" v-model="form.sortOrder" type="number" min="0" class="admin-input">
        </AdminField>
        <button type="submit" class="admin-btn-primary w-full" :disabled="saving"><AppIcon v-if="saving" name="spinner" :size="16" /> {{ initial?.id ? 'Save changes' : 'Create service' }}</button>
      </section>
    </div>
  </form>
</template>
