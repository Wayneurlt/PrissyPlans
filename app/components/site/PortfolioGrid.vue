<script setup lang="ts">
import type { ProjectDTO } from '#shared/types/public'

defineProps<{ projects: ProjectDTO[] }>()
</script>

<template>
  <div class="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
    <div v-for="(project, i) in projects" :key="project.id" v-reveal="{ delay: (i % 3) * 70 }">
      <PortfolioCard :project="project" />
    </div>
  </div>
</template>
