<template>
  <!-- Overlay -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        @click="handleCancel"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="show"
            @click.stop
            class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <!-- Icône -->
            <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>

            <!-- Titre -->
            <h3 class="text-xl font-bold text-gray-900 text-center mb-2">
              {{ title }}
            </h3>

            <!-- Message -->
            <p v-if="message" class="text-gray-600 text-center mb-4">
              {{ message }}
            </p>

            <!-- Input -->
            <input
              ref="inputRef"
              v-model="inputValue"
              type="text"
              :placeholder="placeholder"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-6"
              @keyup.enter="handleConfirm"
              @keyup.esc="handleCancel"
            />

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                @click="handleCancel"
                class="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                @click="handleConfirm"
                class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  title: string
  message?: string
  placeholder?: string
  defaultValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  placeholder: '',
  defaultValue: ''
})

const emit = defineEmits<{
  confirm: [value: string]
  cancel: []
}>()

const inputValue = ref(props.defaultValue)
const inputRef = ref<HTMLInputElement>()

watch(() => props.show, (newVal) => {
  if (newVal) {
    inputValue.value = props.defaultValue
    nextTick(() => {
      inputRef.value?.focus()
      inputRef.value?.select()
    })
  }
})

const handleConfirm = () => {
  if (inputValue.value.trim()) {
    emit('confirm', inputValue.value.trim())
    inputValue.value = ''
  }
}

const handleCancel = () => {
  emit('cancel')
  inputValue.value = ''
}
</script>
