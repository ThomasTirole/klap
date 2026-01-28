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
      <p class="text-gray-600">Votre note : <span class="font-bold text-indigo-600">{{ selectedValue }}</span></p>
    </div>

    <!-- Formulaire de réponse -->
    <div v-else>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Échelle visuelle -->
        <div class="space-y-4">
          <div class="flex justify-between gap-2">
            <button
              v-for="value in scaleValues"
              :key="value"
              type="button"
              @click="selectedValue = value"
              class="flex-1 min-w-0 py-4 px-2 rounded-lg font-bold text-lg transition-all border-2"
              :class="{
                'bg-indigo-600 text-white border-indigo-600': selectedValue === value,
                'bg-gray-100 text-gray-700 border-gray-300 hover:border-indigo-400': selectedValue !== value
              }"
            >
              {{ value }}
            </button>
          </div>

          <!-- Labels -->
          <div v-if="config.labels" class="flex justify-between text-sm text-gray-600">
            <span>{{ config.labels[config.min] }}</span>
            <span>{{ config.labels[config.max] }}</span>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="selectedValue === null || isLoading"
          class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
        >
          {{ isLoading ? 'Envoi...' : 'Valider ma réponse' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Item, ScaleNumericConfig, ScalePayload } from '~/types/database'

const props = defineProps<{
  item: Item
  sessionId: string
  participantId: string
}>()

const supabase = useSupabase()

const config = computed(() => props.item.config as ScaleNumericConfig)
const selectedValue = ref<number | null>(null)
const isLoading = ref(false)
const error = ref('')
const hasAnswered = ref(false)

const scaleValues = computed(() => {
  const values: number[] = []
  for (let i = config.value.min; i <= config.value.max; i += config.value.step || 1) {
    values.push(i)
  }
  return values
})

const checkIfAnswered = async () => {
  try {
    const { data } = await supabase
      .from('responses')
      .select('payload')
      .eq('item_id', props.item.id)
      .eq('participant_id', props.participantId)
      .single()

    if (data) {
      hasAnswered.value = true
      selectedValue.value = (data.payload as ScalePayload).value as number
    }
  } catch (err) {
    hasAnswered.value = false
  }
}

const handleSubmit = async () => {
  if (selectedValue.value === null) return

  isLoading.value = true
  error.value = ''

  try {
    const payload: ScalePayload = {
      value: selectedValue.value,
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
  } catch (err: any) {
    error.value = err.message || 'Une erreur est survenue lors de l\'envoi de votre réponse'
  } finally {
    isLoading.value = false
  }
}

// Réinitialiser quand la question change
watch(() => props.item.id, () => {
  console.log('[Student] Question changed, resetting state')
  selectedValue.value = null
  hasAnswered.value = false
  checkIfAnswered()
})

onMounted(() => {
  checkIfAnswered()
})
</script>
