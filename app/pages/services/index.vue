<script setup lang="ts">
const { data: services } = await useFetch('/api/services', { key: 'services-page', default: () => [] })

usePageSeo({
  title: 'Services',
  description: 'Wedding planning, birthday and shower styling, corporate events, decoration and on-the-day coordination across Kenya.',
})
</script>

<template>
  <div>
    <PageHero eyebrow="Services" title="How we can help" intro="Choose a single service or let us look after the whole journey. Each one is shaped around your event, your guests and your budget." placeholder="heroServices" />

    <section class="container-x py-14 sm:py-20 lg:py-24">
      <div v-if="services.length" class="mx-auto grid max-w-6xl gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="(s, i) in services" :key="s.id" v-reveal="{ delay: (i % 3) * 70 }">
          <ServiceCard :service="s" />
        </div>
      </div>
      <div v-else class="py-16 text-center">
        <p class="font-serif text-2xl">Services are being prepared.</p>
        <p class="mt-2 text-ink-muted">Send an enquiry and we will tailor a proposal for you.</p>
        <NuxtLink to="/enquire" class="btn-primary mt-6">Plan your event</NuxtLink>
      </div>
    </section>

    <div class="border-t border-charcoal/10">
      <ProcessTimeline />
    </div>
    <CtaBand />
  </div>
</template>
