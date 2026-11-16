<script setup lang="ts">
const route = useRoute()
const { get } = useSiteSettings()
const reference = computed(() => String(route.query.ref || '').toUpperCase())

const { data: enquiry } = await useFetch(() => `/api/enquiries/${reference.value}` as '/api/enquiries/:reference', {
  key: `thanks-${reference.value}`,
  immediate: Boolean(reference.value),
  default: () => null,
})

const stored = ref<{ name?: string, whatsappUrl?: string } | null>(null)
onMounted(() => {
  try {
    const raw = sessionStorage.getItem('ppe:last-enquiry')
    if (raw) stored.value = JSON.parse(raw)
  }
  catch {}
})

const whatsappUrl = computed(() => enquiry.value?.whatsappUrl || stored.value?.whatsappUrl || '')

usePageSeo({ title: 'Enquiry received', noindex: true })
</script>

<template>
  <div class="bg-cream">
    <section class="container-x py-14 sm:py-20 lg:py-24">
      <div class="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <p v-reveal class="eyebrow mb-4">Enquiry received</p>
          <h1 v-reveal="{ delay: 60 }" class="text-h1 font-serif font-light text-charcoal">
            Thank you<span v-if="stored?.name">, {{ stored.name.split(' ')[0] }}</span>. Your vision is in good hands.
          </h1>
          <p v-reveal="{ delay: 120 }" class="lede mt-6 max-w-2xl">{{ get('enquiry.successMessage') }}</p>

          <div v-reveal="{ delay: 160 }" class="mt-10 inline-flex flex-col gap-1 border border-charcoal/15 bg-white px-6 py-5">
            <span class="font-label text-[0.62rem] uppercase tracking-[0.24em] text-ink-muted">Your reference</span>
            <span class="font-serif text-3xl text-wine">{{ enquiry?.reference || reference || '—' }}</span>
            <span v-if="enquiry" class="text-sm text-ink-muted">{{ enquiry.eventTypeLabel }} · we will reach you by {{ enquiry.preferredContact === 'WHATSAPP' ? 'WhatsApp' : enquiry.preferredContact === 'PHONE' ? 'phone' : 'email' }}</span>
          </div>

          <div class="mt-10 flex flex-col gap-3 sm:flex-row">
            <a v-if="whatsappUrl" :href="whatsappUrl" target="_blank" rel="noopener noreferrer" class="btn-whatsapp"><AppIcon name="whatsapp" :size="18" /> Continue on WhatsApp</a>
            <NuxtLink to="/portfolio" class="btn-outline">Explore our work</NuxtLink>
          </div>
          <p class="mt-6 text-sm text-ink-muted">A confirmation email with a summary has been sent to the address you provided. Check your spam folder if it does not arrive within a few minutes.</p>
        </div>
        <div class="hidden lg:col-span-4 lg:col-start-9 lg:block">
          <div class="image-zoom aspect-[4/5] overflow-hidden">
            <AppImage placeholder="heroEnquire" sizes="100vw md:33vw" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
