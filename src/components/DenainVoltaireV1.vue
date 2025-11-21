<template>
  <div class="sonometre-container">
    <div class="controls">
      <!-- contrôles éventuels -->
    </div>

    <div class="db-display">
      <div class="db-value" :style="dbStyle">{{ displayedDb }} dB</div>
      <div class="db-bar">
        <div class="bar-fill" :style="barStyle"></div>
      </div>
      <div class="limits">
        <span class="limit">85</span>
        <span class="limit">100</span>
        <span class="limit">120</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

// ...existing code...

const volume = ref(0)         // raw 0-100 estimate
const rawDb = ref(0)
const smoothDb = ref(0)      // EMA smoothed value
const displayedDb = ref(0)   // integer shown to user

const isRunning = ref(false)
const showDb = ref(true)     // afficher le chiffre
const exploded = ref(false)

let audioCtx = null
let analyser = null
let source = null
let animationFrameId = null
let stream = null

// smoothing config (moins sensible)
const SMOOTH_ALPHA = 0.08 // plus petit = plus lisse
const SCALE_TO_DB = 1.2   // ajuste l'échelle vers 0-120 max

// cheat simulation (double-tap X)
let lastXTime = 0
const cheatActive = ref(false)
const cheatTarget = ref(0)   // cible (0 - 120)
const cheatValue = ref(0)    // valeur animée

// keyboard
let lastDTime = 0
const fullscreenActive = ref(false)
let lastFTime = 0

function onKeyDown(event) {
  const k = event.key.toLowerCase()
  if (k === 'd') {
    const now = Date.now()
    if (now - lastDTime < 500) {
      showDb.value = !showDb.value
      lastDTime = 0
    } else lastDTime = now
  }

  if (k === 'x') {
    const now = Date.now()
    if (now - lastXTime < 500) {
      // double tap: démarrer la simulation jusqu'à 120 dB
      cheatActive.value = true
      cheatTarget.value = 120
      // initialize cheatValue from current displayed value
      cheatValue.value = Math.max(cheatValue.value, displayedDb.value)
      lastXTime = 0
    } else {
      lastXTime = now
    }
  }

  if (k === 'f') {
    const now = Date.now()
    if (now - lastFTime < 500) {
      if (fullscreenActive.value) {
        document.exitFullscreen().catch(() => {})
        fullscreenActive.value = false
      }
      lastFTime = 0
    } else {
      if (!fullscreenActive.value) {
        document.documentElement.requestFullscreen().catch(() => {})
        fullscreenActive.value = true
      }
      lastFTime = now
    }
  }
}

// compute styles
const dbStyle = computed(() => {
  const size = 72 + Math.min(120, displayedDb.value) * 0.9
  let color = '#2ecc71' // green
  if (displayedDb.value >= 100) color = '#c0392b'
  else if (displayedDb.value >= 85) color = '#f39c12'
  return {
    fontSize: size + 'px',
    color,
    fontWeight: 900,
    textShadow: '2px 2px 10px rgba(0,0,0,0.6)',
    transition: 'font-size 0.15s linear, color 0.2s'
  }
})

const barStyle = computed(() => {
  const pct = Math.min(100, (displayedDb.value / 120) * 100)
  let bg = '#2ecc71'
  if (displayedDb.value >= 100) bg = '#c0392b'
  else if (displayedDb.value >= 85) bg = '#f39c12'
  return {
    width: pct + '%',
    background: bg,
    transition: 'width 0.12s linear, background 0.2s'
  }
})

// audio processing
function updateVolume() {
  if (!analyser) {
    animationFrameId = requestAnimationFrame(updateVolume)
    return
  }

  const dataArray = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(dataArray)
  let sum = 0
  for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]
  const avg = sum / dataArray.length

  // map avg (0-255) to 0-100 then scale to dB-ish (rough)
  const est = Math.min(100, Math.max(0, avg / 2.3))
  rawDb.value = Math.round(est * SCALE_TO_DB)

  // EMA smoothing
  smoothDb.value = smoothDb.value * (1 - SMOOTH_ALPHA) + rawDb.value * SMOOTH_ALPHA

  // if cheat active, ramp cheatValue toward cheatTarget
  if (cheatActive.value) {
    // ease towards target
    cheatValue.value += (cheatTarget.value - cheatValue.value) * 0.06
    // ensure we don't drop below smoothed when ramping
    const override = Math.max(smoothDb.value, cheatValue.value)
    displayedDb.value = Math.round(override)
    // trigger exploded when >= 120
    if (displayedDb.value >= 120) {
      exploded.value = true
      // stop cheat ramp (keep at top)
      cheatActive.value = false
      cheatTarget.value = 0
    }
  } else {
    // normal display follows smoothed value, rounded per "reasonable" nightclub behavior
    displayedDb.value = Math.round(smoothDb.value)
  }

  animationFrameId = requestAnimationFrame(updateVolume)
}

async function startAudio() {
  if (audioCtx && audioCtx.state === 'running') return
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioCtx = new AudioContext()
    source = audioCtx.createMediaStreamSource(stream)
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    isRunning.value = true
    smoothDb.value = 0
    rawDb.value = 0
    displayedDb.value = 0
    animationFrameId = requestAnimationFrame(updateVolume)
  } catch (e) {
    alert('Microphone inaccessible ou refusé.')
  }
}

function stopAudio() {
  if (audioCtx && audioCtx.state === 'running') audioCtx.suspend()
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  isRunning.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  startAudio()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  if (stream) stream.getTracks().forEach(t => t.stop())
  if (audioCtx) audioCtx.close().catch(() => {})
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})
</script>

<style scoped>
.sonometre-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #111 0%, #000 60%, #120000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  box-sizing: border-box;
  padding: 2rem;
}

/* central display */
.db-display {
  width: 520px;
  max-width: 90vw;
  background: rgba(255,255,255,0.03);
  border: 2px solid rgba(255,255,255,0.06);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  color: #fff;
  box-shadow: 0 8px 30px rgba(0,0,0,0.6);
}

/* big number */
.db-value {
  display: block;
  line-height: 1;
  margin-bottom: 1rem;
}

/* progress bar */
.db-bar {
  width: 100%;
  height: 18px;
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.6rem;
}

.bar-fill {
  height: 100%;
  width: 0%;
}

/* small limit markers */
.limits {
  display: flex;
  justify-content: space-between;
  color: rgba(255,255,255,0.5);
  font-size: 0.9rem;
  padding: 0 6px;
}

/* exploded visual */
.sonometre-logo.exploded { /* kept for compatibility if used elsewhere */ }
</style>