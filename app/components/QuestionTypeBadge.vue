<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap"
    :class="badgeClasses"
  >
    <!-- Icône -->
    <svg
      class="w-3.5 h-3.5 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <component :is="getIconPath" />
    </svg>

    <!-- Texte (optionnel) -->
    <span v-if="showLabel">{{ getLabel }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import type { ItemType } from '~/types/database'

const props = withDefaults(defineProps<{
  type: ItemType
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}>(), {
  showLabel: true,
  size: 'md'
})

// Configuration des types avec couleurs et labels
const typeConfig = {
  poll_single: {
    label: 'Choix unique',
    bgClass: 'bg-indigo-100',
    textClass: 'text-indigo-700',
    hoverClass: 'hover:bg-indigo-200'
  },
  poll_multi: {
    label: 'Choix multiple',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
    hoverClass: 'hover:bg-purple-200'
  },
  open: {
    label: 'Question ouverte',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
    hoverClass: 'hover:bg-green-200'
  },
  scale: {
    label: 'Échelle',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
    hoverClass: 'hover:bg-orange-200'
  },
  wordcloud: {
    label: 'Nuage de mots',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    hoverClass: 'hover:bg-blue-200'
  }
}

const config = computed(() => typeConfig[props.type] || typeConfig.poll_single)

const badgeClasses = computed(() => [
  config.value.bgClass,
  config.value.textClass,
  config.value.hoverClass,
  'transition-colors'
])

const getLabel = computed(() => config.value.label)

// Icônes SVG paths
const getIconPath = computed(() => {
  const icons = {
    poll_single: () => h('g', {}, [
      h('circle', { cx: '12', cy: '12', r: '9', 'stroke-width': '2' }),
      h('circle', { cx: '12', cy: '12', r: '4', fill: 'currentColor' })
    ]),

    poll_multi: () => h('g', {}, [
      h('rect', { x: '4', y: '4', width: '6', height: '6', rx: '1', 'stroke-width': '2' }),
      h('rect', { x: '4', y: '14', width: '6', height: '6', rx: '1', 'stroke-width': '2' }),
      h('rect', { x: '14', y: '4', width: '6', height: '6', rx: '1', 'stroke-width': '2' }),
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M6 7l1 1 2-2M6 17l1 1 2-2M16 7l1 1 2-2' })
    ]),

    open: () => h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }),

    scale: () => h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M7 16V8M11 16V6M15 16v-4M19 16v-6' }),

    wordcloud: () => h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 7h3m0 0h6m-6 0v3m0-3V4m9 3h3m0 0h3m-3 0v3m0-3V4M9 17h6m-6 0v3m0-3h-3m9 0v3m0-3h3' })
  }

  return icons[props.type] || icons.poll_single
})
</script>
