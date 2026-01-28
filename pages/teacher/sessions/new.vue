<script setup lang="ts">
definePageMeta({ middleware: ['teacher-auth'] })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const title = ref('')
const previewCode = ref(generateJoinCode())
const loading = ref(false)
const errorMsg = ref<string | null>(null)

async function createSession() {
  if (!title.value || !user.value) return

  loading.value = true
  errorMsg.value = null

  const { error } = await supabase.from('sessions').insert({
    title: title.value,
    join_code: previewCode.value,
    owner_user_id: user.value.id,
  })

  loading.value = false

  if (error) {
    errorMsg.value = error.message
    return
  }

  navigateTo('/teacher/sessions')
}

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

    <button @click="createSession" :disabled="loading || !title">
      {{ loading ? 'Création…' : 'Créer la session' }}
    </button>

    <p v-if="errorMsg" style="color:red;">{{ errorMsg }}</p>

    <p style="margin-top:16px;">
      <NuxtLink to="/teacher/sessions">← Retour</NuxtLink>
    </p>
  </main>
</template>
