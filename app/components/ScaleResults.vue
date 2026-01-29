<template>
  <div class="space-y-6">
    <!-- Header avec moyenne -->
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ item.title }}</h3>
        <p v-if="item.prompt" class="text-gray-600">{{ item.prompt }}</p>
      </div>
      <div class="text-center bg-indigo-50 rounded-xl p-4 min-w-[120px]">
        <p class="text-5xl font-bold text-indigo-600">{{ average }}</p>
        <p class="text-sm text-gray-500 mt-1">Moyenne</p>
        <p class="text-xs text-gray-400">{{ totalResponses }} réponse{{ totalResponses > 1 ? 's' : '' }}</p>
      </div>
    </div>

    <!-- Histogramme -->
    <div v-if="totalResponses > 0" class="space-y-3">
      <div
        v-for="value in scaleValues"
        :key="value"
        class="relative"
      >
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-3">
            <span class="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span class="text-xl font-bold text-indigo-600">{{ value }}</span>
            </span>
            <span v-if="config.labels && config.labels[value]" class="text-sm text-gray-600">
              {{ config.labels[value] }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-gray-600">
              {{ results[value] || 0 }} vote{{ (results[value] || 0) > 1 ? 's' : '' }}
            </span>
            <span class="text-lg font-bold text-indigo-600 min-w-[3rem] text-right">
              {{ getPercentage(value) }}%
            </span>
          </div>
        </div>
        <div class="w-full h-10 bg-gray-200 rounded-lg overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 flex items-center justify-end pr-3"
            :style="{ width: `${getPercentage(value)}%` }"
          >
            <span v-if="getPercentage(value) > 15" class="text-sm font-semibold text-white">
              {{ results[value] || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pas de réponses -->
    <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
      <p class="text-gray-600">Aucune réponse pour le moment</p>
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
import type { Item, ScaleNumericConfig, ScalePayload, Response } from '~/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

const props = defineProps<{
  item: Item
}>()

const supabase = useSupabase()
const { subscribeToItemResponses, unsubscribe } = useRealtime()

const config = computed(() => props.item.config as ScaleNumericConfig)
const results = ref<Record<number, number>>({})
const totalResponses = ref(0)
const lastUpdate = ref('')
let realtimeChannel: RealtimeChannel | null = null

const scaleValues = computed(() => {
  const values: number[] = []
  for (let i = config.value.min; i <= config.value.max; i += config.value.step || 1) {
    values.push(i)
  }
  return values
})

const average = computed(() => {
  if (totalResponses.value === 0) return '—'
  let sum = 0
  Object.entries(results.value).forEach(([value, count]) => {
    sum += Number(value) * count
  })
  return (sum / totalResponses.value).toFixed(1)
})

const getPercentage = (value: number) => {
  if (totalResponses.value === 0) return 0
  const count = results.value[value] || 0
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

    const counts: Record<number, number> = {}
    data?.forEach((response) => {
      const payload = response.payload as ScalePayload
      const value = payload.value as number
      counts[value] = (counts[value] || 0) + 1
    })

    results.value = counts
    totalResponses.value = data?.length || 0
    updateLastUpdate()
  } catch (err) {
    console.error('Error loading results:', err)
  }
}

const handleNewResponse = (response: Response) => {
  const payload = response.payload as ScalePayload
  const value = payload.value as number
  results.value[value] = (results.value[value] || 0) + 1
  totalResponses.value++
  updateLastUpdate()
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
