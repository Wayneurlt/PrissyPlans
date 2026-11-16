<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data: service, error } = await useFetch(() => `/api/services/${slug.value}`, { key: `service-${slug.value}` })
if (error.value || !service.value) {
  throw createError({ statusCode: 404, statusMessage: 'Service not found', fatal: true })
}

const { data: others } = await useFetch('/api/services', { key: 'services-page', default: () => [] })
const related = computed(() => others.value.filter(s => s.slug !== slug.value).slice(0, 3))
const { isConfigured, enquiryLink } = useWhatsApp()

const lightboxIndex = ref<number | null>(null)
const gallery = computed(() => (service.value?.images ?? []).filter(i => i.media).map(i => ({ media: i.media, caption: null })))

usePageSeo(() => ({
  title: service.value?.seoTitle || service.value?.name || 'Service',
  description: service.value?.seoDescription || service.value?.summary,
  image: service.value?.coverMedia?.url,
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': service.value?.name,
    'description': service.value?.summary,
    'provider': { '@type': 'LocalBusiness', 'name': 'Prissy Plans Events' },
    'areaServed': 'Kenya',
  },
}))
</script>

<template>
  <div v-if="service">
    <PageHero :eyebrow="service.category?.name || 'Service'" :title="service.name" :intro="service.tagline || ''" :media="service.coverMedia" />

    <section class="container-x py-14 sm:py-20 lg:py-24">
      <div class="mx-auto max-w-2xl">
        <div class="prose-site">
          <p v-for="(p, i) in paragraphs(service.description)" :key="i" class="sm:text-lg">{{ p }}</p>
        </div>

        <div v-if="service.includes.length" class="mt-14">
          <h2 class="eyebrow mb-5">What's included</h2>
          <ul class="grid gap-x-8 sm:grid-cols-2">
            <li v-for="item in service.includes" :key="item" class="flex items-start gap-3 border-t border-charcoal/10 py-3.5 text-[0.95rem] text-charcoal/85">
              <AppIcon name="check" :size="15" class="mt-1 shrink-0 text-mocha" />{{ item }}
            </li>
          </ul>
        </div>

        <div v-if="service.suitableFor.length" class="mt-12">
          <h2 class="eyebrow mb-5">Who it's for</h2>
          <ul class="flex flex-wrap gap-2">
            <li v-for="item in service.suitableFor" :key="item" class="border border-charcoal/15 px-4 py-2 text-sm text-charcoal/85">{{ item }}</li>
          </ul>
        </div>

        <div class="mt-14 border border-charcoal/10 bg-white p-7 text-center sm:p-10">
          <h2 class="text-h3 font-serif font-normal text-charcoal">Planning something similar?</h2>
          <p class="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">Share your date, location and vision, and we will come back with next steps. Pricing is tailored to each event.</p>
          <div class="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <NuxtLink :to="{ path: '/enquire', query: enquiryQueryForService(service.slug) }" class="btn-primary w-full sm:w-auto">Enquire about this service</NuxtLink>
            <a v-if="isConfigured" :href="enquiryLink({ service: service.name })" target="_blank" rel="noopener noreferrer" class="btn-whatsapp w-full sm:w-auto"><AppIcon name="whatsapp" :size="18" /> WhatsApp</a>
          </div>
        </div>
      </div>

      <div v-if="gallery.length > 1" class="mx-auto mt-16 max-w-6xl columns-1 gap-5 sm:columns-2 lg:columns-3 lg:gap-6 [&>*]:mb-5 lg:[&>*]:mb-6">
        <button v-for="(img, i) in gallery" :key="img.media?.id || i" class="image-zoom block w-full break-inside-avoid overflow-hidden" :aria-label="`Open image ${i + 1}`" @click="lightboxIndex = i">
          <AppImage :media="img.media" sizes="100vw sm:50vw lg:33vw" img-class="!h-auto" />
        </button>
      </div>
      <ImageLightbox v-model="lightboxIndex" :images="gallery" />
    </section>

    <section v-if="related.length" class="bg-blush/60 py-20 sm:py-24">
      <div class="container-x">
        <SectionHeading eyebrow="More services" title="You may also be planning" align="center" />
        <div class="mx-auto mt-12 grid max-w-6xl gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="(s, i) in related" :key="s.id" :class="i === 2 ? 'sm:col-span-2 sm:mx-auto sm:w-1/2 lg:col-span-1 lg:w-auto' : ''">
            <ServiceCard :service="s" />
          </div>
        </div>
      </div>
    </section>

    <CtaBand />
  </div>
</template>
