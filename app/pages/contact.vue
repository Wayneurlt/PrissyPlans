<script setup lang="ts">
const { get, real, instagram } = useSiteSettings()
const { isConfigured, link, label, number } = useWhatsApp()

usePageSeo({
  title: 'Contact',
  description: 'Get in touch with Prissy Plans Events on WhatsApp, Instagram or by email to start planning your wedding, celebration or corporate event.',
})

const details = computed(() => [
  { icon: 'map-pin', label: 'Location', value: get('contact.location') },
  { icon: 'mail', label: 'Email', value: get('contact.email'), href: real('contact.email') ? `mailto:${real('contact.email')}` : '' },
  { icon: 'phone', label: 'Phone', value: get('contact.phone'), href: real('contact.phone') ? `tel:${real('contact.phone').replace(/\s+/g, '')}` : '' },
  { icon: 'clock', label: 'Hours', value: get('contact.hours') },
])
</script>

<template>
  <div>
    <PageHero eyebrow="Say hello" title="Contact" intro="Message us on WhatsApp for a quick reply, or send us a note below." placeholder="heroContact" />

    <section class="container-x py-14 sm:py-20 lg:py-24">
      <div class="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <SectionHeading eyebrow="Reach us" title="Get in touch" />
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a v-if="isConfigured" :href="link()" target="_blank" rel="noopener noreferrer" class="btn-whatsapp"><AppIcon name="whatsapp" :size="18" /> {{ label }}</a>
            <a v-if="instagram" :href="instagram" target="_blank" rel="noopener noreferrer" class="btn-outline"><AppIcon name="instagram" :size="18" /> Instagram</a>
          </div>
          <p v-if="!isConfigured || !instagram" class="mt-4 text-xs text-ink-muted">
            [PLACEHOLDER: {{ [!isConfigured && 'WhatsApp number', !instagram && 'Instagram link'].filter(Boolean).join(' and ') }} — add in Admin → Settings]
          </p>
          <dl class="mt-10 divide-y divide-charcoal/10 border-y border-charcoal/10">
            <div v-for="d in details" :key="d.label" class="flex items-start gap-4 py-4">
              <AppIcon :name="d.icon" :size="18" class="mt-0.5 shrink-0 text-mocha" />
              <div class="min-w-0">
                <dt class="eyebrow">{{ d.label }}</dt>
                <dd class="mt-1 break-words text-[0.95rem] text-charcoal">
                  <a v-if="d.href" :href="d.href" class="link-underline">{{ d.value }}</a>
                  <span v-else>{{ d.value }}</span>
                </dd>
              </div>
            </div>
          </dl>
          <p v-if="number" class="mt-5 text-xs text-ink-muted">WhatsApp opens in the app on mobile and in WhatsApp Web on desktop.</p>
        </div>
        <div class="border border-charcoal/10 bg-white p-6 sm:p-10">
          <h2 class="text-h3 font-serif font-normal text-charcoal">Send us a message</h2>
          <p class="mt-2 mb-8 text-sm text-ink-muted">For a detailed enquiry with dates, services and budget, use the <NuxtLink to="/enquire" class="underline">event planner form</NuxtLink>.</p>
          <ContactForm />
        </div>
      </div>
    </section>

    <CtaBand />
  </div>
</template>
