<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'New project' })

async function onSaved(result: { id: string }) {
  await navigateTo(`/admin/portfolio/${result.id}`)
}
</script>

<template>
  <div>
    <AdminPageHeader title="New portfolio project" description="Add the details first, then upload photographs." back="/admin/portfolio" />
    <PortfolioForm @saved="onSaved" />
  </div>
</template>
