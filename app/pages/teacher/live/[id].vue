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
          <div v-if="session" class="flex items-center gap-4">
            <button
              @click="showQRCode = true"
              class="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              QR Code
            </button>
            <div class="text-right">
              <p class="text-sm text-gray-300">Code d'accès</p>
              <p class="text-2xl font-mono font-bold text-white">{{ session.join_code }}</p>
            </div>
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
        <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border border-white border-opacity-20 p-6 relative z-50">
          <div class="flex items-center justify-between gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-200 mb-2">
                Question active
              </label>
              <ActiveQuestionSelector
                v-model="selectedItemId"
                :items="items"
                @update:model-value="activateQuestion"
              />
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
            :show-delete-buttons="true"
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

    <!-- Modal QR Code -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showQRCode && session"
          class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          @click="showQRCode = false"
        >
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showQRCode"
              @click.stop
              class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
            >
              <!-- Titre -->
              <div class="text-center mb-6">
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Rejoindre la session</h3>
                <p class="text-gray-600">{{ session.title }}</p>
              </div>

              <!-- QR Code -->
              <QRCodeDisplay
                :url="joinUrl"
                :code="session.join_code"
                :size="300"
              />

              <!-- Info -->
              <div class="mt-6 p-4 bg-indigo-50 rounded-lg">
                <p class="text-sm text-indigo-800 text-center">
                  <svg class="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Scannez avec un téléphone pour rejoindre
                </p>
              </div>

              <!-- Bouton fermer -->
              <button
                @click="showQRCode = false"
                class="mt-6 w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
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
const showQRCode = ref(false)

const config = useRuntimeConfig()
const joinUrl = computed(() => {
  if (!session.value) return ''
  return `${config.public.siteUrl || 'https://klap-steel.vercel.app'}/student/${session.value.join_code}`
})

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
