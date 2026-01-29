<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <!-- Icône de succès -->
        <div class="mb-6">
          <div class="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <!-- Message -->
        <h1 class="text-3xl font-bold text-gray-900 mb-3">Merci !</h1>
        <p class="text-lg text-gray-600 mb-6">
          La session est terminée. Merci pour votre participation !
        </p>

        <!-- Informations -->
        <div class="bg-purple-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-purple-800">
            Vos réponses ont été enregistrées avec succès.
          </p>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <NuxtLink
            to="/join"
            class="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Rejoindre une autre session
          </NuxtLink>

          <a
            href="/"
            class="block w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-gray-600 mt-6 text-sm">
        Powered by <span class="font-bold text-purple-600">KLAP</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page de fin de session
</script>
