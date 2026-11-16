<script setup lang="ts">
import { enquiryStepSchemas, enquirySubmissionSchema } from '#shared/schemas/enquiry'
import { EVENT_TYPES, ENQUIRY_SERVICES } from '#shared/config/enquiry'

const props = defineProps<{
  config: {
    eventTypes: Array<{ key: string, label: string }>
    services: Array<{ key: string, label: string }>
    budgetRanges: Array<{ key: string, label: string }>
    contactMethods: Array<{ key: string, label: string }>
    upload: { maxFiles: number, maxBytes: number, enabled: boolean }
  }
}>()

const route = useRoute()
const toast = useToast()
const { isConfigured, enquiryLink } = useWhatsApp()

const steps = [
  { key: 'eventType', title: 'Event type', question: 'What are we celebrating?' },
  { key: 'details', title: 'Details', question: 'When and where is it happening?' },
  { key: 'services', title: 'Services', question: 'How can we help?' },
  { key: 'budget', title: 'Budget', question: 'What budget are you working with?' },
  { key: 'vision', title: 'Vision', question: 'Tell us about your vision.' },
  { key: 'contact', title: 'Contact', question: 'How can we reach you?' },
] as const

type StepKey = (typeof steps)[number]['key']

const step = ref(0)
const direction = ref<'forward' | 'back'>('forward')
const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const submissionKey = ref('')
const startedAt = ref(0)

const form = reactive({
  eventType: '' as string,
  eventTypeOther: '',
  eventDate: '',
  dateIsFlexible: false,
  location: '',
  venue: '',
  venueNotConfirmed: false,
  guestCount: '' as string | number,
  services: [] as string[],
  servicesOther: '',
  budget: '',
  theme: '',
  colours: '',
  vision: '',
  additionalRequests: '',
  imageIds: [] as string[],
  fullName: '',
  phone: '',
  email: '',
  preferredContact: 'WHATSAPP',
  consent: false,
  website: '',
})

// Prefill from query parameters (service pages, inspiration themes, portfolio).
onMounted(() => {
  submissionKey.value = crypto.randomUUID()
  startedAt.value = Date.now()
  const q = route.query
  if (typeof q.type === 'string' && EVENT_TYPES.some(t => t.key === q.type)) form.eventType = q.type
  if (typeof q.service === 'string' && ENQUIRY_SERVICES.some(s => s.key === q.service)) form.services = [q.service]
  if (typeof q.theme === 'string') form.theme = q.theme.slice(0, 120)
})

const today = new Date().toISOString().slice(0, 10)
const minDate = today

const fieldOrder: Record<StepKey, string[]> = {
  eventType: ['eventType', 'eventTypeOther'],
  details: ['eventDate', 'dateIsFlexible', 'location', 'venue', 'venueNotConfirmed', 'guestCount'],
  services: ['services', 'servicesOther'],
  budget: ['budget'],
  vision: ['theme', 'colours', 'vision', 'additionalRequests', 'imageIds'],
  contact: ['fullName', 'phone', 'email', 'preferredContact', 'consent'],
}

function validateStep(index: number): boolean {
  const key = steps[index]!.key
  const schema = enquiryStepSchemas[key]
  const result = schema.safeParse(form)
  const stepErrors: Record<string, string> = {}
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? '_form')
      if (!stepErrors[field]) stepErrors[field] = issue.message
    }
  }
  errors.value = stepErrors
  return result.success
}

function next() {
  if (!validateStep(step.value)) return
  direction.value = 'forward'
  step.value = Math.min(step.value + 1, steps.length - 1)
  scrollToTop()
}

function back() {
  errors.value = {}
  direction.value = 'back'
  step.value = Math.max(step.value - 1, 0)
  scrollToTop()
}

function scrollToTop() {
  if (!import.meta.client) return
  const el = document.getElementById('enquiry-form')
  const top = (el?.getBoundingClientRect().top ?? 0) + window.scrollY - 96
  window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

function toggleService(key: string) {
  form.services = form.services.includes(key) ? form.services.filter(s => s !== key) : [...form.services, key]
}

function stepForField(field: string): number {
  const index = steps.findIndex(s => fieldOrder[s.key].includes(field))
  return index === -1 ? step.value : index
}

async function submit() {
  if (!validateStep(step.value)) return
  const payload = { ...form, submissionKey: submissionKey.value, startedAt: startedAt.value, sourcePage: route.fullPath }
  const parsed = enquirySubmissionSchema.safeParse(payload)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const field = String(issue?.path[0] ?? '')
    errors.value = { [field]: issue?.message ?? 'Please check your details' }
    step.value = stepForField(field)
    return
  }

  submitting.value = true
  try {
    const result = await $fetch<{ reference: string, whatsappUrl: string, duplicate: boolean }>('/api/enquiries', { method: 'POST', body: parsed.data })
    try { sessionStorage.setItem('ppe:last-enquiry', JSON.stringify({ reference: result.reference, name: form.fullName, whatsappUrl: result.whatsappUrl })) } catch {}
    await navigateTo({ path: '/enquire/thank-you', query: { ref: result.reference } })
  }
  catch (error) {
    const { message, fieldErrors } = parseApiError(error)
    errors.value = fieldErrors
    const firstField = Object.keys(fieldErrors)[0]
    if (firstField) step.value = stepForField(firstField)
    toast.error('We could not send your enquiry', message)
  }
  finally {
    submitting.value = false
  }
}

const summary = computed(() => {
  const type = props.config.eventTypes.find(t => t.key === form.eventType)?.label
  const services = form.services.map(k => props.config.services.find(s => s.key === k)?.label).filter(Boolean).join(', ')
  const budget = props.config.budgetRanges.find(b => b.key === form.budget)?.label
  return [
    ['Event', form.eventType === 'other' && form.eventTypeOther ? `Other — ${form.eventTypeOther}` : type],
    ['Date', form.eventDate || (form.dateIsFlexible ? 'Not yet confirmed' : '')],
    ['Location', [form.location, form.venue].filter(Boolean).join(' · ') || (form.venueNotConfirmed ? 'Venue not yet confirmed' : '')],
    ['Guests', form.guestCount ? String(form.guestCount) : ''],
    ['Services', services],
    ['Budget', budget],
    ['Theme', form.theme],
  ].filter(([, v]) => v) as Array<[string, string]>
})

const isLast = computed(() => step.value === steps.length - 1)
const transitionName = computed(() => (direction.value === 'forward' ? 'step-forward' : 'step-back'))
</script>

<template>
  <div id="enquiry-form" class="mx-auto max-w-3xl scroll-mt-24">
    <div class="border border-charcoal/10 bg-white px-5 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
      <!-- Progress -->
      <div>
        <div class="flex items-baseline justify-between gap-4">
          <p class="eyebrow">Step {{ step + 1 }} of {{ steps.length }}</p>
          <p class="font-label text-[0.68rem] uppercase tracking-[0.2em] text-ink-muted">{{ steps[step]!.title }}</p>
        </div>
        <div
          class="mt-3 h-px w-full bg-charcoal/10"
          role="progressbar"
          :aria-valuenow="step + 1"
          aria-valuemin="1"
          :aria-valuemax="steps.length"
          :aria-label="`Step ${step + 1} of ${steps.length}: ${steps[step]!.title}`"
        >
          <div class="h-px bg-wine transition-all duration-500 ease-luxe" :style="{ width: `${((step + 1) / steps.length) * 100}%` }" />
        </div>
      </div>

      <form novalidate class="mt-8 sm:mt-10" @submit.prevent="isLast ? submit() : next()">
        <div class="relative overflow-hidden">
          <Transition :name="transitionName" mode="out-in">
            <section :key="step">
              <h2 class="text-h3 font-serif font-normal text-charcoal">{{ steps[step]!.question }}</h2>

              <!-- Step 1: Event type -->
              <div v-if="step === 0" class="mt-7">
                <div class="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4" role="radiogroup" aria-label="Event type">
                  <button
                    v-for="t in config.eventTypes"
                    :key="t.key"
                    type="button"
                    role="radio"
                    :aria-checked="form.eventType === t.key"
                    :class="['min-h-14 border px-3 py-3 text-center font-serif text-lg leading-tight transition-colors duration-200', form.eventType === t.key ? 'border-wine bg-wine text-champagne' : 'border-charcoal/15 text-charcoal hover:border-charcoal/50']"
                    @click="form.eventType = t.key"
                  >
                    {{ t.label }}
                  </button>
                </div>
                <p v-if="errors.eventType" class="field-error">{{ errors.eventType }}</p>
                <div v-if="form.eventType === 'other'" class="mt-6">
                  <label for="f-other" class="field-label">What kind of event?</label>
                  <input id="f-other" v-model="form.eventTypeOther" class="field-input" type="text" :aria-invalid="Boolean(errors.eventTypeOther)">
                  <p v-if="errors.eventTypeOther" class="field-error">{{ errors.eventTypeOther }}</p>
                </div>
              </div>

              <!-- Step 2: Details -->
              <div v-else-if="step === 1" class="mt-7 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                <div>
                  <label for="f-date" class="field-label">Preferred date</label>
                  <input id="f-date" v-model="form.eventDate" class="field-input" type="date" :min="minDate" :disabled="form.dateIsFlexible" :aria-invalid="Boolean(errors.eventDate)">
                  <label class="mt-3 flex items-center gap-2 text-sm text-charcoal/80">
                    <input v-model="form.dateIsFlexible" type="checkbox" class="h-4 w-4 accent-wine" @change="form.dateIsFlexible && (form.eventDate = '')">
                    The date is not yet confirmed
                  </label>
                  <p v-if="errors.eventDate" class="field-error">{{ errors.eventDate }}</p>
                </div>
                <div>
                  <label for="f-guests" class="field-label">Number of guests</label>
                  <input id="f-guests" v-model="form.guestCount" class="field-input" type="number" inputmode="numeric" min="1" max="100000" placeholder="e.g. 120" :aria-invalid="Boolean(errors.guestCount)">
                  <p v-if="errors.guestCount" class="field-error">{{ errors.guestCount }}</p>
                </div>
                <div>
                  <label for="f-location" class="field-label">Location</label>
                  <input id="f-location" v-model="form.location" class="field-input" type="text" placeholder="e.g. Nairobi, Karen" :aria-invalid="Boolean(errors.location)">
                  <p v-if="errors.location" class="field-error">{{ errors.location }}</p>
                </div>
                <div>
                  <label for="f-venue" class="field-label">Venue <span class="normal-case tracking-normal text-charcoal/40">(if known)</span></label>
                  <input id="f-venue" v-model="form.venue" class="field-input" type="text" :disabled="form.venueNotConfirmed">
                  <label class="mt-3 flex items-center gap-2 text-sm text-charcoal/80">
                    <input v-model="form.venueNotConfirmed" type="checkbox" class="h-4 w-4 accent-wine">
                    Venue not yet confirmed
                  </label>
                </div>
              </div>

              <!-- Step 3: Services -->
              <div v-else-if="step === 2" class="mt-7">
                <p class="mb-4 text-sm text-ink-muted">Select everything that applies.</p>
                <div class="grid gap-2.5 sm:grid-cols-2 sm:gap-3" role="group" aria-label="Services required">
                  <button
                    v-for="s in config.services"
                    :key="s.key"
                    type="button"
                    role="checkbox"
                    :aria-checked="form.services.includes(s.key)"
                    :class="['flex min-h-14 items-center justify-between gap-4 border px-4 py-3 text-left transition-colors duration-200', form.services.includes(s.key) ? 'border-wine bg-wine text-champagne' : 'border-charcoal/15 text-charcoal hover:border-charcoal/50']"
                    @click="toggleService(s.key)"
                  >
                    <span class="font-serif text-lg leading-tight">{{ s.label }}</span>
                    <span :class="['flex h-5 w-5 shrink-0 items-center justify-center border', form.services.includes(s.key) ? 'border-champagne bg-champagne text-wine' : 'border-charcoal/30']">
                      <AppIcon v-if="form.services.includes(s.key)" name="check" :size="12" />
                    </span>
                  </button>
                </div>
                <p v-if="errors.services" class="field-error">{{ errors.services }}</p>
                <div v-if="form.services.includes('other')" class="mt-6">
                  <label for="f-sother" class="field-label">What else do you need?</label>
                  <input id="f-sother" v-model="form.servicesOther" class="field-input" type="text" :aria-invalid="Boolean(errors.servicesOther)">
                  <p v-if="errors.servicesOther" class="field-error">{{ errors.servicesOther }}</p>
                </div>
              </div>

              <!-- Step 4: Budget -->
              <div v-else-if="step === 3" class="mt-7">
                <p class="mb-4 text-sm text-ink-muted">An indicative range helps us shape the right proposal. These are not prices.</p>
                <div class="grid gap-2.5 sm:grid-cols-2 sm:gap-3" role="radiogroup" aria-label="Budget range">
                  <button
                    v-for="b in config.budgetRanges"
                    :key="b.key"
                    type="button"
                    role="radio"
                    :aria-checked="form.budget === b.key"
                    :class="['min-h-14 border px-4 py-3 text-left font-serif text-lg leading-tight transition-colors duration-200', form.budget === b.key ? 'border-wine bg-wine text-champagne' : 'border-charcoal/15 text-charcoal hover:border-charcoal/50']"
                    @click="form.budget = b.key"
                  >
                    {{ b.label }}
                  </button>
                </div>
                <p v-if="errors.budget" class="field-error">{{ errors.budget }}</p>
              </div>

              <!-- Step 5: Vision -->
              <div v-else-if="step === 4" class="mt-7 space-y-7">
                <div class="grid gap-x-8 gap-y-7 sm:grid-cols-2">
                  <div>
                    <label for="f-theme" class="field-label">Theme <span class="normal-case tracking-normal text-charcoal/40">(optional)</span></label>
                    <input id="f-theme" v-model="form.theme" class="field-input" type="text" placeholder="e.g. Romantic garden">
                  </div>
                  <div>
                    <label for="f-colours" class="field-label">Colours <span class="normal-case tracking-normal text-charcoal/40">(optional)</span></label>
                    <input id="f-colours" v-model="form.colours" class="field-input" type="text" placeholder="e.g. Blush, cream and gold">
                  </div>
                </div>
                <div>
                  <label for="f-vision" class="field-label">Describe your vision</label>
                  <textarea id="f-vision" v-model="form.vision" rows="4" class="field-input resize-y" :aria-invalid="Boolean(errors.vision)" placeholder="The atmosphere you want, moments that matter, anything already planned…" />
                  <p v-if="errors.vision" class="field-error">{{ errors.vision }}</p>
                </div>
                <div>
                  <label for="f-extra" class="field-label">Anything else? <span class="normal-case tracking-normal text-charcoal/40">(optional)</span></label>
                  <textarea id="f-extra" v-model="form.additionalRequests" rows="2" class="field-input resize-y" placeholder="Catering, entertainment, accessibility, cultural elements…" />
                </div>
                <EnquiryImageUpload v-model="form.imageIds" :enabled="config.upload.enabled" :max-files="config.upload.maxFiles" :max-bytes="config.upload.maxBytes" />
              </div>

              <!-- Step 6: Contact -->
              <div v-else class="mt-7 space-y-7">
                <div class="grid gap-x-8 gap-y-7 sm:grid-cols-2">
                  <div class="sm:col-span-2">
                    <label for="f-name" class="field-label">Full name</label>
                    <input id="f-name" v-model="form.fullName" class="field-input" type="text" autocomplete="name" :aria-invalid="Boolean(errors.fullName)">
                    <p v-if="errors.fullName" class="field-error">{{ errors.fullName }}</p>
                  </div>
                  <div>
                    <label for="f-phone" class="field-label">Phone</label>
                    <input id="f-phone" v-model="form.phone" class="field-input" type="tel" autocomplete="tel" placeholder="+254 7XX XXX XXX" :aria-invalid="Boolean(errors.phone)">
                    <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>
                  </div>
                  <div>
                    <label for="f-email" class="field-label">Email</label>
                    <input id="f-email" v-model="form.email" class="field-input" type="email" autocomplete="email" :aria-invalid="Boolean(errors.email)">
                    <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
                  </div>
                </div>
                <div>
                  <p class="field-label">Best way to reach you</p>
                  <div class="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Preferred contact method">
                    <button
                      v-for="c in config.contactMethods"
                      :key="c.key"
                      type="button"
                      role="radio"
                      :aria-checked="form.preferredContact === c.key"
                      :class="['min-h-11 flex-1 basis-24 whitespace-nowrap border px-3 py-2.5 text-sm transition-colors duration-200', form.preferredContact === c.key ? 'border-wine bg-wine text-champagne' : 'border-charcoal/15 text-charcoal hover:border-charcoal/50']"
                      @click="form.preferredContact = c.key"
                    >
                      {{ c.label }}
                    </button>
                  </div>
                  <p v-if="errors.preferredContact" class="field-error">{{ errors.preferredContact }}</p>
                </div>

                <div class="bg-cream/70 p-5">
                  <p class="eyebrow mb-3">Your enquiry</p>
                  <dl class="space-y-1.5 text-sm">
                    <div v-for="[k, v] in summary" :key="k" class="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3">
                      <dt class="text-ink-muted">{{ k }}</dt>
                      <dd class="break-words text-charcoal">{{ v }}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <label class="flex items-start gap-3 text-sm leading-relaxed text-charcoal/80">
                    <input v-model="form.consent" type="checkbox" class="mt-1 h-4 w-4 shrink-0 accent-wine" :aria-invalid="Boolean(errors.consent)">
                    <span>Prissy Plans Events may contact me about this enquiry. My details are used only to respond to my request.</span>
                  </label>
                  <p v-if="errors.consent" class="field-error">{{ errors.consent }}</p>
                </div>

                <div class="hidden" aria-hidden="true">
                  <label for="f-website">Website</label>
                  <input id="f-website" v-model="form.website" type="text" tabindex="-1" autocomplete="off">
                </div>
              </div>
            </section>
          </Transition>
        </div>

        <!-- Under 400px the primary button goes full width with Back beneath it. -->
        <div class="mt-10 flex flex-col-reverse items-stretch gap-3 border-t border-charcoal/10 pt-7 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between min-[400px]:gap-4">
          <button v-if="step > 0" type="button" class="inline-flex min-h-11 items-center justify-center gap-2 font-label text-[0.7rem] uppercase tracking-[0.22em] text-charcoal/70 transition hover:text-wine" @click="back">
            <AppIcon name="arrow-left" :size="15" /> Back
          </button>
          <span v-else class="hidden min-[400px]:block" />
          <AppButton type="submit" :loading="submitting" :icon="isLast ? 'send' : 'arrow-right'" class="whitespace-nowrap">
            {{ isLast ? 'Send enquiry' : 'Continue' }}
          </AppButton>
        </div>
      </form>
    </div>

    <p class="mt-6 text-center text-sm text-ink-muted">
      We reply with next steps and a consultation time.
      <template v-if="isConfigured">
        Prefer to chat?
        <a :href="enquiryLink({ eventType: config.eventTypes.find(t => t.key === form.eventType)?.label })" target="_blank" rel="noopener noreferrer" class="text-charcoal underline underline-offset-4 hover:text-wine">Message us on WhatsApp</a>.
      </template>
    </p>
  </div>
</template>

<style scoped>
.step-forward-enter-active,
.step-forward-leave-active,
.step-back-enter-active,
.step-back-leave-active {
  transition: opacity 0.35s var(--ease-luxe), transform 0.35s var(--ease-luxe);
}
.step-forward-enter-from { opacity: 0; transform: translateX(24px); }
.step-forward-leave-to { opacity: 0; transform: translateX(-16px); }
.step-back-enter-from { opacity: 0; transform: translateX(-24px); }
.step-back-leave-to { opacity: 0; transform: translateX(16px); }
</style>
