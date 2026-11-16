<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const category = ref(typeof route.query.category === 'string' ? route.query.category : 'all')

watch(category, (value) => {
  router.replace({ query: value === 'all' ? {} : { category: value } })
})

const [{ data: categories }, { data: projects, status }] = await Promise.all([
  useFetch('/api/categories', { key: 'portfolio-categories', default: () => [] }),
  useFetch('/api/portfolio', { key: 'portfolio-all', query: computed(() => ({ category: category.value })), default: () => [], watch: [category] }),
])

const hasSamples = computed(() => projects.value.some(p => p.isSample))

usePageSeo({
  title: 'Portfolio',
  description: 'Browse weddings, birthdays, showers, corporate events and private celebrations planned and styled by Prissy Plans Events.',
})
</script>

<template>
  <div>
    <PageHero eyebrow="Portfolio" title="Our work" intro="A look at celebrations we have planned, styled and coordinated." placeholder="heroPortfolio" />

    <section class="container-x py-14 sm:py-20 lg:py-24">
      <PortfolioFilter v-model="category" :categories="categories" />

      <div class="relative mx-auto mt-12 min-h-[320px] max-w-6xl lg:mt-16">
        <div v-if="status === 'pending'" class="absolute inset-0 z-10 flex items-start justify-center bg-cream/70 pt-24" aria-live="polite">
          <AppIcon name="spinner" :size="28" class="text-mocha" />
        </div>
        <PortfolioGrid v-if="projects.length" :projects="projects" />
        <div v-else-if="status !== 'pending'" class="py-16 text-center">
          <p class="font-serif text-2xl text-charcoal">No projects here yet.</p>
          <p class="mt-2 text-ink-muted">Try another category, or browse event styles for ideas.</p>
          <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button class="btn-outline" @click="category = 'all'">Show all</button>
            <NuxtLink to="/inspiration" class="btn-primary">Browse inspiration</NuxtLink>
          </div>
        </div>
      </div>

      <p v-if="hasSamples" class="mx-auto mt-14 max-w-2xl text-center text-xs leading-relaxed text-ink-muted">
        Projects marked “Sample” use temporary stock photographs to preview the layout. They are not Prissy Plans Events projects and will be replaced with real event photography.
      </p>
    </section>

    <CtaBand />
  </div>
</template>
