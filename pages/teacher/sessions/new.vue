<script setup lang="ts">
definePageMeta({ middleware: ['teacher-auth'] })

const title = ref('')
</script>

<template>
  <main style="padding: 24px; max-width: 420px;">
    <h1>Nouvelle session</h1>

    <label>Titre</label>
    <input
        v-model="title"
        placeholder="Ex: UX – Accessibilité"
        style="display:block; width:100%; margin:8px 0;"
    />

    <button disabled>Créer la session</button>

    <p style="margin-top:16px;">
      <NuxtLink to="/teacher/sessions">← Retour</NuxtLink>
    </p>
  </main>
</template>
