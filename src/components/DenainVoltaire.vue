<template>
  <div class="sonometre-container" :style="{ backgroundImage: 'url(' + backgroundUrl + ')' }">
    <div class="controls">
      <button @click="toggleStartPause">{{ isRunning ? 'Pause' : 'Commencer' }}</button>
    </div>
    <div class="volume-display">
      <span
        class="db-value"
        :style="dbStyle"
      >{{ volumeInt }} dB</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import sonometreBg from '@/assets/sonometre-bg.png' // <-- Ajoute cette ligne
const backgroundUrl = ref(sonometreBg)

const volume = ref(0)
const volumeInt = ref(0)
const isRunning = ref(false)

let audioCtx = null
let analyser = null
let source = null
let animationFrameId = null
let stream = null

// --- Fullscreen management ---
const fullscreenActive = ref(false)
let lastFTime = 0

function onKeyDown(event) {
  if (event.key.toLowerCase() === 'f') {
    const now = Date.now()
    if (now - lastFTime < 500) {
      // double press: exit fullscreen if active
      if (fullscreenActive.value) {
        document.exitFullscreen().catch(console.error)
        fullscreenActive.value = false
      }
      lastFTime = 0
    } else {
      // single press: enter fullscreen if not active
      if (!fullscreenActive.value) {
        document.documentElement.requestFullscreen().catch(console.error)
        fullscreenActive.value = true
      }
      lastFTime = now
    }
  }
}

// --- Volume update ---
function updateVolume() {
  if (!analyser) return
  const dataArray = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(dataArray)
  let sum = 0
  dataArray.forEach(v => sum += v)
  const avg = sum / dataArray.length
  volume.value = Math.min(Math.max(avg / 2.5, 0), 100)
  volumeInt.value = Math.round(volume.value)
  animationFrameId = requestAnimationFrame(updateVolume)
}

async function startAudio() {
  if (audioCtx && audioCtx.state === 'running') return

  if (!audioCtx) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioCtx = new AudioContext()
      source = audioCtx.createMediaStreamSource(stream)
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
    } catch (e) {
      alert('Microphone inaccessible ou refusé.')
      return
    }
  }

  if (audioCtx.state === 'suspended') await audioCtx.resume()
  isRunning.value = true
  updateVolume()
}

function stopAudio() {
  if (audioCtx && audioCtx.state === 'running') {
    audioCtx.suspend()
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  isRunning.value = false
}

function toggleStartPause() {
  if (isRunning.value) {
    stopAudio()
  } else {
    startAudio()
  }
}

const dbStyle = computed(() => {
  const baseSize = 50
  const size = baseSize + volume.value * 2
  let color = 'green'
  if (volumeInt.value >= 70) color = 'red'
  else if (volumeInt.value >= 50) color = 'orange'
  return {
    fontSize: size + 'px',
    fontWeight: '900',
    color,
    textShadow: '2px 2px 6px rgba(0,0,0,0.7)',
    transition: 'font-size 0.1s, color 0.2s'
  }
})

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
  if (audioCtx) {
    audioCtx.close()
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.sonometre-container {
  width: 100vw;
  height: 100vh;
  background-size: cover;
  background-position: center center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;
}

.controls {
  margin-bottom: 2rem;
}

button {
  padding: 0.6rem 1.2rem;
  font-size: 1.2rem;
  border-radius: 8px;
  border: none;
  background-color: #12c2e9;
  color: white;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0 10px #12c2e9aa;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0f9acb;
}

.volume-display {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 25px;
  padding: 3rem 6rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 40px #12c2e9bb;
}

.db-value {
  font-family: 'Arial Black', Arial, sans-serif;
  line-height: 1;
}
</style>
