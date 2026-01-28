<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">KLAP</h1>
        <p class="text-gray-600">Plateforme d'interaction en classe</p>
      </div>

      <div class="space-y-4">
        <!-- Test de connexion Supabase -->
        <div class="p-4 border rounded-lg" :class="connectionStatus === 'success' ? 'bg-green-50 border-green-200' : connectionStatus === 'error' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'">
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold text-gray-700">Connexion Supabase</span>
            <span v-if="connectionStatus === 'success'" class="text-green-600">✓</span>
            <span v-else-if="connectionStatus === 'error'" class="text-red-600">✗</span>
            <span v-else class="text-gray-400">⋯</span>
          </div>
          <p class="text-sm text-gray-600">{{ connectionMessage }}</p>
        </div>

        <!-- Liens de navigation -->
        <div class="pt-4 space-y-3">
          <NuxtLink
            to="/login"
            class="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
          >
            Connexion Enseignant
          </NuxtLink>

          <NuxtLink
            to="/join"
            class="block w-full bg-white hover:bg-gray-50 text-indigo-600 font-semibold py-3 px-4 rounded-lg text-center border-2 border-indigo-600 transition-colors"
          >
            Rejoindre une session
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabase()
const connectionStatus = ref<'pending' | 'success' | 'error'>('pending')
const connectionMessage = ref('Vérification de la connexion...')

onMounted(async () => {
  try {
    // Test de connexion à Supabase
    const { data, error } = await supabase
      .from('sessions')
      .select('count')
      .limit(1)

    if (error) throw error

    connectionStatus.value = 'success'
    connectionMessage.value = 'Connexion établie avec succès'
  } catch (error: any) {
    connectionStatus.value = 'error'
    connectionMessage.value = error.message || 'Erreur de connexion'
  }
})
</script>
