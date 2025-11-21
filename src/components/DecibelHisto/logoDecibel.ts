<template>
  <div class="sonometre-container" :style="{ backgroundImage: 'url(' + backgroundUrl + ')' }">
    <div class="controls">
      <!-- <button @click="toggleStartPause">{{ isRunning ? 'Pause' : 'Commencer' }}</button> -->
    </div>
    <div class="volume-display">
      <img
        v-if="!exploded"
        :src="logoUrl"
        :style="logoStyle"
        alt="Logo"
        class="sonometre-logo"
      />
      <img
        v-else
        :src="explodedLogoUrl"
        class="sonometre-logo exploded"
        alt="Exploded"
      />
      <span
        v-if="showDb"
        class="db-value"
        :style="dbStyle"
      >{{ volumeInt }} dB</span>

      <!-- barre de niveau, affichable / masquable par double "b" -->
      <div v-if="showBar" class="db-bar">
        <div class="bar-fill" :style="barStyle"></div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted, onUnmounted, computed } from 'vue'
import sonometreBg from '@/assets/sonometre-bg.png'
import logo from '@/assets/logo_krys.svg' // Choisis ton logo ici
import explodedLogo from '@/assets/logo_krys.svg' // Logo après explosion

const backgroundUrl = ref(sonometreBg)
const logoUrl = logo
const explodedLogoUrl = explodedLogo

const volume = ref(0)
const volumeInt = ref(0)
const isRunning = ref(true)
const showDb = ref(false)
const exploded = ref(false)

// nouvelle option : afficher la barre (toggle double 'b')
const showBar = ref(true)

let audioCtx = null
let analyser = null
let source = null
let animationFrameId = null
let stream = null


// --- Double tap "d" management ---
let lastDTime = 0
// --- Double tap "x" management ---
let lastXTime = 0
// --- Double tap "b" management ---
let lastBTime = 0
// --- Fullscreen management ---
const fullscreenActive = ref(false)
let lastFTime = 0

const logoMinSize = 120
const logoMaxLimit = 400

const logoStyle = computed(() => ({
  width: logoMaxSize.value + 'px',
  height: logoMaxSize.value + 'px',
  transition: 'width 0.2s, height 0.2s'
}))

startAudio();

function updateLogoSize(currentDb) {
  // Multiplie le dB pour obtenir une taille plus grande
  const newSize = Math.min(logoMaxLimit, logoMinSize + currentDb * 3)
  if (newSize > lastMax.value) {
    lastMax.value = newSize
    logoMaxSize.value = newSize
  } else {
    // Descend seulement de 10% du dernier max
    logoMaxSize.value = Math.max(logoMinSize, lastMax.value * 0.9)
    lastMax.value = logoMaxSize.value
  }
  // Explosion
  if (currentDb >= 90) {
    exploded.value = true
  }
}


function onKeyDown(event) {
  const key = event.key.toLowerCase()

  if (key === 'd') {
    const now = Date.now()
    if (now - lastDTime < 500) {
      showDb.value = !showDb.value
      lastDTime = 0
    } else {
      lastDTime = now
    }
  }

  if (key === 'x') {
    const now = Date.now()
    if (now - lastXTime < 500) {
      // Triche : force le volume à dépasser 90 dB
      volumeInt.value = 95
      updateLogoSize(volumeInt.value)
      lastXTime = 0
    } else {
      lastXTime = now
    }
  }

  if (key === 'b') {
    const now = Date.now()
    if (now - lastBTime < 500) {
      // double b -> toggle barre
      showBar.value = !showBar.value
      lastBTime = 0
    } else {
      lastBTime = now
    }
  }

  // ...fullscreen management...
  if (key === 'f') {
    const now = Date.now()
    if (now - lastFTime < 500) {
      if (fullscreenActive.value) {
        document.exitFullscreen().catch(console.error)
        fullscreenActive.value = false
      }
      lastFTime = 0
    } else {
      if (!fullscreenActive.value) {
        document.documentElement.requestFullscreen().catch(console.error)
        fullscreenActive.value = true
      }
      lastFTime = now
    }
  }
}

// --- Logo size management ---
const logoMaxSize = ref(120)
const lastMax = ref(120)



function updateVolume() {
  if (!analyser) return
  const dataArray = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(dataArray)
  let sum = 0
  dataArray.forEach(v => sum += v)
  const avg = sum / dataArray.length
  volume.value = Math.min(Math.max(avg / 2.5, 0), 100)
  volumeInt.value = Math.round(volume.value)
  updateLogoSize(volumeInt.value)
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
  exploded.value = false
  lastMax.value = 120
  logoMaxSize.value = 120
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

// style pour la barre (sensible mais moins que le nombre)
const barStyle = computed(() => {
  const pct = Math.min(100, (volumeInt.value / 120) * 100)
  let bg = '#2ecc71'
  if (volumeInt.value >= 70) bg = '#c0392b'
  else if (volumeInt.value >= 50) bg = '#f39c12'
  return {
    width: pct + '%',
    height: '100%',
    background: bg,
    transition: 'width 0.18s linear, background 0.2s'
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
  border-radius: 25px;
  padding: 3rem 6rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}


.db-value {
  font-family: 'Arial Black', Arial, sans-serif;
  line-height: 1;
  color: #fff;
}

/* barre de niveau */
.db-bar {
  width: 420px;
  max-width: 80vw;
  height: 18px;
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
  overflow: hidden;
  margin-top: 1rem;
}

.bar-fill {
  height: 100%;
  width: 0%;
}

/* logo */
.sonometre-logo {
  margin-bottom: 1rem;
  transition: width 0.2s, height 0.2s;
}

.sonometre-logo.exploded {
  animation: explode 0.7s forwards;
}



@keyframes explode {
  0% { transform: scale(1); opacity: 1; }
  80% { transform: scale(2.5); opacity: 0.5; }
  100% { transform: scale(0); opacity: 0; }
}
</style>