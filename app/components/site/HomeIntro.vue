<script setup lang="ts">
const { get } = useSiteSettings()
</script>

<template>
  <section class="container-x py-20 text-center sm:py-24 lg:py-32">
    <div class="mx-auto max-w-2xl">
      <Ornament />
      <h2 v-reveal class="text-h2 mt-8 font-serif font-light text-charcoal">{{ get('intro.headline') }}</h2>
      <p v-reveal="{ delay: 80 }" class="prose-site mx-auto mt-6 max-w-xl">{{ get('intro.body') }}</p>
      <NuxtLink v-reveal="{ delay: 140 }" to="/about" class="link-underline mt-8 inline-block font-label text-[0.72rem] uppercase tracking-[0.24em] text-charcoal">Our story</NuxtLink>
    </div>
  </section>
</template>
