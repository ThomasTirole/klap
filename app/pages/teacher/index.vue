<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-indigo-600">KLAP</h1>
            <span class="ml-4 text-gray-500">Espace Enseignant</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">{{ user?.email }}</span>
            <button
              @click="handleLogout"
              class="text-sm text-gray-700 hover:text-indigo-600 font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Mes Sessions</h2>
        <p class="text-gray-600">Créez et gérez vos sessions interactives</p>
      </div>

      <!-- Bouton créer session -->
      <div class="mb-8">
        <NuxtLink
          to="/teacher/sessions/new"
          class="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle Session
        </NuxtLink>
      </div>

      <!-- Liste des sessions -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500">Chargement...</p>
      </div>

      <div v-else-if="sessions.length === 0" class="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucune session</h3>
        <p class="text-gray-600 mb-4">Créez votre première session pour commencer</p>
        <NuxtLink
          to="/teacher/sessions/new"
          class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Créer une session
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold text-gray-900">{{ session.title }}</h3>
            <span
              class="px-3 py-1 text-xs font-semibold rounded-full"
              :class="{
                'bg-gray-100 text-gray-700': session.status === 'draft',
                'bg-green-100 text-green-700': session.status === 'open',
                'bg-red-100 text-red-700': session.status === 'closed'
              }"
            >
              {{ statusLabel(session.status) }}
            </span>
          </div>

          <div class="mb-4">
            <p class="text-sm text-gray-500">Code d'accès</p>
            <p class="text-2xl font-mono font-bold text-indigo-600">{{ session.join_code }}</p>
          </div>

          <div class="flex gap-2">
            <button class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
              Ouvrir
            </button>
            <button class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
              ⋯
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Session } from '~/types/database'

definePageMeta({
  middleware: 'auth'
})

const { user, signOut } = useAuth()
const supabase = useSupabase()
const router = useRouter()

const sessions = ref<Session[]>([])
const loading = ref(true)

const handleLogout = async () => {
  await signOut()
  router.push('/')
}

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    open: 'Ouverte',
    closed: 'Fermée'
  }
  return labels[status] || status
}

onMounted(async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    sessions.value = data || []
  } catch (error) {
    console.error('Error loading sessions:', error)
  } finally {
    loading.value = false
  }
})
</script>
