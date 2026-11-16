<script setup lang="ts">
import { contactMessageSchema } from '#shared/schemas/enquiry'
import { EVENT_TYPES } from '#shared/config/enquiry'

const toast = useToast()
const submissionKey = ref('')
const form = reactive({ fullName: '', email: '', phone: '', eventType: '', message: '', website: '' })
const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const result = ref<{ reference: string, whatsappUrl: string } | null>(null)

onMounted(() => { submissionKey.value = crypto.randomUUID() })

async function submit() {
  errors.value = {}
  const parsed = contactMessageSchema.safeParse({ ...form, submissionKey: submissionKey.value })
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '_form')
      if (!errors.value[key]) errors.value[key] = issue.message
    }
    return
  }
  submitting.value = true
  try {
    result.value = await $fetch<{ reference: string, whatsappUrl: string }>('/api/contact', { method: 'POST', body: parsed.data })
  }
  catch (error) {
    const { message, fieldErrors } = parseApiError(error)
    errors.value = fieldErrors
    toast.error('Message not sent', message)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="result" class="border border-success/30 bg-white p-8" role="status">
      <AppIcon name="check" :size="28" class="text-success" />
      <h3 class="mt-4 font-serif text-3xl font-light text-charcoal">Thank you, your message is on its way.</h3>
      <p class="mt-3 text-ink-muted">We have saved your message under reference <strong class="text-charcoal">{{ result.reference }}</strong> and will reply as soon as possible.</p>
      <a v-if="result.whatsappUrl" :href="result.whatsappUrl" target="_blank" rel="noopener noreferrer" class="btn-whatsapp mt-6"><AppIcon name="whatsapp" :size="18" /> Continue on WhatsApp</a>
    </div>

    <form v-else novalidate class="space-y-7" @submit.prevent="submit">
      <div class="grid gap-7 sm:grid-cols-2">
        <div>
          <label for="c-name" class="field-label">Full name</label>
          <input id="c-name" v-model="form.fullName" class="field-input" type="text" autocomplete="name" :aria-invalid="Boolean(errors.fullName)" :aria-describedby="errors.fullName ? 'c-name-err' : undefined">
          <p v-if="errors.fullName" id="c-name-err" class="field-error">{{ errors.fullName }}</p>
        </div>
        <div>
          <label for="c-email" class="field-label">Email</label>
          <input id="c-email" v-model="form.email" class="field-input" type="email" autocomplete="email" :aria-invalid="Boolean(errors.email)">
          <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
        </div>
        <div>
          <label for="c-phone" class="field-label">Phone / WhatsApp <span class="normal-case tracking-normal text-charcoal/40">(optional)</span></label>
          <input id="c-phone" v-model="form.phone" class="field-input" type="tel" autocomplete="tel" :aria-invalid="Boolean(errors.phone)">
          <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>
        </div>
        <div>
          <label for="c-type" class="field-label">Event type <span class="normal-case tracking-normal text-charcoal/40">(optional)</span></label>
          <select id="c-type" v-model="form.eventType" class="field-input">
            <option value="">Select…</option>
            <option v-for="t in EVENT_TYPES" :key="t.key" :value="t.label">{{ t.label }}</option>
          </select>
        </div>
      </div>
      <div>
        <label for="c-message" class="field-label">Your message</label>
        <textarea id="c-message" v-model="form.message" class="field-input min-h-32 resize-y" :aria-invalid="Boolean(errors.message)" placeholder="Tell us about your event, your date and anything you have in mind." />
        <p v-if="errors.message" class="field-error">{{ errors.message }}</p>
      </div>
      <div class="hidden" aria-hidden="true">
        <label for="c-website">Website</label>
        <input id="c-website" v-model="form.website" type="text" tabindex="-1" autocomplete="off">
      </div>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <AppButton type="submit" :loading="submitting" icon="arrow-right" class="whitespace-nowrap">Send message</AppButton>
        <p class="text-xs text-ink-muted">We reply within one business day where possible.</p>
      </div>
    </form>
  </div>
</template>
