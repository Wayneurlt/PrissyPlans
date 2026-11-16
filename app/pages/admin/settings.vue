<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Website settings' })

const toast = useToast()
const { data, refresh, error } = await useFetch('/api/admin/settings', { key: 'admin-settings' })

const activeGroup = ref('')
const values = reactive<Record<string, string>>({})
const original = ref<Record<string, string>>({})
const errors = ref<Record<string, string>>({})
const saving = ref(false)

watch(data, (d) => {
  if (!d) return
  for (const g of d.groups) for (const s of g.settings) values[s.key] = s.value
  original.value = { ...values }
  if (!activeGroup.value) activeGroup.value = d.groups[0]?.key ?? ''
}, { immediate: true })

const group = computed(() => data.value?.groups.find(g => g.key === activeGroup.value))
const dirtyKeys = computed(() => Object.keys(values).filter(k => values[k] !== original.value[k]))

function isPlaceholder(v: string) { return v.trim().startsWith('[PLACEHOLDER') }

function prettyJson(key: string) {
  try { values[key] = JSON.stringify(JSON.parse(values[key] || '[]'), null, 2) }
  catch { errors.value[key] = 'Must be valid JSON' }
}

async function save() {
  if (!dirtyKeys.value.length) return
  saving.value = true
  errors.value = {}
  try {
    const payload = Object.fromEntries(dirtyKeys.value.map(k => [k, values[k] ?? '']))
    await $fetch('/api/admin/settings', { method: 'PUT', body: { values: payload } })
    toast.success('Settings saved', 'Changes are live on the website.')
    await refresh()
    // Refresh public settings for this session too.
    useState('site-settings').value = {}
    await loadSiteSettings()
  }
  catch (err) {
    const { message, fieldErrors } = parseApiError(err)
    errors.value = fieldErrors
    const firstKey = Object.keys(fieldErrors)[0]
    const g = data.value?.groups.find(gr => gr.settings.some(s => s.key === firstKey))
    if (g) activeGroup.value = g.key
    toast.error('Could not save settings', message)
  }
  finally { saving.value = false }
}

onBeforeRouteLeave(() => {
  if (dirtyKeys.value.length && !confirm('You have unsaved changes. Leave anyway?')) return false
})
</script>

<template>
  <div>
    <AdminPageHeader title="Website settings" description="Edit contact details, homepage and About copy, calls to action, footer and enquiry options without touching code.">
      <template #actions>
        <span v-if="dirtyKeys.length" class="self-center text-sm text-ink-muted">{{ dirtyKeys.length }} unsaved change{{ dirtyKeys.length > 1 ? 's' : '' }}</span>
        <button class="admin-btn-primary" :disabled="saving || !dirtyKeys.length" @click="save"><AppIcon v-if="saving" name="spinner" :size="16" /> Save changes</button>
      </template>
    </AdminPageHeader>

    <div v-if="error" class="admin-card p-6 text-danger">Could not load settings.</div>

    <div v-else-if="data" class="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav class="admin-card h-fit p-2 lg:sticky lg:top-6" aria-label="Setting groups">
        <button
          v-for="g in data.groups"
          :key="g.key"
          :class="['flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition', activeGroup === g.key ? 'bg-wine text-champagne' : 'hover:bg-cream']"
          @click="activeGroup = g.key"
        >
          {{ g.label }}
          <span v-if="g.settings.some(s => dirtyKeys.includes(s.key))" class="h-2 w-2 rounded-full bg-gold" aria-label="Unsaved changes" />
        </button>
      </nav>

      <form v-if="group" class="admin-card space-y-6 p-6" novalidate @submit.prevent="save">
        <h2 class="font-serif text-2xl">{{ group.label }}</h2>
        <div v-if="group.key === 'contact' && data.env.whatsappFallback" class="rounded-md bg-cream p-3 text-xs text-ink-muted">
          Environment fallback WhatsApp number: {{ data.env.whatsappFallback }} (used only when the field below is empty).
        </div>
        <div v-for="s in group.settings" :key="s.key">
          <AdminField :id="s.key" :label="s.label" :error="errors[s.key]" :help="s.help || undefined">
            <textarea v-if="s.type === 'TEXTAREA'" :id="s.key" v-model="values[s.key]" class="admin-input min-h-28" :aria-invalid="Boolean(errors[s.key])" />
            <div v-else-if="s.type === 'JSON'">
              <textarea :id="s.key" v-model="values[s.key]" class="admin-input min-h-40 font-mono text-xs" spellcheck="false" :aria-invalid="Boolean(errors[s.key])" />
              <button type="button" class="mt-2 text-xs text-mocha hover:text-wine" @click="prettyJson(s.key)">Format JSON</button>
            </div>
            <input v-else :id="s.key" v-model="values[s.key]" :type="s.type === 'EMAIL' ? 'email' : s.type === 'URL' ? 'url' : s.type === 'PHONE' ? 'tel' : 'text'" class="admin-input" :aria-invalid="Boolean(errors[s.key])">
          </AdminField>
          <p v-if="isPlaceholder(values[s.key] || '')" class="mt-1 text-xs text-[#7a5212]">Placeholder: replace with real information before launch.</p>
        </div>
        <div class="flex justify-end border-t border-charcoal/10 pt-5">
          <button type="submit" class="admin-btn-primary" :disabled="saving || !dirtyKeys.length"><AppIcon v-if="saving" name="spinner" :size="16" /> Save changes</button>
        </div>
      </form>
    </div>
  </div>
</template>
