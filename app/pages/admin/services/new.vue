<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'New service' })
</script>

<template>
  <div>
    <AdminPageHeader title="New service" description="Add the details first, then upload images." back="/admin/services" />
    <ServiceForm @saved="(r) => navigateTo(`/admin/services/${r.id}`)" />
  </div>
</template>
