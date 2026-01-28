<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Connexion Enseignant</h1>
        <p class="text-gray-600">Accédez à votre espace de gestion</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="votre.email@example.com"
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="••••••••"
          />
        </div>

        <!-- Error message -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {{ isLoading ? 'Connexion...' : 'Se connecter' }}
        </button>

        <!-- Links -->
        <div class="text-center space-y-2">
          <p class="text-sm text-gray-600">
            Pas encore de compte ?
            <NuxtLink to="/signup" class="text-indigo-600 hover:text-indigo-700 font-semibold">
              S'inscrire
            </NuxtLink>
          </p>
          <NuxtLink to="/" class="block text-sm text-gray-500 hover:text-gray-700">
            ← Retour à l'accueil
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signIn } = useAuth()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''

  try {
    await signIn(form.email, form.password)
    router.push('/teacher')
  } catch (err: any) {
    error.value = err.message || 'Une erreur est survenue lors de la connexion'
  } finally {
    isLoading.value = false
  }
}
</script>
