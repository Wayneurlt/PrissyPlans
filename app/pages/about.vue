<script setup lang="ts">
const { get, real } = useSiteSettings()
const { isConfigured, link, label } = useWhatsApp()

usePageSeo(() => ({
  title: 'About',
  description: get('about.intro'),
  image: null,
}))

const teamPhoto = computed(() => real('about.teamPhoto'))
const teamName = computed(() => get('about.teamName'))
const teamRole = computed(() => get('about.teamRole'))

const differences = [
  { icon: 'heart', title: 'Personal attention', text: 'One dedicated planner from the first conversation to the final farewell, so nothing is lost in translation.' },
  { icon: 'palette', title: 'Creative direction', text: 'Styling tailored to you: your palette, your story, your guests, never a template.' },
  { icon: 'layers', title: 'Quiet coordination', text: 'Suppliers, timings and surprises handled behind the scenes while you stay present.' },
]
</script>

<template>
  <div>
    <PageHero eyebrow="About us" :title="get('about.headline')" :intro="get('about.intro')" placeholder="heroAbout" />

    <!-- Story -->
    <section class="container-x py-16 sm:py-20 lg:py-28">
      <div class="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div v-reveal class="image-zoom mx-auto aspect-[4/5] w-full max-w-md overflow-hidden lg:max-w-none">
          <AppImage placeholder="aboutStory" sizes="100vw lg:50vw" />
        </div>
        <div>
          <SectionHeading eyebrow="Our story" title="Where Prissy Plans Events began." />
          <div v-reveal="{ delay: 80 }" class="prose-site mt-6">
            <p v-for="(p, i) in paragraphs(get('about.story'))" :key="i">{{ p }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Philosophy & approach -->
    <section class="bg-blush/60 py-16 sm:py-20 lg:py-28">
      <div class="container-x">
        <div class="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:gap-16">
          <div v-reveal>
            <p class="eyebrow mb-3">Creative philosophy</p>
            <h2 class="text-h3 font-serif font-normal text-charcoal">Design that feels like the people it celebrates.</h2>
            <div class="prose-site mt-5">
              <p v-for="(p, i) in paragraphs(get('about.philosophy'))" :key="i">{{ p }}</p>
            </div>
          </div>
          <div v-reveal="{ delay: 80 }">
            <p class="eyebrow mb-3">Our approach</p>
            <h2 class="text-h3 font-serif font-normal text-charcoal">Structure behind the magic.</h2>
            <div class="prose-site mt-5">
              <p v-for="(p, i) in paragraphs(get('about.approach'))" :key="i">{{ p }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- What makes us different -->
    <section class="container-x py-16 sm:py-20 lg:py-28">
      <SectionHeading eyebrow="What makes us different" title="Personal, creative, calm." :text="get('about.difference')" align="center" />
      <ul class="mx-auto mt-12 grid max-w-5xl gap-10 text-center sm:grid-cols-3 sm:gap-8">
        <li v-for="(d, i) in differences" :key="d.title" v-reveal="{ delay: i * 60 }">
          <AppIcon :name="d.icon" :size="24" class="mx-auto text-mocha" />
          <h3 class="mt-4 font-serif text-2xl font-normal text-charcoal">{{ d.title }}</h3>
          <p class="mx-auto mt-2 max-w-xs text-[0.95rem] leading-relaxed text-ink-muted">{{ d.text }}</p>
        </li>
      </ul>
    </section>

    <!-- Planner -->
    <section class="border-t border-charcoal/10 py-16 sm:py-20 lg:py-24">
      <div class="container-x">
        <div :class="['mx-auto grid max-w-5xl items-center gap-10', teamPhoto ? 'md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-14' : 'text-center']">
          <div v-if="teamPhoto" v-reveal class="image-zoom mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden">
            <AppImage :media="{ provider: teamPhoto.startsWith('http') ? 'EXTERNAL' : 'CLOUDINARY', url: teamPhoto, publicId: teamPhoto.startsWith('http') ? null : teamPhoto }" :alt="teamName" sizes="100vw md:40vw" />
          </div>
          <div :class="teamPhoto ? '' : 'mx-auto max-w-xl'">
            <p class="eyebrow mb-3">Meet the planner</p>
            <h2 class="text-h2 font-serif font-light text-charcoal">{{ teamName }}</h2>
            <p class="mt-2 font-label text-[0.7rem] uppercase tracking-[0.24em] text-mocha">{{ teamRole }}</p>
            <p class="prose-site mt-5">Every enquiry is read personally, and every event is planned with the care we would want for our own family. Let's talk about yours.</p>
            <div :class="['mt-8 flex flex-col gap-3 sm:flex-row', teamPhoto ? '' : 'justify-center']">
              <NuxtLink to="/enquire" class="btn-primary">Plan your event</NuxtLink>
              <a v-if="isConfigured" :href="link()" target="_blank" rel="noopener noreferrer" class="btn-outline"><AppIcon name="whatsapp" :size="18" /> {{ label }}</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <CtaBand />
  </div>
</template>
