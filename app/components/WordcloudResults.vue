<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ item.title }}</h3>
        <p v-if="item.prompt" class="text-gray-600">{{ item.prompt }}</p>
      </div>
      <div class="text-right">
        <p class="text-3xl font-bold text-indigo-600">{{ totalWords }}</p>
        <p class="text-sm text-gray-500">mot{{ totalWords > 1 ? 's' : '' }} total</p>
        <p class="text-xs text-gray-400 mt-1">{{ totalResponses }} participant{{ totalResponses > 1 ? 's' : '' }}</p>
      </div>
    </div>

    <!-- Nuage de mots -->
    <div v-if="sortedWords.length > 0" class="min-h-[400px] bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 flex flex-wrap items-center justify-center gap-4">
      <span
        v-for="word in sortedWords"
        :key="word.text"
        class="font-bold text-indigo-600 hover:text-indigo-700 transition-all cursor-default"
        :style="{ fontSize: `${word.size}px` }"
        :title="`${word.count} fois`"
      >
        {{ word.text }}
      </span>
    </div>

    <!-- Pas de mots -->
    <div v-else class="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-xl">
      <div class="text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-gray-600">Aucun mot pour le moment</p>
        <p class="text-sm text-gray-500 mt-1">Les mots apparaîtront en temps réel</p>
      </div>
    </div>

    <!-- Top mots -->
    <div v-if="sortedWords.length > 0" class="border-t pt-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-3">Mots les plus fréquents</h4>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(word, index) in sortedWords.slice(0, 10)"
          :key="word.text"
          class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
        >
          {{ index + 1 }}. {{ word.text }} ({{ word.count }})
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
import type { Item, WordcloudPayload, Response } from '~/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

const props = defineProps<{
  item: Item
}>()

const supabase = useSupabase()
const { subscribeToItemResponses, unsubscribe } = useRealtime()

const wordCounts = ref<Record<string, number>>({})
const totalResponses = ref(0)
const lastUpdate = ref('')
let realtimeChannel: RealtimeChannel | null = null

const totalWords = computed(() => {
  return Object.values(wordCounts.value).reduce((sum, count) => sum + count, 0)
})

const sortedWords = computed(() => {
  const words = Object.entries(wordCounts.value)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)

  // Calculer les tailles de police (16px à 80px)
  const maxCount = words[0]?.count || 1
  const minSize = 16
  const maxSize = 80

  return words.map(word => ({
    ...word,
    size: Math.max(minSize, Math.min(maxSize, minSize + ((word.count / maxCount) * (maxSize - minSize))))
  }))
})

const updateLastUpdate = () => {
  const now = new Date()
  lastUpdate.value = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const processWords = (text: string) => {
  // Séparer les mots et normaliser
  return text
    .split(',')
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 0)
}

const loadResults = async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('responses')
      .select('payload')
      .eq('item_id', props.item.id)

    if (fetchError) throw fetchError

    const counts: Record<string, number> = {}
    data?.forEach((response) => {
      const payload = response.payload as WordcloudPayload
      const words = processWords(payload.text)
      words.forEach(word => {
        counts[word] = (counts[word] || 0) + 1
      })
    })

    wordCounts.value = counts
    totalResponses.value = data?.length || 0
    updateLastUpdate()
  } catch (err) {
    console.error('Error loading results:', err)
  }
}

const handleNewResponse = (response: Response) => {
  const payload = response.payload as WordcloudPayload
  const words = processWords(payload.text)
  words.forEach(word => {
    wordCounts.value[word] = (wordCounts.value[word] || 0) + 1
  })
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

  wordCounts.value = {}
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
