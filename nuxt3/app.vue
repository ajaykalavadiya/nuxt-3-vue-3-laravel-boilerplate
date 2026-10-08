<script setup lang="ts">
useHead({
  titleTemplate: (title) => (title ? `${title} · Acme SaaS` : 'Acme SaaS'),
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
