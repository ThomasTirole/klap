<script setup lang="ts">
const route = useRoute()
const code = computed(() => String(route.params.code || '').toUpperCase())
</script>

<template>
  <main style="padding: 24px;">
    <h1>Session élève</h1>
    <p>Code: <code>{{ code }}</code></p>
  </main>
</template>
