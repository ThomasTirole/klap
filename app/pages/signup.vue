<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
        <p class="text-gray-600">Commencez à utiliser KLAP</p>
      </div>

      <form @submit.prevent="handleSignup" class="space-y-6">
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
            minlength="6"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="••••••••"
          />
          <p class="mt-1 text-xs text-gray-500">Au moins 6 caractères</p>
        </div>

        <!-- Confirm Password -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
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

        <!-- Success message -->
        <div v-if="success" class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-600">{{ success }}</p>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {{ isLoading ? 'Création...' : 'Créer mon compte' }}
        </button>

        <!-- Links -->
        <div class="text-center space-y-2">
          <p class="text-sm text-gray-600">
            Déjà un compte ?
            <NuxtLink to="/login" class="text-indigo-600 hover:text-indigo-700 font-semibold">
              Se connecter
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
const { signUp } = useAuth()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})

const isLoading = ref(false)
const error = ref('')
const success = ref('')

const handleSignup = async () => {
  isLoading.value = true
  error.value = ''
  success.value = ''

  // Vérifier que les mots de passe correspondent
  if (form.password !== form.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'
    isLoading.value = false
    return
  }

  try {
    await signUp(form.email, form.password)
    success.value = 'Compte créé avec succès ! Vérifiez votre email pour confirmer votre inscription.'

    // Rediriger après 2 secondes
    setTimeout(() => {
      router.push('/teacher')
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Une erreur est survenue lors de la création du compte'
  } finally {
    isLoading.value = false
  }
}
</script>
