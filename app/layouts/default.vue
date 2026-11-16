<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader />
    <main id="main" class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <WhatsAppFloat />
    <AppToasts />
  </div>
</template>
