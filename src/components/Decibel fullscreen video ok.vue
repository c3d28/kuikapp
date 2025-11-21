<template>
<div ref="root" class="sonometre-container" :style="{ backgroundImage: 'url(' + backgroundUrl + ')' }">
         <!-- video background -->
    <video
      v-if="backgroundUrl"
      :src="backgroundUrl"
      class="bg-video"
      autoplay
      loop
      muted
      playsinline
      aria-hidden="true"
    ></video>
    
    <div class="controls">
      <!-- contrôles éventuels -->
    </div>

    <div class="volume-display">
      <!-- Affiche uniquement les dB (plus de logo pour le moment) -->
      <span class="db-value" :class="{ blinking: cheatActive }" :style="dbStyle">{{ volumeInt }} dB</span>

      <!-- barre de niveau, affichable / masquable par double "b" -->
      <div v-if="showBar" class="db-bar">
        <div class="bar-fill" :class="{ blinking: cheatActive }" :style="barStyle"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import sonometreBg from '@/assets/sonometre-bg.mov'

const backgroundUrl = ref(sonometreBg)
const root = ref(null)                    // <-- ajout


const volume = ref(0)
const volumeInt = ref(0)
const isRunning = ref(true)
const showDb = ref(true)      // afficher le chiffre
const showBar = ref(true)     // toggle barre (double 'b')

// cheat / max state
const cheatActive = ref(false)

// track highest value of the session
const sessionMax = ref(0)
// ramp value used when cheating (starts at current value and eases to target)
const cheatRamp = ref(0)
const cheatTarget = ref(0)
const CHEAT_LIMIT = 120

let audioCtx = null
let analyser = null
let source = null
let animationFrameId = null
let stream = null

// double-tap keys
let lastDTime = 0
let lastXTime = 0
let lastBTime = 0
const fullscreenActive = ref(false)
let lastFTime = 0

function onKeyDown(event) {
  const key = event.key.toLowerCase()

  if (key === 'd') {
    const now = Date.now()
    if (now - lastDTime < 500) {
      showDb.value = !showDb.value
      lastDTime = 0
    } else lastDTime = now
  }

  if (key === 'x') {
    const now = Date.now()
    if (now - lastXTime < 500) {
      // double X -> toggle simulation to sessionMax + 15 (capped)
      if (!cheatActive.value) {
        // enable cheat: compute target from highest session value and start ramp from current displayed value
        const computedTarget = Math.min(CHEAT_LIMIT, sessionMax.value + 15)
        cheatTarget.value = computedTarget
        cheatRamp.value = volumeInt.value // start from current shown value
        cheatActive.value = true
      } else {
        // disable cheat: simply turn off (normal audio resumes)
        cheatActive.value = false
      }
      lastXTime = 0
    } else lastXTime = now
  }

  if (key === 'b') {
    const now = Date.now()
    if (now - lastBTime < 500) {
      showBar.value = !showBar.value
      lastBTime = 0
    } else lastBTime = now
  }

  if (key === 'f') {
    const now = Date.now()
    if (now - lastFTime < 500) {
      if (!fullscreenActive.value) {
        enterFullscreen(root.value)
      } else {
        exitFullscreen()
      }
      lastFTime = 0
    } else {
      lastFTime = now
    }
  }
}

function enterFullscreen(el) {
  if (!el) return
  const fn =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen
  if (fn) {
    try { fn.call(el) } catch (e) { /* ignore */ }
  }
}
function exitFullscreen() {
  const fn =
    document.exitFullscreen ||
    document.webkitExitFullscreen ||
    document.mozCancelFullScreen ||
    document.msExitFullscreen
  if (fn) {
    try { fn.call(document) } catch (e) { /* ignore */ }
  }
}

// garder l'état fullscreen synchronisé (avec fallback vendors)
function onFullscreenChange() {
  fullscreenActive.value = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  )
}

// bar style (moins sensible)
const barStyle = computed(() => {
  const pct = Math.min(100, (volumeInt.value / CHEAT_LIMIT) * 100)
  let bg = '#2ecc71'
  if (volumeInt.value >= 85) bg = '#f39c12'
  if (volumeInt.value >= 100) bg = '#c0392b'
  return {
    width: pct + '%',
    height: '100%',
    background: bg,
    transition: 'width 0.18s linear, background 0.2s'
  }
})

const dbStyle = computed(() => {
  const baseSize = 56
  const size = baseSize + Math.min(CHEAT_LIMIT, volumeInt.value) * 0.6
  let color = '#2ecc71'
  if (volumeInt.value >= 100) color = '#c0392b'
  else if (volumeInt.value >= 85) color = '#f39c12'
  return {
    fontSize: size + 'px',
    fontWeight: 900,
    color,
    textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
    transition: 'font-size 0.12s linear, color 0.2s'
  }
})

// audio loop (lissage simple autour de la valeur courante)
let smooth = 0
const SMOOTH_ALPHA = 0.12 // ajuster pour moins/more de sensibilité
const CHEAT_RAMP_FACTOR = 0.06 // vitesse de montée vers la target

function updateVolume() {
  // if cheat active, ramp from last value to cheatTarget smoothly
  if (cheatActive.value) {
    // ease cheatRamp towards cheatTarget
    cheatRamp.value += (cheatTarget.value - cheatRamp.value) * CHEAT_RAMP_FACTOR
    volumeInt.value = Math.round(cheatRamp.value)

    // keep sessionMax updated if ramp exceeds previous max
    if (volumeInt.value > sessionMax.value) sessionMax.value = volumeInt.value

    animationFrameId = requestAnimationFrame(updateVolume)
    return
  }

  if (!analyser) {
    animationFrameId = requestAnimationFrame(updateVolume)
    return
  }

  const dataArray = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(dataArray)
  let sum = 0
  for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]
  const avg = sum / dataArray.length

  // map avg (0-255) to 0-120 dB-ish scale (approx)
  const est = Math.min(CHEAT_LIMIT, Math.max(0, (avg / 255) * CHEAT_LIMIT))

  // EMA smoothing to avoid jumping back to 0 (comportement boîte de nuit)
  smooth = smooth * (1 - SMOOTH_ALPHA) + est * SMOOTH_ALPHA

  // quantize slightly to keep natural small variations (8/10/9/11 style)
  const quant = Math.round(smooth) // arrondir à l'entier
  volumeInt.value = quant

  // update session max
  if (volumeInt.value > sessionMax.value) sessionMax.value = volumeInt.value

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
    smooth = 0
    sessionMax.value = 0
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
    document.addEventListener('fullscreenchange', onFullscreenChange)

  startAudio()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('fullscreenchange', onFullscreenChange)

  if (stream) stream.getTracks().forEach(t => t.stop())
  if (audioCtx) audioCtx.close().catch(() => {})
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})
</script>

<style scoped>

.sonometre-container {
  position: fixed;
  inset: 0;               /* top:0; right:0; bottom:0; left:0; */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
  padding: 2rem;          /* extérieur normal (sera retiré en fullscreen) */
  z-index: 1;
}

/* video de fond */
.bg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;    /* contain = pas de crop, ou use 'cover' si tu préfères remplissage */
  max-width: 100%;
  max-height: 100%;
  z-index: 0;
  pointer-events: none;
  filter: brightness(0.6);
}

.volume-display,
.controls {
  position: relative;
  z-index: 2;
}


/* limiter la taille du panneau pour éviter qu'il soit coupé */
.volume-display {
  width: 520px;
  max-width: 90vw;
  max-height: 90vh;      /* important pour ne pas dépasser l'écran */
  overflow: auto;        /* scroll si nécessaire */
  background: rgba(255,255,255,0.03);
  border: 2px solid rgba(255,255,255,0.06);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  color: #fff;
  box-shadow: 0 8px 30px rgba(0,0,0,0.6);
  box-sizing: border-box;
}
/* règles spécifiques au mode fullscreen */
:fullscreen .sonometre-container,
:-webkit-full-screen .sonometre-container,
:-moz-full-screen .sonometre-container,
:-ms-fullscreen .sonometre-container {
  padding: 0;            /* retire padding pour ne pas pousser le contenu hors écran */
}

/* big number */
.db-value {
  display: block;
  line-height: 1;
  margin-bottom: 1rem;
  font-family: 'Arial Black', Arial, sans-serif;
}

/* blinking when max */
.db-value.blinking {
  animation: db-blink 0.6s steps(2,start) infinite;
}

.bar-fill.blinking {
  animation: db-blink 0.6s steps(2,start) infinite;
}

@keyframes db-blink {
  0% { opacity: 1; filter: drop-shadow(0 0 12px rgba(255,0,0,0.9)); transform: scale(1); }
  50% { opacity: 0.2; filter: none; transform: scale(1.02); }
  100% { opacity: 1; filter: drop-shadow(0 0 12px rgba(255,0,0,0.9)); transform: scale(1); }
}

/* progress bar */
.db-bar {
  width: 100%;
  height: 18px;
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
  overflow: hidden;
  margin-top: 0.6rem;
}

.bar-fill {
  height: 100%;
  width: 0%;
  transition: width 0.18s linear, background 0.2s;
}
</style>