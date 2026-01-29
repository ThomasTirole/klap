<template>
  <div class="relative">
    <!-- Bouton principal -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg hover:bg-opacity-30 focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all outline-none flex items-center justify-between group"
    >
      <div v-if="selectedItem" class="flex items-center gap-3 flex-1 min-w-0">
        <!-- Numéro -->
        <div class="flex-shrink-0 w-8 h-8 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
          <span class="text-sm font-bold text-white">{{ selectedIndex + 1 }}</span>
        </div>

        <!-- Titre de la question -->
        <div class="text-left flex-1 min-w-0">
          <p class="font-medium text-white truncate">{{ selectedItem.title }}</p>
        </div>

        <!-- Badge du type -->
        <QuestionTypeBadge :type="selectedItem.type" :show-label="false" />
      </div>

      <div v-else class="text-white text-opacity-70">
        Aucune question active
      </div>

      <!-- Chevron -->
      <svg
        class="w-5 h-5 text-white text-opacity-70 transition-transform duration-200 flex-shrink-0 ml-3"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute z-[100] w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-96 overflow-y-auto"
      >
        <!-- Option: Aucune question -->
        <button
          type="button"
          @click="selectQuestion(null)"
          class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
          :class="{ 'bg-gray-100': !modelValue }"
        >
          <div class="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span class="text-gray-700 font-medium flex-1">Aucune question active</span>
          <svg v-if="!modelValue" class="w-5 h-5 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Séparateur -->
        <div class="border-t border-gray-200"></div>

        <!-- Liste des questions -->
        <button
          v-for="(item, index) in items"
          :key="item.id"
          type="button"
          @click="selectQuestion(item.id)"
          class="w-full px-4 py-3 flex items-center gap-3 hover:bg-indigo-50 transition-colors text-left"
          :class="{ 'bg-indigo-50': modelValue === item.id }"
        >
          <!-- Numéro -->
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            :class="modelValue === item.id ? 'bg-indigo-100' : 'bg-gray-100'"
          >
            <span
              class="text-sm font-bold"
              :class="modelValue === item.id ? 'text-indigo-600' : 'text-gray-600'"
            >
              {{ index + 1 }}
            </span>
          </div>

          <!-- Titre -->
          <div class="flex-1 min-w-0">
            <p
              class="font-medium truncate"
              :class="modelValue === item.id ? 'text-indigo-900' : 'text-gray-900'"
            >
              {{ item.title }}
            </p>
            <p v-if="item.prompt" class="text-xs text-gray-500 truncate mt-0.5">
              {{ item.prompt }}
            </p>
          </div>

          <!-- Badge du type -->
          <QuestionTypeBadge :type="item.type" :show-label="false" class="flex-shrink-0" />

          <!-- Checkmark -->
          <svg v-if="modelValue === item.id" class="w-5 h-5 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Item } from '~/types/database'

const props = defineProps<{
  modelValue: string | null
  items: Item[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const isOpen = ref(false)

const selectedIndex = computed(() => {
  if (!props.modelValue) return -1
  return props.items.findIndex(item => item.id === props.modelValue)
})

const selectedItem = computed(() => {
  if (!props.modelValue) return null
  return props.items.find(item => item.id === props.modelValue) || null
})

const selectQuestion = (itemId: string | null) => {
  emit('update:modelValue', itemId)
  isOpen.value = false
}

// Fermer au clic extérieur
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
