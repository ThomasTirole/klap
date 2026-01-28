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
            <h1 class="text-2xl font-bold text-indigo-600">KLAP</h1>
          </div>
        </div>
      </div>
    </nav>

    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <p class="text-center text-gray-500">Chargement...</p>
    </div>

    <div v-else-if="!session" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg border-2 border-red-200 p-8 text-center">
        <p class="text-red-600 font-semibold mb-4">Session introuvable</p>
        <NuxtLink to="/teacher" class="text-indigo-600 hover:text-indigo-700">
          Retour au dashboard
        </NuxtLink>
      </div>
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header de la session -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ session.title }}</h2>
            <div class="flex items-center gap-4">
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
              <span class="text-sm text-gray-500">
                Créée le {{ formatDate(session.created_at) }}
              </span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500 mb-1">Code d'accès</p>
            <p class="text-3xl font-mono font-bold text-indigo-600">{{ session.join_code }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <NuxtLink
            v-if="session.status === 'open' && items.length > 0"
            :to="`/teacher/live/${session.id}`"
            class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Mode Live
          </NuxtLink>
          <button
            v-if="session.status === 'draft'"
            @click="openSession"
            class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            Ouvrir la session
          </button>
          <button
            v-if="session.status === 'open'"
            @click="closeSession"
            class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Fermer la session
          </button>
          <button
            @click="confirmDelete"
            class="px-6 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>

      <!-- Questions -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-900">Questions</h3>
          <button
            @click="showAddQuestion = true"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            + Ajouter une question
          </button>
        </div>

        <div v-if="items.length === 0" class="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-600 mb-2">Aucune question pour le moment</p>
          <p class="text-sm text-gray-500">Ajoutez votre première question pour commencer</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(item, index) in items"
            :key="item.id"
            class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span class="text-sm font-semibold text-indigo-600">{{ index + 1 }}</span>
              </div>
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h4 class="font-semibold text-gray-900">{{ item.title }}</h4>
                    <p v-if="item.prompt" class="text-sm text-gray-600 mt-1">{{ item.prompt }}</p>
                  </div>
                  <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                    {{ itemTypeLabel(item.type) }}
                  </span>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="editItem(item)"
                  class="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                  title="Modifier"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  @click="deleteItemConfirm(item)"
                  class="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Supprimer"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ajouter question -->
    <QuestionBuilder
      v-if="showAddQuestion"
      :session-id="sessionId"
      @close="showAddQuestion = false"
      @created="handleQuestionCreated"
    />
  </div>
</template>

<script setup lang="ts">
import type { Session, Item } from '~/types/database'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { getSession, updateSession, deleteSession, getSessionItems, deleteItem, updateItem } = useSession()

const sessionId = route.params.id as string
const session = ref<Session | null>(null)
const items = ref<Item[]>([])
const loading = ref(true)
const showAddQuestion = ref(false)
const editingItem = ref<Item | null>(null)

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    open: 'Ouverte',
    closed: 'Fermée'
  }
  return labels[status] || status
}

const itemTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    poll_single: 'Sondage (choix unique)',
    poll_multi: 'Sondage (choix multiple)',
    wordcloud: 'Nuage de mots',
    open: 'Question ouverte',
    scale: 'Échelle'
  }
  return labels[type] || type
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const openSession = async () => {
  if (!session.value) return
  try {
    session.value = await updateSession(session.value.id, { status: 'open' })
  } catch (error) {
    console.error('Error opening session:', error)
  }
}

const closeSession = async () => {
  if (!session.value) return
  try {
    session.value = await updateSession(session.value.id, { status: 'closed' })
  } catch (error) {
    console.error('Error closing session:', error)
  }
}

const confirmDelete = async () => {
  if (!session.value) return
  if (confirm(`Êtes-vous sûr de vouloir supprimer la session "${session.value.title}" ?`)) {
    try {
      await deleteSession(session.value.id)
      router.push('/teacher')
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }
}

const handleQuestionCreated = async () => {
  // Recharger les items après création d'une question
  try {
    items.value = await getSessionItems(sessionId)
  } catch (error) {
    console.error('Error reloading items:', error)
  }
}

const editItem = (item: Item) => {
  // TODO: Implémenter l'édition de question
  // Pour l'instant, on peut juste permettre de modifier le titre
  const newTitle = prompt('Nouveau titre :', item.title)
  if (newTitle && newTitle !== item.title) {
    updateItemTitle(item.id, newTitle)
  }
}

const updateItemTitle = async (itemId: string, newTitle: string) => {
  try {
    await updateItem(itemId, { title: newTitle })
    items.value = await getSessionItems(sessionId)
  } catch (error) {
    console.error('Error updating item:', error)
    alert('Erreur lors de la modification')
  }
}

const deleteItemConfirm = async (item: Item) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer "${item.title}" ?`)) {
    try {
      await deleteItem(item.id)
      items.value = await getSessionItems(sessionId)
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Erreur lors de la suppression')
    }
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const [sessionData, itemsData] = await Promise.all([
      getSession(sessionId),
      getSessionItems(sessionId)
    ])

    session.value = sessionData
    items.value = itemsData
  } catch (error) {
    console.error('Error loading session:', error)
  } finally {
    loading.value = false
  }
})
</script>
