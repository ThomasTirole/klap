<template>
  <div class="relative">
    <!-- Bouton principal -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-indigo-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none flex items-center justify-between group"
    >
      <div class="flex items-center gap-3">
        <!-- Icône du type sélectionné -->
        <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
          <component :is="getIcon(modelValue)" class="w-6 h-6 text-indigo-600" />
        </div>
        <div class="text-left">
          <p class="font-medium text-gray-900">{{ getLabel(modelValue) }}</p>
          <p class="text-xs text-gray-500">{{ getDescription(modelValue) }}</p>
        </div>
      </div>
      <!-- Chevron -->
      <svg
        class="w-5 h-5 text-gray-400 transition-transform duration-200"
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
        class="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl overflow-hidden"
      >
        <div class="py-2">
          <!-- Option: Poll Single -->
          <button
            type="button"
            @click="selectType('poll_single')"
            class="w-full px-4 py-3 flex items-center gap-3 hover:bg-indigo-50 transition-colors"
            :class="{ 'bg-indigo-50': modelValue === 'poll_single' }"
          >
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="modelValue === 'poll_single' ? 'bg-indigo-100' : 'bg-gray-100'"
            >
              <svg class="w-6 h-6" :class="modelValue === 'poll_single' ? 'text-indigo-600' : 'text-gray-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke-width="2" />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
              </svg>
            </div>
            <div class="text-left flex-1">
              <p class="font-medium text-gray-900">Sondage - Choix unique</p>
              <p class="text-xs text-gray-500">Une seule réponse possible</p>
            </div>
            <svg v-if="modelValue === 'poll_single'" class="w-5 h-5 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Option: Poll Multi -->
          <button
            type="button"
            @click="selectType('poll_multi')"
            class="w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-50 transition-colors"
            :class="{ 'bg-purple-50': modelValue === 'poll_multi' }"
          >
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="modelValue === 'poll_multi' ? 'bg-purple-100' : 'bg-gray-100'"
            >
              <svg class="w-6 h-6" :class="modelValue === 'poll_multi' ? 'text-purple-600' : 'text-gray-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="4" width="6" height="6" rx="1" stroke-width="2" />
                <rect x="4" y="14" width="6" height="6" rx="1" stroke-width="2" />
                <rect x="14" y="4" width="6" height="6" rx="1" stroke-width="2" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 7l1 1 2-2M6 17l1 1 2-2M16 7l1 1 2-2" />
              </svg>
            </div>
            <div class="text-left flex-1">
              <p class="font-medium text-gray-900">Sondage - Choix multiple</p>
              <p class="text-xs text-gray-500">Plusieurs réponses possibles</p>
            </div>
            <svg v-if="modelValue === 'poll_multi'" class="w-5 h-5 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Option: Open -->
          <button
            type="button"
            @click="selectType('open')"
            class="w-full px-4 py-3 flex items-center gap-3 hover:bg-green-50 transition-colors"
            :class="{ 'bg-green-50': modelValue === 'open' }"
          >
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="modelValue === 'open' ? 'bg-green-100' : 'bg-gray-100'"
            >
              <svg class="w-6 h-6" :class="modelValue === 'open' ? 'text-green-600' : 'text-gray-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="text-left flex-1">
              <p class="font-medium text-gray-900">Question ouverte</p>
              <p class="text-xs text-gray-500">Réponse textuelle libre</p>
            </div>
            <svg v-if="modelValue === 'open'" class="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Option: Scale -->
          <button
            type="button"
            @click="selectType('scale')"
            class="w-full px-4 py-3 flex items-center gap-3 hover:bg-orange-50 transition-colors"
            :class="{ 'bg-orange-50': modelValue === 'scale' }"
          >
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="modelValue === 'scale' ? 'bg-orange-100' : 'bg-gray-100'"
            >
              <svg class="w-6 h-6" :class="modelValue === 'scale' ? 'text-orange-600' : 'text-gray-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V8M11 16V6M15 16v-4M19 16v-6" />
              </svg>
            </div>
            <div class="text-left flex-1">
              <p class="font-medium text-gray-900">Échelle d'évaluation</p>
              <p class="text-xs text-gray-500">Note de 1 à 5 (ou plus)</p>
            </div>
            <svg v-if="modelValue === 'scale'" class="w-5 h-5 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Option: Wordcloud -->
          <button
            type="button"
            @click="selectType('wordcloud')"
            class="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors"
            :class="{ 'bg-blue-50': modelValue === 'wordcloud' }"
          >
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="modelValue === 'wordcloud' ? 'bg-blue-100' : 'bg-gray-100'"
            >
              <svg class="w-6 h-6" :class="modelValue === 'wordcloud' ? 'text-blue-600' : 'text-gray-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h3m0 0h6m-6 0v3m0-3V4m9 3h3m0 0h3m-3 0v3m0-3V4M9 17h6m-6 0v3m0-3h-3m9 0v3m0-3h3" />
              </svg>
            </div>
            <div class="text-left flex-1">
              <p class="font-medium text-gray-900">Nuage de mots</p>
              <p class="text-xs text-gray-500">Mots-clés séparés par virgules</p>
            </div>
            <svg v-if="modelValue === 'wordcloud'" class="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { ItemType } from '~/types/database'

const props = defineProps<{
  modelValue: ItemType
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ItemType]
}>()

const isOpen = ref(false)

const questionTypes = {
  poll_single: {
    label: 'Sondage - Choix unique',
    description: 'Une seule réponse possible',
    icon: 'poll_single'
  },
  poll_multi: {
    label: 'Sondage - Choix multiple',
    description: 'Plusieurs réponses possibles',
    icon: 'poll_multi'
  },
  open: {
    label: 'Question ouverte',
    description: 'Réponse textuelle libre',
    icon: 'open'
  },
  scale: {
    label: 'Échelle d\'évaluation',
    description: 'Note de 1 à 5 (ou plus)',
    icon: 'scale'
  },
  wordcloud: {
    label: 'Nuage de mots',
    description: 'Mots-clés séparés par virgules',
    icon: 'wordcloud'
  }
}

const getLabel = (type: ItemType) => questionTypes[type]?.label || ''
const getDescription = (type: ItemType) => questionTypes[type]?.description || ''
const getIcon = (type: ItemType) => questionTypes[type]?.icon || 'poll_single'

const selectType = (type: ItemType) => {
  emit('update:modelValue', type)
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
