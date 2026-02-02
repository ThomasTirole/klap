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
            <img src="/logo.svg" alt="Klap!" class="h-10" />
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
              <div>
                <!-- Sondages : Récapitulatif -->
                <div v-if="item.type === 'poll_single' || item.type === 'poll_multi'" class="space-y-2">
                  <div
                    v-for="option in getPollStats(item)"
                    :key="option.id"
                    class="flex items-center gap-3"
                  >
                    <div class="flex-1">
                      <div class="flex justify-between items-center mb-1">
                        <span class="text-sm font-medium text-gray-700">{{ option.text }}</span>
                        <span class="text-sm text-gray-500">{{ option.count }} vote{{ option.count > 1 ? 's' : '' }}</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div
                          class="bg-indigo-600 h-2 rounded-full transition-all"
                          :style="{ width: `${option.percentage}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Wordcloud : Compte des mots -->
                <div v-else-if="item.type === 'wordcloud'" class="space-y-2">
                  <div
                    v-for="word in getWordcloudStats(item)"
                    :key="word.text"
                    class="flex justify-between items-center bg-gray-50 rounded-lg p-2"
                  >
                    <span class="text-sm font-medium text-gray-700">{{ word.text }}</span>
                    <span class="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">{{ word.count }}</span>
                  </div>
                </div>

                <!-- Scale : Moyenne et distribution -->
                <div v-else-if="item.type === 'scale'" class="space-y-3">
                  <div class="bg-indigo-50 rounded-lg p-4 text-center">
                    <p class="text-sm text-gray-600 mb-1">Moyenne</p>
                    <p class="text-3xl font-bold text-indigo-600">{{ getScaleAverage(item) }}</p>
                  </div>
                  <div class="space-y-2">
                    <div
                      v-for="value in getScaleStats(item)"
                      :key="value.value"
                      class="flex items-center gap-3"
                    >
                      <span class="text-sm font-medium text-gray-700 w-8">{{ value.value }}</span>
                      <div class="flex-1">
                        <div class="flex justify-between items-center mb-1">
                          <div class="w-full bg-gray-200 rounded-full h-2">
                            <div
                              class="bg-indigo-600 h-2 rounded-full transition-all"
                              :style="{ width: `${value.percentage}%` }"
                            ></div>
                          </div>
                        </div>
                      </div>
                      <span class="text-sm text-gray-500 w-12 text-right">{{ value.count }}</span>
                    </div>
                  </div>
                </div>

                <!-- Questions ouvertes : Liste complète -->
                <div v-else-if="item.type === 'open'" class="space-y-2">
                  <div
                    v-for="(response, index) in item.responses"
                    :key="response.id"
                    class="bg-gray-50 rounded-lg p-3 flex justify-between items-start"
                  >
                    <div class="flex-1">
                      <p class="text-sm text-gray-700">{{ response.payload.text }}</p>
                      <p class="text-xs text-gray-500 mt-1">
                        {{ formatDate(response.created_at) }} • Participant {{ response.participant_id.substring(0, 8) }}
                      </p>
                    </div>
                    <button
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

const getPollStats = (item: any) => {
  const config = item.config as any
  const options = config.options || []

  // Compter les votes pour chaque option
  const counts: Record<string, number> = {}
  options.forEach((opt: any) => {
    counts[opt.id] = 0
  })

  item.responses.forEach((response: any) => {
    const payload = response.payload

    // Poll multi : optionIds array
    if (payload.optionIds && Array.isArray(payload.optionIds)) {
      payload.optionIds.forEach((id: string) => {
        counts[id] = (counts[id] || 0) + 1
      })
    }
    // Poll single : optionId string
    else if (payload.optionId) {
      counts[payload.optionId] = (counts[payload.optionId] || 0) + 1
    }
  })

  const total = item.responses.length || 1

  return options.map((opt: any) => ({
    id: opt.id,
    text: opt.label || opt.text, // Support both 'label' and 'text'
    count: counts[opt.id] || 0,
    percentage: Math.round(((counts[opt.id] || 0) / total) * 100)
  }))
}

const getWordcloudStats = (item: any) => {
  const wordCounts: Record<string, number> = {}

  item.responses.forEach((response: any) => {
    const payload = response.payload
    if (payload.text) {
      // Parser les mots (séparés par des virgules)
      const words = payload.text
        .split(',')
        .map((w: string) => w.trim().toLowerCase())
        .filter((w: string) => w.length > 0)

      words.forEach((word: string) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1
      })
    }
  })

  return Object.entries(wordCounts)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
}

const getScaleStats = (item: any) => {
  const config = item.config as any
  const min = config.min || 1
  const max = config.max || 5

  const counts: Record<number, number> = {}
  for (let i = min; i <= max; i++) {
    counts[i] = 0
  }

  item.responses.forEach((response: any) => {
    const value = response.payload.value
    if (value !== undefined && value !== null) {
      counts[value] = (counts[value] || 0) + 1
    }
  })

  const total = item.responses.length || 1

  const stats = []
  for (let i = min; i <= max; i++) {
    stats.push({
      value: i,
      count: counts[i] || 0,
      percentage: Math.round(((counts[i] || 0) / total) * 100)
    })
  }

  return stats
}

const getScaleAverage = (item: any) => {
  if (item.responses.length === 0) return '0.0'

  const sum = item.responses.reduce((acc: number, response: any) => {
    return acc + (response.payload.value || 0)
  }, 0)

  return (sum / item.responses.length).toFixed(1)
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

  console.log('[ResponsesPage] Deleting response:', confirmDeleteResponse.value.response.id)

  try {
    const { error, data } = await supabase
      .from('responses')
      .delete()
      .eq('id', confirmDeleteResponse.value.response.id)
      .select()

    console.log('[ResponsesPage] Delete result:', { data, error })

    if (error) {
      console.error('[ResponsesPage] Delete error:', error)
      throw error
    }

    console.log('[ResponsesPage] Successfully deleted, reloading all responses...')
    // Recharger les réponses
    await loadAllResponses()
  } catch (error) {
    console.error('[ResponsesPage] Error deleting response:', error)
    alert('Erreur lors de la suppression : ' + JSON.stringify(error))
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
