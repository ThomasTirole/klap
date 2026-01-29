<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ item.title }}</h3>
        <p v-if="item.prompt" class="text-gray-600">{{ item.prompt }}</p>
        <p v-if="config.maxChoices" class="text-sm text-indigo-600 font-medium mt-1">
          Maximum {{ config.maxChoices}} choix
        </p>
      </div>
      <div class="text-right">
        <p class="text-3xl font-bold text-indigo-600">{{ totalResponses }}</p>
        <p class="text-sm text-gray-500">réponse{{ totalResponses > 1 ? 's' : '' }}</p>
      </div>
    </div>

    <!-- Résultats -->
    <div class="space-y-4">
      <div
        v-for="(option, index) in config.options"
        :key="option.id"
        class="relative"
      >
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-3">
            <span class="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <span class="text-sm font-semibold text-indigo-600">{{ index + 1 }}</span>
            </span>
            <span class="font-medium text-gray-900">{{ option.label }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-gray-600">
              {{ results[option.id] || 0 }} sélection{{ (results[option.id] || 0) > 1 ? 's' : '' }}
            </span>
            <span class="text-lg font-bold text-indigo-600 min-w-[3rem] text-right">
              {{ getPercentage(option.id) }}%
            </span>
          </div>
        </div>
        <div class="w-full h-12 bg-gray-200 rounded-lg overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 flex items-center justify-end pr-4"
            :style="{ width: `${getPercentage(option.id)}%` }"
          >
            <span v-if="getPercentage(option.id) > 10" class="text-sm font-semibold text-white">
              {{ results[option.id] || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="pt-4 border-t flex justify-between items-center text-sm text-gray-500">
      <span>Dernière mise à jour : {{ lastUpdate }}</span>
      <button
        @click="loadResults"
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
import type { Item, PollMultiConfig, PollMultiPayload, Response } from '~/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

const props = defineProps<{
  item: Item
}>()

const supabase = useSupabase()
const { subscribeToItemResponses, unsubscribe } = useRealtime()

const config = computed(() => props.item.config as PollMultiConfig)
const results = ref<Record<string, number>>({})
const totalResponses = ref(0)
const lastUpdate = ref('')
let realtimeChannel: RealtimeChannel | null = null

const getPercentage = (optionId: string) => {
  if (totalResponses.value === 0) return 0
  const count = results.value[optionId] || 0
  // Pour poll_multi, on calcule le pourcentage par rapport au nombre total de réponses
  return Math.round((count / totalResponses.value) * 100)
}

const updateLastUpdate = () => {
  const now = new Date()
  lastUpdate.value = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const loadResults = async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('responses')
      .select('payload')
      .eq('item_id', props.item.id)

    if (fetchError) throw fetchError

    // Compter les réponses par option
    const counts: Record<string, number> = {}
    data?.forEach((response) => {
      const payload = response.payload as PollMultiPayload
      if (payload.optionIds) {
        payload.optionIds.forEach(optionId => {
          counts[optionId] = (counts[optionId] || 0) + 1
        })
      }
    })

    results.value = counts
    totalResponses.value = data?.length || 0
    updateLastUpdate()
  } catch (err) {
    console.error('Error loading results:', err)
  }
}

const handleNewResponse = (response: Response) => {
  const payload = response.payload as PollMultiPayload
  if (payload.optionIds) {
    payload.optionIds.forEach(optionId => {
      results.value[optionId] = (results.value[optionId] || 0) + 1
    })
    totalResponses.value++
    updateLastUpdate()
  }
}

const handleDeletedResponse = () => {
  // Recharger les résultats après suppression
  loadResults()
}

const setupSubscription = () => {
  console.log('[Teacher] Setting up subscription for item:', props.item.id)

  if (realtimeChannel) {
    unsubscribe(realtimeChannel)
  }

  results.value = {}
  totalResponses.value = 0

  loadResults()

  realtimeChannel = subscribeToItemResponses(props.item.id, {
    onInsert: handleNewResponse,
    onDelete: handleDeletedResponse
  })
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
