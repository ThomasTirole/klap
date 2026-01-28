<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
    <!-- Header -->
    <nav class="bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-4">
            <NuxtLink
              :to="`/teacher/sessions/${sessionId}`"
              class="text-white hover:text-gray-200 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </NuxtLink>
            <h1 class="text-xl font-bold text-white">KLAP</h1>
            <span v-if="session" class="text-gray-300">{{ session.title }}</span>
          </div>
          <div v-if="session" class="text-right">
            <p class="text-sm text-gray-300">Code d'accès</p>
            <p class="text-2xl font-mono font-bold text-white">{{ session.join_code }}</p>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-white text-lg">Chargement...</p>
      </div>

      <!-- Erreur -->
      <div v-else-if="!session" class="bg-white rounded-lg p-8 text-center">
        <p class="text-red-600 font-semibold mb-4">Session introuvable</p>
        <NuxtLink to="/teacher" class="text-indigo-600 hover:text-indigo-700">
          Retour au dashboard
        </NuxtLink>
      </div>

      <!-- Contrôles -->
      <div v-else class="space-y-6">
        <!-- Sélection de question -->
        <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border border-white border-opacity-20 p-6">
          <div class="flex items-center justify-between gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-200 mb-2">
                Question active
              </label>
              <select
                v-model="selectedItemId"
                @change="activateQuestion"
                class="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white focus:ring-2 focus:ring-white focus:ring-opacity-50 outline-none transition"
              >
                <option value="" class="text-gray-900">Aucune question active</option>
                <option
                  v-for="(item, index) in items"
                  :key="item.id"
                  :value="item.id"
                  class="text-gray-900"
                >
                  {{ index + 1 }}. {{ item.title }}
                </option>
              </select>
            </div>

            <!-- Navigation -->
            <div class="flex gap-2">
              <button
                @click="previousQuestion"
                :disabled="!canGoPrevious"
                class="px-4 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 disabled:bg-opacity-10 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                @click="nextQuestion"
                :disabled="!canGoNext"
                class="px-4 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 disabled:bg-opacity-10 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Affichage des résultats -->
        <div v-if="activeItem" class="bg-white rounded-xl shadow-2xl p-8">
          <PollSingleResults
            v-if="activeItem.type === 'poll_single'"
            :key="activeItem.id"
            :item="activeItem"
          />

          <PollMultiResults
            v-else-if="activeItem.type === 'poll_multi'"
            :key="activeItem.id"
            :item="activeItem"
          />

          <OpenResults
            v-else-if="activeItem.type === 'open'"
            :key="activeItem.id"
            :item="activeItem"
          />

          <ScaleResults
            v-else-if="activeItem.type === 'scale'"
            :key="activeItem.id"
            :item="activeItem"
          />

          <WordcloudResults
            v-else-if="activeItem.type === 'wordcloud'"
            :key="activeItem.id"
            :item="activeItem"
          />

          <div v-else class="text-center py-12">
            <p class="text-gray-600">
              L'affichage des résultats pour ce type de question sera bientôt disponible.
            </p>
          </div>
        </div>

        <!-- Aucune question active -->
        <div v-else class="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border-2 border-dashed border-white border-opacity-30 p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-white text-opacity-60 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-xl text-white mb-2">Aucune question active</p>
          <p class="text-gray-300">Sélectionnez une question pour afficher les résultats en temps réel</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Session, Item } from '~/types/database'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const { getSession, updateSession, getSessionItems } = useSession()

const sessionId = route.params.id as string
const session = ref<Session | null>(null)
const items = ref<Item[]>([])
const activeItem = ref<Item | null>(null)
const loading = ref(true)
const selectedItemId = ref('')

const currentIndex = computed(() => {
  if (!selectedItemId.value || items.value.length === 0) return -1
  return items.value.findIndex(item => item.id === selectedItemId.value)
})

const canGoPrevious = computed(() => currentIndex.value > 0)
const canGoNext = computed(() => currentIndex.value >= 0 && currentIndex.value < items.value.length - 1)

const activateQuestion = async () => {
  if (!session.value) return

  try {
    session.value = await updateSession(session.value.id, {
      active_item_id: selectedItemId.value || null
    })

    activeItem.value = items.value.find(item => item.id === selectedItemId.value) || null
  } catch (error) {
    console.error('Error activating question:', error)
  }
}

const previousQuestion = () => {
  if (canGoPrevious.value) {
    selectedItemId.value = items.value[currentIndex.value - 1].id
    activateQuestion()
  }
}

const nextQuestion = () => {
  if (canGoNext.value) {
    selectedItemId.value = items.value[currentIndex.value + 1].id
    activateQuestion()
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

    if (sessionData?.active_item_id) {
      selectedItemId.value = sessionData.active_item_id
      activeItem.value = itemsData.find(item => item.id === sessionData.active_item_id) || null
    }
  } catch (error) {
    console.error('Error loading session:', error)
  } finally {
    loading.value = false
  }
})
</script>
