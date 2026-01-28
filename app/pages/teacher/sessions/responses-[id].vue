<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-4">
            <NuxtLink :to="`/teacher/sessions/${sessionId}`" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </NuxtLink>
            <h1 class="text-2xl font-bold text-indigo-600">KLAP</h1>
            <span v-if="session" class="text-gray-500">{{ session.title }}</span>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500">Chargement...</p>
      </div>

      <div v-else-if="!session" class="bg-white rounded-lg border-2 border-red-200 p-8 text-center">
        <p class="text-red-600 font-semibold mb-4">Session introuvable</p>
        <NuxtLink to="/teacher" class="text-indigo-600 hover:text-indigo-700">
          Retour au dashboard
        </NuxtLink>
      </div>

      <div v-else>
        <!-- Header -->
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Réponses</h2>
          <p class="text-gray-600">
            Toutes les réponses reçues pour cette session • {{ totalResponses }} réponse(s)
          </p>
        </div>

        <!-- Contenu -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div v-if="loadingResponses" class="text-center py-12">
            <p class="text-gray-500">Chargement des réponses...</p>
          </div>

          <div v-else-if="allResponses.length === 0" class="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-gray-600">Aucune réponse pour le moment</p>
          </div>

          <div v-else class="space-y-4">
            <!-- Groupe par question -->
            <div
              v-for="item in itemsWithResponses"
              :key="item.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h4 class="font-semibold text-gray-900">{{ item.title }}</h4>
                  <span class="text-xs text-gray-500">{{ itemTypeLabel(item.type) }}</span>
                </div>
                <span class="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                  {{ item.responses.length }} réponse(s)
                </span>
              </div>

              <!-- Réponses pour cette question -->
              <div class="space-y-2">
                <div
                  v-for="response in item.responses"
                  :key="response.id"
                  class="bg-gray-50 rounded-lg p-3 flex justify-between items-start"
                >
                  <div class="flex-1">
                    <!-- Affichage selon le type -->
                    <div v-if="item.type === 'poll_single' || item.type === 'poll_multi'" class="text-sm text-gray-700">
                      <strong>Choix :</strong> {{ formatPollResponse(response.payload, item) }}
                    </div>
                    <div v-else-if="item.type === 'open'" class="text-sm text-gray-700">
                      {{ response.payload.text }}
                    </div>
                    <div v-else-if="item.type === 'scale'" class="text-sm text-gray-700">
                      <strong>Note :</strong> {{ response.payload.value }}
                    </div>
                    <div v-else-if="item.type === 'wordcloud'" class="text-sm text-gray-700">
                      <strong>Mots :</strong> {{ response.payload.words.join(', ') }}
                    </div>

                    <p class="text-xs text-gray-500 mt-1">
                      {{ formatDate(response.created_at) }} • Participant {{ response.participant_id.substring(0, 8) }}
                    </p>
                  </div>

                  <!-- Bouton supprimer (pour open et wordcloud) -->
                  <button
                    v-if="item.type === 'open' || item.type === 'wordcloud'"
                    @click="openDeleteResponse(response, item)"
                    class="ml-4 p-1 text-gray-400 hover:text-red-600 transition-colors"
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
    </div>

    <!-- Modal de confirmation suppression réponse -->
    <ConfirmModal
      :show="confirmDeleteResponse.show"
      title="Supprimer la réponse ?"
      :message="confirmDeleteResponse.item?.type === 'wordcloud'
        ? 'Êtes-vous sûr de vouloir supprimer ces mots du nuage ? Cette action est irréversible.'
        : 'Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action est irréversible.'"
      confirm-text="Supprimer"
      cancel-text="Annuler"
      variant="danger"
      @confirm="handleDeleteResponse"
      @cancel="handleDeleteResponseCancel"
    />
  </div>
</template>

<script setup lang="ts">
import type { Session, Item } from '~/types/database'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const supabase = useSupabase()
const { getSession, getSessionItems } = useSession()

const sessionId = route.params.id as string
const session = ref<Session | null>(null)
const items = ref<Item[]>([])
const loading = ref(true)
const allResponses = ref<any[]>([])
const loadingResponses = ref(false)
const confirmDeleteResponse = ref({
  show: false,
  response: null as any,
  item: null as Item | null
})

const totalResponses = computed(() => allResponses.value.length)

const itemsWithResponses = computed(() => {
  return items.value
    .map(item => ({
      ...item,
      responses: allResponses.value.filter(r => r.item_id === item.id)
    }))
    .filter(item => item.responses.length > 0)
})

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
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPollResponse = (payload: any, item: Item) => {
  const config = item.config as any
  if (Array.isArray(payload.selected)) {
    // Multiple
    return payload.selected.map((id: string) => {
      const option = config.options.find((o: any) => o.id === id)
      return option?.text || id
    }).join(', ')
  } else {
    // Single
    const option = config.options.find((o: any) => o.id === payload.selected)
    return option?.text || payload.selected
  }
}

const loadAllResponses = async () => {
  loadingResponses.value = true
  try {
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })

    if (error) throw error
    allResponses.value = data || []
  } catch (error) {
    console.error('Error loading responses:', error)
  } finally {
    loadingResponses.value = false
  }
}

const openDeleteResponse = (response: any, item: Item) => {
  confirmDeleteResponse.value = {
    show: true,
    response,
    item
  }
}

const handleDeleteResponse = async () => {
  if (!confirmDeleteResponse.value.response) return

  try {
    const { error } = await supabase
      .from('responses')
      .delete()
      .eq('id', confirmDeleteResponse.value.response.id)

    if (error) throw error

    // Recharger les réponses
    await loadAllResponses()
  } catch (error) {
    console.error('Error deleting response:', error)
  }

  confirmDeleteResponse.value = { show: false, response: null, item: null }
}

const handleDeleteResponseCancel = () => {
  confirmDeleteResponse.value = { show: false, response: null, item: null }
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

    // Charger les réponses
    await loadAllResponses()
  } catch (error) {
    console.error('Error loading session:', error)
  } finally {
    loading.value = false
  }
})
</script>
