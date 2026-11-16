<script setup lang="ts">
const { data: config, error } = await useFetch('/api/enquiry-config', { key: 'enquiry-config' })

usePageSeo({
  title: 'Plan Your Event',
  description: 'Tell Prissy Plans Events about your wedding, birthday, shower, corporate event or private celebration and receive a tailored proposal.',
})
</script>

<template>
  <div class="bg-cream">
    <section class="container-x pb-8 pt-12 text-center sm:pb-10 sm:pt-16 lg:pt-20">
      <p class="eyebrow mb-4">Enquiry</p>
      <h1 class="text-h1 font-serif font-light text-charcoal">Plan your event</h1>
      <p class="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">A few quick questions about your celebration. It takes about three minutes, and nothing here is binding.</p>
    </section>
    <section class="container-x pb-20 sm:pb-24 lg:pb-28">
      <EnquiryWizard v-if="config" :config="config" />
      <div v-else class="border border-dashed border-charcoal/20 p-10 text-center">
        <p class="font-serif text-2xl">The enquiry form is temporarily unavailable.</p>
        <p class="mt-2 text-ink-muted">{{ error?.message || 'Please try again shortly or contact us directly.' }}</p>
        <NuxtLink to="/contact" class="btn-primary mt-6">Contact us</NuxtLink>
      </div>
    </section>
  </div>
</template>
