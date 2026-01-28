<template>
  <div class="flex flex-col items-center">
    <!-- QR Code Container -->
    <div ref="qrCodeRef" class="bg-white p-4 rounded-xl shadow-lg"></div>

    <!-- Session Code below -->
    <div v-if="showCode" class="mt-4 text-center">
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
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  showCode: true,
  size: 300
})

const qrCodeRef = ref<HTMLElement>()
let qrCode: QRCodeStyling | null = null

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
