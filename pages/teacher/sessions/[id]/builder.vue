<script setup lang="ts">
definePageMeta({ middleware: ['teacher-auth'] })

const route = useRoute()
const sessionId = computed(() => String(route.params.id))
</script>

<template>
  <main style="padding: 24px;">
    <h1>Builder</h1>
    <p>Session ID: <code>{{ sessionId }}</code></p>
    <NuxtLink to="/teacher/sessions">← Retour</NuxtLink>
  </main>
</template>
