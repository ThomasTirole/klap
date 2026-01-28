<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ item.title }}</h3>
        <p v-if="item.prompt" class="text-gray-600">{{ item.prompt }}</p>
      </div>
      <div class="text-right">
        <p class="text-3xl font-bold text-indigo-600">{{ responses.length }}</p>
        <p class="text-sm text-gray-500">réponse{{ responses.length > 1 ? 's' : '' }}</p>
      </div>
    </div>

    <!-- Pas de réponses -->
    <div v-if="responses.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-gray-600">Aucune réponse pour le moment</p>
      <p class="text-sm text-gray-500 mt-1">Les réponses apparaîtront en temps réel</p>
    </div>

    <!-- Liste des réponses -->
    <div v-else class="space-y-3 max-h-[600px] overflow-y-auto">
      <div
        v-for="(response, index) in responses"
        :key="response.id"
        class="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
      >
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <span class="text-sm font-semibold text-indigo-600">{{ index + 1 }}</span>
          </div>
          <div class="flex-1">
            <p class="text-gray-900">{{ response.text }}</p>
            <p class="text-xs text-gray-500 mt-1">
              {{ formatTime(response.created_at) }}
            </p>
          </div>
          <button
            v-if="showDeleteButtons"
            @click="openDeleteConfirm(response)"
            class="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Supprimer cette réponse"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="pt-4 border-t flex justify-between items-center text-sm text-gray-500">
      <span>Dernière mise à jour : {{ lastUpdate }}</span>
      <button
        @click="loadResponses"
        class="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Actualiser
      </button>
    </div>

    <!-- Modal de confirmation suppression -->
    <ConfirmModal
      :show="confirmDelete.show"
      title="Supprimer la réponse ?"
      message="Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action est irréversible."
      confirm-text="Supprimer"
      cancel-text="Annuler"
      variant="danger"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </div>
</template>

<script setup lang="ts">
import type { Item, OpenPayload, Response } from '~/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

const props = withDefaults(defineProps<{
  item: Item
  showDeleteButtons?: boolean
}>(), {
  showDeleteButtons: false
})

const supabase = useSupabase()
const { subscribeToItemResponses, unsubscribe } = useRealtime()

interface OpenResponse {
  id: string
  text: string
  created_at: string
}

const responses = ref<OpenResponse[]>([])
const lastUpdate = ref('')
let realtimeChannel: RealtimeChannel | null = null
const confirmDelete = ref({
  show: false,
  response: null as OpenResponse | null
})

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const updateLastUpdate = () => {
  const now = new Date()
  lastUpdate.value = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const loadResponses = async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('responses')
      .select('id, payload, created_at')
      .eq('item_id', props.item.id)
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError

    responses.value = (data || []).map(response => ({
      id: response.id,
      text: (response.payload as OpenPayload).text,
      created_at: response.created_at
    }))

    updateLastUpdate()
  } catch (err) {
    console.error('Error loading responses:', err)
  }
}

const handleNewResponse = (response: Response) => {
  const payload = response.payload as OpenPayload
  if (payload.text) {
    // Ajouter au début de la liste
    responses.value.unshift({
      id: response.id,
      text: payload.text,
      created_at: response.created_at
    })
    updateLastUpdate()
  }
}

const openDeleteConfirm = (response: OpenResponse) => {
  confirmDelete.value = {
    show: true,
    response
  }
}

const handleDeleteConfirm = async () => {
  if (!confirmDelete.value.response) return

  try {
    const { error } = await supabase
      .from('responses')
      .delete()
      .eq('id', confirmDelete.value.response.id)

    if (error) throw error

    // Retirer de la liste
    responses.value = responses.value.filter(r => r.id !== confirmDelete.value.response!.id)
    updateLastUpdate()
  } catch (error) {
    console.error('Error deleting response:', error)
  }

  confirmDelete.value = { show: false, response: null }
}

const handleDeleteCancel = () => {
  confirmDelete.value = { show: false, response: null }
}

const setupSubscription = () => {
  console.log('[Teacher] Setting up subscription for item:', props.item.id)

  if (realtimeChannel) {
    unsubscribe(realtimeChannel)
  }

  responses.value = []

  loadResponses()

  realtimeChannel = subscribeToItemResponses(props.item.id, handleNewResponse)
}

watch(() => props.item.id, () => {
  console.log('[Teacher] Question changed, reloading results')
  setupSubscription()
})

onMounted(() => {
  setupSubscription()
})

onUnmounted(() => {
  if (realtimeChannel) {
    unsubscribe(realtimeChannel)
  }
})
</script>
