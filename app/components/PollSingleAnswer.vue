<template>
  <div class="space-y-6">
    <!-- Question header -->
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-3">{{ item.title }}</h2>
      <p v-if="item.prompt" class="text-lg text-gray-600">{{ item.prompt }}</p>
    </div>

    <!-- Si déjà répondu -->
    <div v-if="hasAnswered" class="text-center py-8">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">Réponse enregistrée !</h3>
      <p class="text-gray-600">Merci pour votre participation</p>

      <!-- Afficher les résultats si activé -->
      <div v-if="config.showResults && results" class="mt-8">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">Résultats</h4>
        <div class="space-y-3">
          <div
            v-for="option in config.options"
            :key="option.id"
            class="relative"
          >
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm font-medium text-gray-700">{{ option.label }}</span>
              <span class="text-sm font-semibold text-indigo-600">
                {{ getPercentage(option.id) }}%
              </span>
            </div>
            <div class="w-full h-10 bg-gray-200 rounded-lg overflow-hidden">
              <div
                class="h-full bg-indigo-600 transition-all duration-500 flex items-center justify-end pr-3"
                :style="{ width: `${getPercentage(option.id)}%` }"
              >
                <span class="text-sm font-semibold text-white">
                  {{ results[option.id] || 0 }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <p class="mt-4 text-sm text-gray-500">
          {{ totalResponses }} réponse{{ totalResponses > 1 ? 's' : '' }}
        </p>
      </div>
    </div>

    <!-- Formulaire de réponse -->
    <div v-else>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-3">
          <label
            v-for="option in config.options"
            :key="option.id"
            class="block relative cursor-pointer"
          >
            <input
              v-model="selectedOption"
              type="radio"
              :value="option.id"
              class="sr-only"
            />
            <div
              class="p-4 border-2 rounded-lg transition-all"
              :class="{
                'border-indigo-600 bg-indigo-50': selectedOption === option.id,
                'border-gray-300 hover:border-indigo-400': selectedOption !== option.id
              }"
            >
              <div class="flex items-center justify-between">
                <span class="text-lg font-medium text-gray-900">{{ option.label }}</span>
                <div
                  class="w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all"
                  :class="{
                    'border-indigo-600 bg-indigo-600': selectedOption === option.id,
                    'border-gray-300': selectedOption !== option.id
                  }"
                >
                  <svg
                    v-if="selectedOption === option.id"
                    class="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </label>
        </div>

        <!-- Error message -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="!selectedOption || isLoading"
          class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
        >
          {{ isLoading ? 'Envoi...' : 'Valider ma réponse' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Item, PollSingleConfig, PollSinglePayload } from '~/types/database'

const props = defineProps<{
  item: Item
  sessionId: string
  participantId: string
}>()

const supabase = useSupabase()

const config = computed(() => props.item.config as PollSingleConfig)
const selectedOption = ref<string | null>(null)
const isLoading = ref(false)
const error = ref('')
const hasAnswered = ref(false)
const results = ref<Record<string, number>>({})
const totalResponses = ref(0)

const getPercentage = (optionId: string) => {
  if (totalResponses.value === 0) return 0
  const count = results.value[optionId] || 0
  return Math.round((count / totalResponses.value) * 100)
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
      const payload = response.payload as PollSinglePayload
      if (payload.optionId) {
        counts[payload.optionId] = (counts[payload.optionId] || 0) + 1
      }
    })

    results.value = counts
    totalResponses.value = data?.length || 0
  } catch (err) {
    console.error('Error loading results:', err)
  }
}

const checkIfAnswered = async () => {
  try {
    const { data } = await supabase
      .from('responses')
      .select('id')
      .eq('item_id', props.item.id)
      .eq('participant_id', props.participantId)
      .single()

    hasAnswered.value = !!data

    if (hasAnswered.value && config.value.showResults) {
      await loadResults()
    }
  } catch (err) {
    // Pas de réponse trouvée, c'est normal
    hasAnswered.value = false
  }
}

const handleSubmit = async () => {
  if (!selectedOption.value) return

  isLoading.value = true
  error.value = ''

  try {
    const payload: PollSinglePayload = {
      optionId: selectedOption.value,
    }

    const { error: insertError } = await supabase
      .from('responses')
      .insert({
        session_id: props.sessionId,
        item_id: props.item.id,
        participant_id: props.participantId,
        payload,
      })

    if (insertError) throw insertError

    hasAnswered.value = true

    // Charger les résultats si l'option est activée
    if (config.value.showResults) {
      await loadResults()
    }
  } catch (err: any) {
    error.value = err.message || 'Une erreur est survenue lors de l\'envoi de votre réponse'
  } finally {
    isLoading.value = false
  }
}

// Réinitialiser quand la question change
watch(() => props.item.id, () => {
  console.log('[Student] Question changed, resetting state')
  selectedOption.value = null
  hasAnswered.value = false
  results.value = {}
  totalResponses.value = 0
  checkIfAnswered()
})

onMounted(() => {
  checkIfAnswered()
})
</script>
