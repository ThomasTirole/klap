<template>
  <div class="space-y-6">
    <!-- Question header -->
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-3">{{ item.title }}</h2>
      <p v-if="item.prompt" class="text-lg text-gray-600">{{ item.prompt }}</p>
      <p class="text-sm text-purple-600 font-medium mt-2">
        {{ config.maxWords }} mot{{ config.maxWords > 1 ? 's' : '' }} maximum
      </p>
    </div>

    <!-- Si déjà répondu -->
    <div v-if="hasAnswered" class="text-center py-8">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">Mots enregistrés !</h3>
      <p class="text-gray-600">Merci pour votre participation</p>
    </div>

    <!-- Formulaire de réponse -->
    <div v-else>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Saisie des mots -->
        <div class="space-y-3">
          <div
            v-for="(word, index) in words"
            :key="index"
            class="flex items-center gap-3"
          >
            <span class="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span class="text-sm font-semibold text-purple-600">{{ index + 1 }}</span>
            </span>
            <input
              v-model="words[index]"
              type="text"
              :maxlength="config.maxLength"
              class="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              :placeholder="`Mot ${index + 1}`"
            />
          </div>
        </div>

        <p class="text-xs text-gray-500 text-center">
          Un mot par ligne ({{ config.maxLength }} caractères max par mot)
        </p>

        <!-- Error message -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="!hasValidWords || isLoading"
          class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
        >
          {{ isLoading ? 'Envoi...' : 'Valider mes mots' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Item, WordcloudConfig, WordcloudPayload } from '~/types/database'

const props = defineProps<{
  item: Item
  sessionId: string
  participantId: string
}>()

const supabase = useSupabase()

const config = computed(() => props.item.config as WordcloudConfig)
const words = ref<string[]>(Array(config.value.maxWords || 3).fill(''))
const isLoading = ref(false)
const error = ref('')
const hasAnswered = ref(false)

const hasValidWords = computed(() => {
  return words.value.some(w => w.trim().length > 0)
})

const checkIfAnswered = async () => {
  try {
    const { data } = await supabase
      .from('responses')
      .select('id')
      .eq('item_id', props.item.id)
      .eq('participant_id', props.participantId)
      .single()

    hasAnswered.value = !!data
  } catch (err) {
    hasAnswered.value = false
  }
}

const handleSubmit = async () => {
  const validWords = words.value.filter(w => w.trim().length > 0).map(w => w.trim())
  if (validWords.length === 0) return

  isLoading.value = true
  error.value = ''

  try {
    // On enregistre chaque mot séparément pour pouvoir les compter facilement
    const payload: WordcloudPayload = {
      text: validWords.join(', '),
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
    error.value = err.message || 'Une erreur est survenue lors de l\'envoi de vos mots'
  } finally {
    isLoading.value = false
  }
}

// Réinitialiser quand la question change
watch(() => props.item.id, () => {
  console.log('[Student] Question changed, resetting state')
  words.value = Array(config.value.maxWords || 3).fill('')
  hasAnswered.value = false
  checkIfAnswered()
})

onMounted(() => {
  checkIfAnswered()
})
</script>
