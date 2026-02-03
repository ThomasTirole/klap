<template>
  <div class="flex flex-col items-center">
    <!-- QR Code Container -->
    <div ref="qrCodeRef" class="bg-white p-4 rounded-xl shadow-lg"></div>

    <!-- URL stylisée pour les utilisateurs desktop -->
    <div v-if="showUrl && displayUrl" class="mt-6 w-full">
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
        <p class="text-xs text-gray-500 text-center mb-2">Ou rendez-vous sur :</p>
        <div class="flex items-center justify-center gap-2">
          <div class="bg-white px-4 py-2 rounded-lg border border-indigo-200 shadow-sm">
            <span class="text-lg font-semibold text-indigo-600">{{ shortDomain }}</span>
            <span class="text-lg text-gray-400">/</span>
            <span class="text-lg font-mono font-bold text-purple-600">{{ code }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Session Code below (legacy) -->
    <div v-else-if="showCode && code" class="mt-4 text-center">
      <p class="text-sm text-gray-500 mb-1">Ou entrez le code :</p>
      <p class="text-3xl font-mono font-bold text-indigo-600">{{ code }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCodeStyling from 'qr-code-styling'

interface Props {
  url: string
  code?: string
  showCode?: boolean
  showUrl?: boolean
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  showCode: true,
  showUrl: false,
  size: 300
})

const qrCodeRef = ref<HTMLElement>()
let qrCode: QRCodeStyling | null = null

// Extraire le domaine court (sans https://)
const displayUrl = computed(() => props.url)
const shortDomain = computed(() => {
  try {
    const urlObj = new URL(props.url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return ''
  }
})

onMounted(() => {
  if (!qrCodeRef.value) return

  // Créer le QR code avec un beau design
  qrCode = new QRCodeStyling({
    width: props.size,
    height: props.size,
    type: 'svg',
    data: props.url,
    image: '/logo.svg', // Logo au centre
    dotsOptions: {
      color: '#6366f1',
      type: 'rounded'
    },
    cornersSquareOptions: {
      color: '#a855f7',
      type: 'extra-rounded'
    },
    cornersDotOptions: {
      color: '#6366f1',
      type: 'dot'
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 8,
      imageSize: 0.4
    },
    backgroundOptions: {
      color: '#ffffff'
    },
    qrOptions: {
      errorCorrectionLevel: 'H' // High pour supporter le logo
    }
  })

  qrCode.append(qrCodeRef.value)
})

onUnmounted(() => {
  qrCode = null
})
</script>
