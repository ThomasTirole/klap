<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-3">
            <img src="/logo.svg" alt="Klap!" class="h-10" />
            <span v-if="session" class="text-gray-500">{{ session.title }}</span>
          </div>
          <span v-if="session" class="text-lg font-mono font-bold text-purple-600">
            {{ session.join_code }}
          </span>
        </div>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500">Chargement...</p>
      </div>

      <div v-else-if="!session" class="bg-white rounded-lg border-2 border-red-200 p-8 text-center">
        <p class="text-red-600 font-semibold mb-4">Session introuvable</p>
        <NuxtLink to="/" class="text-purple-600 hover:text-purple-700">
          Retour à l'accueil
        </NuxtLink>
      </div>

      <div v-else-if="session.status === 'draft'" class="bg-white rounded-lg border-2 border-yellow-200 p-8 text-center">
        <svg class="w-16 h-16 mx-auto text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Session en attente</h2>
        <p class="text-gray-600 mb-6">
          La session n'est pas encore ouverte. Votre enseignant va bientôt la démarrer.
        </p>
        <p class="text-sm text-gray-500">
          Restez sur cette page, elle se mettra à jour automatiquement.
        </p>
      </div>

      <div v-else-if="session.status === 'closed'" class="bg-white rounded-lg border-2 border-green-200 p-8 text-center">
        <svg class="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Session terminée</h2>
        <p class="text-gray-600 mb-6">
          Cette session est maintenant fermée. Merci pour votre participation !
        </p>
        <p class="text-sm text-gray-500">
          Redirection dans un instant...
        </p>
      </div>

      <div v-else-if="!activeItem" class="bg-white rounded-lg border-2 border-blue-200 p-8 text-center">
        <svg class="w-16 h-16 mx-auto text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">En attente</h2>
        <p class="text-gray-600">
          Votre enseignant va bientôt afficher une question.
        </p>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Sondage à choix unique -->
        <PollSingleAnswer
          v-if="activeItem.type === 'poll_single'"
          :key="activeItem.id"
          :item="activeItem"
          :session-id="session.id"
          :participant-id="participantId"
        />

        <!-- Sondage à choix multiple -->
        <PollMultiAnswer
          v-else-if="activeItem.type === 'poll_multi'"
          :key="activeItem.id"
          :item="activeItem"
          :session-id="session.id"
          :participant-id="participantId"
        />

        <!-- Question ouverte -->
        <OpenAnswer
          v-else-if="activeItem.type === 'open'"
          :key="activeItem.id"
          :item="activeItem"
          :session-id="session.id"
          :participant-id="participantId"
        />

        <!-- Échelle -->
        <ScaleAnswer
          v-else-if="activeItem.type === 'scale'"
          :key="activeItem.id"
          :item="activeItem"
          :session-id="session.id"
          :participant-id="participantId"
        />

        <!-- Nuage de mots -->
        <WordcloudAnswer
          v-else-if="activeItem.type === 'wordcloud'"
          :key="activeItem.id"
          :item="activeItem"
          :session-id="session.id"
          :participant-id="participantId"
        />

        <!-- Autres types (à venir) -->
        <div v-else class="p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
          <p class="text-gray-600">
            Ce type de question sera bientôt disponible.
          </p>
          <p class="text-sm text-gray-500 mt-2">
            Type : {{ itemTypeLabel(activeItem.type) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Session, Item } from '~/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

const route = useRoute()
const router = useRouter()
const { getSessionByCode, getSessionItems } = useSession()
const { subscribeToSession, unsubscribe } = useRealtime()

const code = route.params.sessionCode as string
const session = ref<Session | null>(null)
const activeItem = ref<Item | null>(null)
const loading = ref(true)
const participantId = ref('')
let realtimeChannel: RealtimeChannel | null = null

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

const updateActiveItem = async (activeItemId: string | null) => {
  if (!session.value) return

  if (activeItemId) {
    const items = await getSessionItems(session.value.id)
    activeItem.value = items.find(item => item.id === activeItemId) || null
  } else {
    activeItem.value = null
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const sessionData = await getSessionByCode(code)
    session.value = sessionData

    if (sessionData) {
      // Récupérer ou créer un participant_id unique
      let storedParticipantId = localStorage.getItem(`klap_participant_${sessionData.id}`)
      if (!storedParticipantId) {
        storedParticipantId = crypto.randomUUID()
        localStorage.setItem(`klap_participant_${sessionData.id}`, storedParticipantId)
      }
      participantId.value = storedParticipantId

      // Charger la question active
      if (sessionData.active_item_id) {
        await updateActiveItem(sessionData.active_item_id)
      }

      // S'abonner aux changements de session (question active, statut)
      realtimeChannel = subscribeToSession(sessionData.id, (updatedSession) => {
        const previousStatus = session.value?.status
        console.log('[Student] Session update received:', {
          previousStatus,
          newStatus: updatedSession.status,
          previousItemId: activeItem.value?.id,
          newItemId: updatedSession.active_item_id
        })

        session.value = updatedSession

        // Mettre à jour la question active quand elle change
        if (updatedSession.active_item_id !== activeItem.value?.id) {
          console.log('[Student] Active item changed, updating...')
          updateActiveItem(updatedSession.active_item_id)
        }

        // Rediriger si la session vient d'être fermée
        if (previousStatus === 'open' && updatedSession.status === 'closed') {
          console.log('[Student] Session closed detected! Redirecting to end page...')
          setTimeout(() => {
            console.log('[Student] Executing redirect now...')
            router.push('/student/end')
          }, 1000) // Délai de 1 seconde pour laisser voir le message
        } else {
          console.log('[Student] No redirect needed. Previous:', previousStatus, 'New:', updatedSession.status)
        }
      })
    }
  } catch (error) {
    console.error('Error loading session:', error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (realtimeChannel) {
    unsubscribe(realtimeChannel)
  }
})
</script>
