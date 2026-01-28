<script setup lang="ts">
definePageMeta({ middleware: ['teacher-auth'] })

const title = ref('')
const previewCode = ref(generateJoinCode())

function regenerate() {
  previewCode.value = generateJoinCode()
}
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

    <div style="margin: 12px 0;">
      <strong>Code (preview):</strong>
      <code style="margin-left: 8px;">{{ previewCode }}</code>
      <button @click="regenerate" style="margin-left: 10px;">Regénérer</button>
    </div>

    <button disabled>Créer la session</button>

    <p style="margin-top:16px;">
      <NuxtLink to="/teacher/sessions">← Retour</NuxtLink>
    </p>
  </main>
</template>
