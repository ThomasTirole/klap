<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">KLAP</h1>
        <p class="text-gray-600">Rejoindre une session</p>
      </div>

      <form @submit.prevent="handleJoin" class="space-y-6">
        <!-- Code input -->
        <div>
          <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
            Code de la session
          </label>
          <input
            id="code"
            v-model="joinCode"
            type="text"
            required
            maxlength="6"
            class="w-full px-4 py-4 text-center text-2xl font-mono font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition uppercase"
            placeholder="ABC123"
            @input="joinCode = joinCode.toUpperCase()"
          />
          <p class="mt-2 text-sm text-gray-500 text-center">
            Entrez le code à 6 caractères fourni par votre enseignant
          </p>
        </div>

        <!-- Error message -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="isLoading || joinCode.length !== 6"
          class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-4 px-4 rounded-lg transition-colors text-lg"
        >
          {{ isLoading ? 'Vérification...' : 'Rejoindre' }}
        </button>

        <!-- Back link -->
        <NuxtLink to="/" class="block text-center text-sm text-gray-500 hover:text-gray-700">
          ← Retour à l'accueil
        </NuxtLink>
      </form>

      <!-- Info -->
      <div class="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p class="text-sm text-purple-800">
          <span class="font-semibold">Remarque :</span> Vous n'avez pas besoin de compte pour participer à une session. Entrez simplement le code fourni par votre enseignant.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getSessionByCode } = useSession()
const router = useRouter()

const joinCode = ref('')
const isLoading = ref(false)
const error = ref('')

const handleJoin = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const session = await getSessionByCode(joinCode.value)

    if (!session) {
      error.value = 'Code invalide. Vérifiez le code et réessayez.'
      return
    }

    if (session.status !== 'open') {
      error.value = 'Cette session n\'est pas ouverte pour le moment.'
      return
    }

    // Générer un participant_id unique et le stocker
    let participantId = localStorage.getItem(`klap_participant_${session.id}`)
    if (!participantId) {
      participantId = crypto.randomUUID()
      localStorage.setItem(`klap_participant_${session.id}`, participantId)
    }

    // Rediriger vers la session
    router.push(`/student/${session.join_code}`)
  } catch (err: any) {
    error.value = 'Une erreur est survenue. Veuillez réessayer.'
    console.error('Error joining session:', err)
  } finally {
    isLoading.value = false
  }
}
</script>
