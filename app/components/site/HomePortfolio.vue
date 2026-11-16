<script setup lang="ts">
/** Three featured projects; filtering lives on /portfolio. */
const { data: projects } = await useFetch('/api/portfolio', { key: 'home-portfolio', query: { featured: 1, limit: 3 }, default: () => [] })
</script>

<template>
  <section v-if="projects.length" class="container-x py-20 sm:py-24 lg:py-32">
    <SectionHeading eyebrow="Selected work" title="Moments we have brought to life." align="center" />
    <div class="mx-auto mt-12 max-w-6xl lg:mt-16">
      <PortfolioGrid :projects="projects" />
    </div>
    <div class="mt-12 text-center lg:mt-16">
      <NuxtLink to="/portfolio" class="btn-outline">View the portfolio</NuxtLink>
    </div>
  </section>
</template>
