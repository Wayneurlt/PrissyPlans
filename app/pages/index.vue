<script setup lang="ts">
const { get } = useSiteSettings()
const organisation = useOrganisationSchema()

usePageSeo(() => ({
  title: get('seo.defaultTitle', 'Event Planning, Decoration & Coordination in Kenya'),
  description: get('seo.defaultDescription'),
  structuredData: organisation,
}))
</script>

<template>
  <div>
    <HomeHero />
    <HomeIntro />
    <HomeServices />
    <HomePortfolio />
    <TestimonialsSection />
    <CtaBand />
  </div>
</template>
