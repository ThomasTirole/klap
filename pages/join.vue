<script setup lang="ts">
const code = ref('')
const errorMsg = ref<string | null>(null)

function go() {
  errorMsg.value = null
  const cleaned = code.value.trim().toUpperCase()
  if (cleaned.length < 4) {
    errorMsg.value = 'Code invalide.'
    return
  }
  navigateTo(`/s/${cleaned}`)
}
</script>

<template>
  <main style="padding: 24px; max-width: 420px;">
    <h1>Rejoindre une session</h1>
    <input v-model="code" placeholder="ABCD12" style="display:block; width:100%; margin:8px 0;" />
    <button @click="go">Rejoindre</button>
    <p v-if="errorMsg" style="color:red;">{{ errorMsg }}</p>
  </main>
</template>
