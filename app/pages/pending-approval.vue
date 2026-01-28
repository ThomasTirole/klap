<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-4">
          Compte en attente d'approbation
        </h1>

        <p class="text-gray-600 mb-6">
          Votre demande de compte enseignant a bien été enregistrée.
          Un administrateur doit approuver votre compte avant que vous puissiez accéder à la plateforme.
        </p>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-blue-800">
            Votre demande est en cours de traitement.
            Cela peut prendre quelques heures. Revenez un peu plus tard pour vérifier votre accès.
          </p>
        </div>

        <p class="text-sm text-gray-500 mb-6">
          Compte : <strong class="text-gray-900">{{ user?.email }}</strong>
        </p>

        <button
          @click="handleLogout"
          class="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, signOut } = useAuth()
const router = useRouter()

const handleLogout = async () => {
  await signOut()
  router.push('/login')
}
</script>
