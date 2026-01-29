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
    <div v-if="sortedWords.length > 0" class="min-h-[500px] h-[500px] bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-xl p-8 relative overflow-hidden">
      <canvas ref="wordcloudCanvas" class="w-full h-full wordcloud-canvas"></canvas>
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
import WordCloud from 'wordcloud'

const props = defineProps<{
  item: Item
}>()

const wordcloudCanvas = ref<HTMLCanvasElement | null>(null)

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

const drawWordcloud = () => {
  if (!wordcloudCanvas.value || sortedWords.value.length === 0) return

  const canvas = wordcloudCanvas.value
  const container = canvas.parentElement

  if (!container) return

  // Ajouter classe d'animation bounce
  canvas.classList.remove('wordcloud-bounce')
  void canvas.offsetWidth // Force reflow
  canvas.classList.add('wordcloud-bounce')

  // Obtenir la taille réelle du conteneur
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight || 500

  // Utiliser un DPR élevé pour une meilleure qualité (x2 minimum)
  const dpr = Math.max(window.devicePixelRatio || 1, 2)
  canvas.width = containerWidth * dpr
  canvas.height = containerHeight * dpr
  canvas.style.width = `${containerWidth}px`
  canvas.style.height = `${containerHeight}px`

  // Obtenir le contexte et activer les options de qualité
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
  }

  // Palette de couleurs très variée
  const colors = [
    '#ef4444', // red-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#a855f7', // purple-500
    '#ec4899', // pink-500
    '#f43f5e', // rose-500
    '#84cc16', // lime-500
    '#14b8a6', // teal-500
  ]

  // Préparer les données pour wordcloud: [[mot, poids], ...]
  const wordList = sortedWords.value.map(word => [word.text, word.count] as [string, number])

  // Calculer la taille maximale des mots en fonction du nombre de mots
  const maxCount = sortedWords.value[0]?.count || 1
  const baseSize = Math.min(containerWidth, containerHeight) / 8 // Taille de base adaptative

  // Dessiner le nuage de mots
  WordCloud(canvas, {
    list: wordList,
    gridSize: 6,
    weightFactor: (size) => {
      // Taille proportionnelle x2.5
      const ratio = size / maxCount
      return ((baseSize * 0.3) + (ratio * baseSize * 0.7)) * 2.5
    },
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, system-ui, sans-serif',
    fontWeight: '700',
    color: () => {
      // Couleur aléatoire de la palette
      return colors[Math.floor(Math.random() * colors.length)]
    },
    rotateRatio: 0.4, // 40% des mots en rotation
    rotationSteps: 4, // 4 angles possibles
    minRotation: -Math.PI / 4, // -45°
    maxRotation: Math.PI / 4, // +45°
    backgroundColor: 'transparent',
    shuffle: true,
    drawOutOfBound: false,
    shrinkToFit: true,
    clearCanvas: true,
  })
}

// Redessiner quand les mots changent
watch(sortedWords, () => {
  nextTick(() => {
    drawWordcloud()
  })
}, { deep: true })

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

const setupSubscription = async () => {
  console.log('[Teacher] Setting up subscription for item:', props.item.id)

  if (realtimeChannel) {
    unsubscribe(realtimeChannel)
  }

  wordCounts.value = {}
  totalResponses.value = 0

  await loadResults()

  // Dessiner le nuage après le chargement
  nextTick(() => {
    drawWordcloud()
  })

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
  nextTick(() => {
    drawWordcloud()
  })
})

onUnmounted(() => {
  if (realtimeChannel) {
    unsubscribe(realtimeChannel)
  }
})
</script>

<style scoped>
/* Animation bounce légère pour l'apparition du nuage */
@keyframes wordcloud-bounce {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.wordcloud-bounce {
  animation: wordcloud-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Amélioration du rendu du canvas */
.wordcloud-canvas {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}
</style>
