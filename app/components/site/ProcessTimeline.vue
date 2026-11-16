<script setup lang="ts">
const steps = [
  { title: 'Tell us your vision', text: 'Share your event, date and the feeling you want, through our enquiry form or on WhatsApp.' },
  { title: 'Consultation & proposal', text: 'We talk through ideas, scope and budget, then send a tailored proposal.' },
  { title: 'Planning & preparation', text: 'Suppliers are sourced and briefed and timelines built, with regular updates.' },
  { title: 'Event execution', text: 'We set up, style and coordinate the day so you can enjoy every moment.' },
]
</script>

<template>
  <section class="container-x py-16 sm:py-20 lg:py-28">
    <SectionHeading eyebrow="How it works" title="A calm, clear path to your celebration." align="center" />
    <ol class="mx-auto mt-12 grid max-w-6xl gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
      <li v-for="(s, i) in steps" :key="s.title" v-reveal="{ delay: i * 70 }" class="border-t border-charcoal/15 pt-6">
        <span class="font-serif text-lg italic text-mocha">0{{ i + 1 }}</span>
        <h3 class="mt-2 font-serif text-2xl font-normal text-charcoal">{{ s.title }}</h3>
        <p class="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">{{ s.text }}</p>
      </li>
    </ol>
  </section>
</template>
