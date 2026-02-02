<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-4">
            <NuxtLink to="/teacher" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </NuxtLink>
            <img src="/logo.svg" alt="Klap!" class="h-10" />
            <span class="text-gray-500">Nouvelle Session</span>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Créer une nouvelle session</h2>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Titre de la session -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              Titre de la session *
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="Ex: Cours de mathématiques - Chapitre 3"
            />
            <p class="mt-2 text-sm text-gray-500">
              Donnez un titre descriptif pour identifier facilement votre session
            </p>
          </div>

          <!-- Error message -->
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="isLoading"
              class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {{ isLoading ? 'Création...' : 'Créer la session' }}
            </button>
            <NuxtLink
              to="/teacher"
              class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Annuler
            </NuxtLink>
          </div>
        </form>

        <!-- Info box -->
        <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex gap-3">
            <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-blue-800">
              <p class="font-semibold mb-1">Après la création</p>
              <p>Un code unique sera automatiquement généré pour permettre à vos élèves de rejoindre la session. Vous pourrez ensuite ajouter des questions et lancer la session.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { createSession } = useSession()
const router = useRouter()

const form = reactive({
  title: '',
})

const isLoading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const session = await createSession(form.title)
    router.push(`/teacher/sessions/${session.id}`)
  } catch (err: any) {
    error.value = err.message || 'Une erreur est survenue lors de la création de la session'
  } finally {
    isLoading.value = false
  }
}
</script>
