<script setup lang="ts">
definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()
const email = ref('')
const sent = ref(false)
const errorMsg = ref<string | null>(null)

async function sendMagicLink() {
  errorMsg.value = null
  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: { emailRedirectTo: `${window.location.origin}/teacher/callback` },
  })
  if (error) errorMsg.value = error.message
  else sent.value = true
}
</script>

<template>
  <main style="padding: 24px; max-width: 420px;">
    <h1>Connexion enseignant</h1>

    <div v-if="sent">
      <p>✅ Lien envoyé. Vérifie tes emails.</p>
      <NuxtLink to="/">Retour</NuxtLink>
    </div>

    <div v-else>
      <label>Email</label>
      <input v-model="email" type="email" placeholder="toi@ecole.ch" style="display:block; width:100%; margin:8px 0;" />
      <button @click="sendMagicLink">Envoyer un lien</button>

      <p v-if="errorMsg" style="color:red;">{{ errorMsg }}</p>
    </div>
  </main>
</template>
