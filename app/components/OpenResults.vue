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
  </div>
</template>

<script setup lang="ts">
import type { Item, OpenPayload, Response } from '~/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

const props = defineProps<{
  item: Item
}>()

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
