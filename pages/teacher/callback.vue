<script setup lang="ts">
const user = useSupabaseUser()

watchEffect(() => {
  if (user.value) navigateTo('/teacher/sessions')
})
</script>

<template>
  <main style="padding: 24px;">
    <p>Connexion en cours…</p>
  </main>
</template>
