<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h3 class="text-2xl font-bold text-gray-900">Nouvelle Question</h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Type de question -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Type de question
          </label>
          <select
            v-model="form.type"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          >
            <option value="poll_single">Sondage - Choix unique</option>
            <option value="poll_multi" disabled>Sondage - Choix multiple (bientôt)</option>
            <option value="wordcloud" disabled>Nuage de mots (bientôt)</option>
            <option value="open" disabled>Question ouverte (bientôt)</option>
            <option value="scale" disabled>Échelle (bientôt)</option>
          </select>
        </div>

        <!-- Titre -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            Titre de la question *
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="Ex: Quelle est votre couleur préférée ?"
          />
        </div>

        <!-- Description optionnelle -->
        <div>
          <label for="prompt" class="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnel)
          </label>
          <textarea
            id="prompt"
            v-model="form.prompt"
            rows="2"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="Ajoutez des précisions sur la question..."
          />
        </div>

        <!-- Options (pour poll_single) -->
        <div v-if="form.type === 'poll_single'">
          <div class="flex justify-between items-center mb-3">
            <label class="block text-sm font-medium text-gray-700">
              Options de réponse *
            </label>
            <button
              type="button"
              @click="addOption"
              class="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Ajouter une option
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(option, index) in form.options"
              :key="index"
              class="flex gap-3"
            >
              <div class="flex-shrink-0 w-8 h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                <span class="text-sm font-semibold text-gray-600">{{ index + 1 }}</span>
              </div>
              <input
                v-model="option.label"
                type="text"
                required
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                :placeholder="`Option ${index + 1}`"
              />
              <button
                v-if="form.options.length > 2"
                type="button"
                @click="removeOption(index)"
                class="flex-shrink-0 w-11 h-11 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <p class="mt-2 text-xs text-gray-500">Au moins 2 options requises</p>
        </div>

        <!-- Paramètres -->
        <div v-if="form.type === 'poll_single'" class="border-t pt-6">
          <label class="flex items-center gap-3">
            <input
              v-model="form.showResults"
              type="checkbox"
              class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span class="text-sm text-gray-700">
              Afficher les résultats aux élèves après leur réponse
            </span>
          </label>
        </div>

        <!-- Error message -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {{ isLoading ? 'Création...' : 'Créer la question' }}
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ItemType, PollOption } from '~/types/database'

const props = defineProps<{
  sessionId: string
}>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const { addItem } = useSession()

const form = reactive({
  type: 'poll_single' as ItemType,
  title: '',
  prompt: '',
  options: [
    { id: crypto.randomUUID(), label: '' },
    { id: crypto.randomUUID(), label: '' },
  ] as PollOption[],
  showResults: true,
})

const isLoading = ref(false)
const error = ref('')

const isFormValid = computed(() => {
  if (!form.title.trim()) return false
  if (form.type === 'poll_single') {
    return form.options.length >= 2 && form.options.every(opt => opt.label.trim())
  }
  return true
})

const addOption = () => {
  form.options.push({
    id: crypto.randomUUID(),
    label: '',
  })
}

const removeOption = (index: number) => {
  if (form.options.length > 2) {
    form.options.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  error.value = ''

  try {
    const config = {
      options: form.options.map(opt => ({
        id: opt.id,
        label: opt.label.trim(),
      })),
      showResults: form.showResults,
    }

    await addItem(props.sessionId, {
      type: form.type,
      title: form.title.trim(),
      prompt: form.prompt.trim() || null,
      config,
    })

    emit('created')
    emit('close')
  } catch (err: any) {
    error.value = err.message || 'Une erreur est survenue lors de la création de la question'
  } finally {
    isLoading.value = false
  }
}
</script>
