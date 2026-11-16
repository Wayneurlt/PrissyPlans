<script setup lang="ts">
/** Three signature services; the full list lives on /services. */
const { data: services } = await useFetch('/api/services', { key: 'home-services', query: { featured: 1, limit: 3 }, default: () => [] })
</script>

<template>
  <section v-if="services.length" class="bg-blush/60 py-20 sm:py-24 lg:py-32">
    <div class="container-x">
      <SectionHeading eyebrow="What we do" title="Planning, styling and coordination." align="center" />
      <div class="mx-auto mt-12 grid max-w-6xl gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
        <div v-for="(s, i) in services" :key="s.id" v-reveal="{ delay: i * 80 }" :class="i === 2 ? 'sm:col-span-2 sm:mx-auto sm:w-1/2 lg:col-span-1 lg:w-auto' : ''">
          <ServiceCard :service="s" />
        </div>
      </div>
      <div class="mt-12 text-center lg:mt-16">
        <NuxtLink to="/services" class="btn-outline">View all services</NuxtLink>
      </div>
    </div>
  </section>
</template>
