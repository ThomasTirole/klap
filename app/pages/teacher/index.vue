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
            <NuxtLink
              :to="`/teacher/sessions/${session.id}`"
              class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
            >
              Ouvrir
            </NuxtLink>
            <button
              @click="toggleMenu(session.id)"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors relative"
            >
              ⋯
              <!-- Menu déroulant -->
              <div
                v-if="openMenuId === session.id"
                class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
              >
                <button
                  @click.stop="duplicateSession(session.id)"
                  class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Dupliquer
                </button>
                <button
                  @click.stop="deleteSessionConfirm(session)"
                  class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
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
const { getUserSessions, deleteSession } = useSession()
const router = useRouter()

const sessions = ref<Session[]>([])
const loading = ref(true)
const openMenuId = ref<string | null>(null)

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

const toggleMenu = (sessionId: string) => {
  openMenuId.value = openMenuId.value === sessionId ? null : sessionId
}

const duplicateSession = async (sessionId: string) => {
  // TODO: Implémenter la duplication
  console.log('Duplicate session:', sessionId)
  alert('Fonctionnalité de duplication à venir')
  openMenuId.value = null
}

const deleteSessionConfirm = async (session: Session) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer "${session.title}" ?`)) {
    try {
      await deleteSession(session.id)
      // Recharger les sessions
      sessions.value = await getUserSessions()
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Erreur lors de la suppression')
    }
  }
  openMenuId.value = null
}

// Fermer le menu au clic extérieur
const handleClickOutside = () => {
  openMenuId.value = null
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

onMounted(async () => {
  loading.value = true
  try {
    // Utiliser getUserSessions pour filtrer par owner_user_id
    const { getUserSessions } = useSession()
    sessions.value = await getUserSessions()
  } catch (error) {
    console.error('Error loading sessions:', error)
  } finally {
    loading.value = false
  }
})
</script>
