<template>
  <div ref="root" class="sonometre-container">
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
      <!-- ...existing code... -->
    </div>

    <div class="volume-display">
      <img
        :src="logoUrl"
        alt="logo"
        class="logo-img"
        :class="{ blinking: cheatActive }"
        :style="logoStyle"
      />

      <!-- égaliseur visuel (remplace la barre) -->
      <div v-if="showBar" class="eq" :class="{ cheat: cheatActive }" aria-hidden="true">
        <div
          v-for="(h, i) in bars"
          :key="i"
          class="eq-bar"
          :style="{ height: h + '%' }"
        ></div>
      </div>

      <!-- barre de niveau, affichable / masquable par double "b" 
      <div v-if="showBar" class="db-bar">
        <div class="bar-fill" :class="{ blinking: cheatActive }" :style="barStyle"></div>
      </div>-->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import sonometreBg from '@/assets/sonometre-bg.mov'
import logoKrys from '@/assets/logo_krys_old.svg'


const backgroundUrl = ref(sonometreBg)
const root = ref(null)
const logoUrl = logoKrys

const volumeInt = ref(0)
const isRunning = ref(true)
const showDb = ref(true)
const showBar = ref(true)

// cheat / max state
const cheatActive = ref(false)

// track highest value of the session
const sessionMax = ref(0)
const cheatRamp = ref(0)
const cheatTarget = ref(0)
const CHEAT_LIMIT = 120

// equalizer config
const BARS = 16
const bars = ref(new Array(BARS).fill(0))
const _barsSmooth = new Array(BARS).fill(0)
const BAR_SMOOTH_ALPHA = 0.22

// logo sizing
const logoMinSize = 500     // <-- augmenté (taille de départ)
const LOGO_SCALE = 6.0      // <-- multiplicateur d'agrandissement par dB
const logoLimit = 1400      // <-- plafond plus grand
const logoMaxSize = ref(logoMinSize)
const lastLogoMax = ref(logoMinSize)

let audioCtx = null
let analyser = null
let source = null
let gainNode = null
let animationFrameId = null
let stream = null

// double-tap keys
let lastXTime = 0
let lastBTime = 0
let lastFTime = 0
const fullscreenActive = ref(false)

function enterFullscreen(el) {
  if (!el) return
  const fn =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen
  if (fn) try { fn.call(el) } catch (e) {}
}
function exitFullscreen() {
  const fn =
    document.exitFullscreen ||
    document.webkitExitFullscreen ||
    document.mozCancelFullScreen ||
    document.msExitFullscreen
  if (fn) try { fn.call(document) } catch (e) {}
}

function onFullscreenChange() {
  fullscreenActive.value = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  )
}

// update logo visual sizing (keeps previous "peak" behaviour)
function updateLogoSize(currentDb) {
  // apply stronger scaling, clamp to logoLimit
  const newSize = Math.min(logoLimit, Math.round(logoMinSize + currentDb * LOGO_SCALE))
  if (newSize > lastLogoMax.value) {
    lastLogoMax.value = newSize
    logoMaxSize.value = newSize
  } else {
    lastLogoMax.value = Math.max(logoMinSize, lastLogoMax.value * 0.9)
    logoMaxSize.value = lastLogoMax.value
  }
}
function onKeyDown(event) {
  const key = event.key?.toLowerCase()
  if (!key) return

  if (key === 'x') {
    const now = Date.now()
    if (now - lastXTime < 500) {
      if (!cheatActive.value) {
        const computedTarget = Math.min(CHEAT_LIMIT, sessionMax.value + 15)
        cheatTarget.value = computedTarget
        cheatRamp.value = volumeInt.value
        cheatActive.value = true
      } else {
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
      if (!fullscreenActive.value) enterFullscreen(root.value)
      else exitFullscreen()
      lastFTime = 0
    } else lastFTime = now
  }
}

// style pour le logo (taille animée)
const logoStyle = computed(() => ({
  width: Math.round(logoMaxSize.value) + 'px',
  height: Math.round(logoMaxSize.value) + 'px',
  transition: cheatActive.value ? 'width 0.12s linear, height 0.12s linear, transform 0.12s' : 'width 0.22s ease, height 0.22s ease'
}))

// audio processing
let smooth = 0
const SMOOTH_ALPHA = 0.12
const CHEAT_RAMP_FACTOR = 0.06


function updateVolume() {
  // cheat ramp: keep bars and logo ramping from current to target
  if (cheatActive.value) {
    cheatRamp.value += (cheatTarget.value - cheatRamp.value) * CHEAT_RAMP_FACTOR
    const val = Math.round(cheatRamp.value)
    volumeInt.value = val
    if (volumeInt.value > sessionMax.value) sessionMax.value = volumeInt.value
    updateLogoSize(volumeInt.value)
    // set bars to high values (smooth appearance)
    for (let i = 0; i < BARS; i++) {
      _barsSmooth[i] += (100 - _barsSmooth[i]) * 0.18
      bars.value[i] = Math.round(_barsSmooth[i])
    }
    animationFrameId = requestAnimationFrame(updateVolume)
    return
  }

  if (!analyser) {
    animationFrameId = requestAnimationFrame(updateVolume)
    return
  }

  // frequency data -> realistic equalizer
  const freq = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(freq)

  // debug: uncomment to inspect freq data
  // console.log('freq len', freq.length, 'max', Math.max(...freq))

  // map frequency bins to BARS groups
  const binsPerBar = Math.floor(freq.length / BARS) || 1
  // if input is silent (all zeros) provide a subtle ambient motion so EQ doesn't freeze
  const maxVal = Math.max(...freq)
  if (maxVal === 0) {
    for (let i = 0; i < BARS; i++) {
      _barsSmooth[i] += (6 - _barsSmooth[i]) * 0.04
      bars.value[i] = Math.round(_barsSmooth[i])
    }
  } else {
    for (let i = 0; i < BARS; i++) {
      let sum = 0
      const start = i * binsPerBar
      const end = Math.min(freq.length, start + binsPerBar)
      for (let j = start; j < end; j++) sum += freq[j]
      const avg = sum / (end - start || 1)
      // avg is 0..255 -> map to 0..100
      const pct = Math.min(100, Math.max(0, (avg / 255) * 100))
      // per-bar smoothing (EMA)
      _barsSmooth[i] = _barsSmooth[i] * (1 - BAR_SMOOTH_ALPHA) + pct * BAR_SMOOTH_ALPHA
      bars.value[i] = Math.round(_barsSmooth[i])
    }
  }

  // compute an overall db-like value from low/mid energy for logo sizing
  // take average of lower/mid bands to represent loudness
  const lowCount = Math.max(1, Math.floor(BARS * 0.6))
  let sumLow = 0
  for (let i = 0; i < lowCount; i++) sumLow += bars.value[i]
  const loud = Math.round(sumLow / lowCount) // 0..100
  // scale to CHEAT_LIMIT
  const scaled = Math.min(CHEAT_LIMIT, Math.round((loud / 100) * CHEAT_LIMIT))
  volumeInt.value = scaled
  if (volumeInt.value > sessionMax.value) sessionMax.value = volumeInt.value
  updateLogoSize(volumeInt.value)

  animationFrameId = requestAnimationFrame(updateVolume)
}

async function startAudio() {
  if (audioCtx && audioCtx.state === 'running') return
  try {
    // try to get raw mic data
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    })

    audioCtx = new AudioContext()
    source = audioCtx.createMediaStreamSource(stream)

    gainNode = audioCtx.createGain()
    gainNode.gain.value = 4.0 // adjust if needed

    analyser = audioCtx.createAnalyser()
    // FFT size controls frequencyBinCount = fftSize / 2
    // 1024 gives faster updates while keeping decent resolution
    analyser.fftSize = 1024
    analyser.smoothingTimeConstant = 0.6

    source.connect(gainNode)
    gainNode.connect(analyser)

    // reset state
    sessionMax.value = 0
    lastLogoMax.value = logoMinSize
    logoMaxSize.value = logoMinSize
    for (let i = 0; i < BARS; i++) _barsSmooth[i] = 0
    bars.value = new Array(BARS).fill(0)
    animationFrameId = requestAnimationFrame(updateVolume)
  } catch (e) {
    alert('Microphone inaccessible ou refusé. Vérifie les permissions.')
  }
}

function stopAudio() {
  if (audioCtx && audioCtx.state === 'running') audioCtx.suspend()
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('webkitfullscreenchange', onFullscreenChange)
  document.addEventListener('mozfullscreenchange', onFullscreenChange)
  document.addEventListener('MSFullscreenChange', onFullscreenChange)
  startAudio()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
  document.removeEventListener('mozfullscreenchange', onFullscreenChange)
  document.removeEventListener('MSFullscreenChange', onFullscreenChange)

  if (stream) stream.getTracks().forEach(t => t.stop())
  if (audioCtx) audioCtx.close().catch(() => {})
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})


</script>

<style scoped>
.sonometre-container {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
  padding: 2rem;
  z-index: 1;
}

/* video de fond */
.bg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
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

/* panneau */

/* remove container visuals around logo */
.volume-display {
  width: auto;
  max-width: 90vw;
  max-height: 90vh;
  background: transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-sizing: border-box;
}

/* logo */
.logo-img {
  display: block;
  margin: 0 auto;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: width 0.22s ease, height 0.22s ease, transform 0.12s;
  will-change: width, height, transform, filter;
  max-width: 95vw;   /* empêche débordement écran */
  max-height: 95vh;
}

/* equalizer */
.eq {
  width: 420px;
  max-width: 86vw;
  height: 90px;
  margin-top: 1rem;
  display: flex;
  align-items: flex-end;
  gap: 6px;
  justify-content: center;
  pointer-events: none;
}

.eq-bar {
  flex: 1 1 auto;
  background: rgba(255,255,255,0.95);
  width: 100%;
  border-radius: 3px;
  box-shadow: 0 4px 12px rgba(255,255,255,0.06);
  transform-origin: bottom center;
  transition: height 0.08s linear;
  opacity: 0.95;
}

/* cheat = blue glow + stronger bars */
.eq.cheat .eq-bar {
  background: linear-gradient(180deg, rgba(40,180,255,0.95), rgba(0,100,255,0.9));
  box-shadow: 0 6px 22px rgba(0,140,255,0.45);
  transition: height 0.06s linear;
}
/* subtle top highlight for realism */
.eq-bar::after {
  content: '';
  display: block;
  height: 6px;
  width: 100%;
  margin-top: -6px;
  background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.0));
  opacity: 0.12;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}
/* blinking when cheat */
.logo-img.blinking {
  animation: logo-blink-blue 0.6s steps(2,start) infinite;
}

.bar-fill.blinking {
  animation: logo-blink-blue 0.6s steps(2,start) infinite;
}

@keyframes logo-blink-blue {
  0% { opacity: 1; filter: drop-shadow(0 0 20px rgba(0,140,255,0.95)); transform: scale(1); }
  50% { opacity: 0.25; filter: none; transform: scale(1.06); }
  100% { opacity: 1; filter: drop-shadow(0 0 20px rgba(0,140,255,0.95)); transform: scale(1); }
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

/* fullscreen padding reset */
:fullscreen .sonometre-container,
:-webkit-full-screen .sonometre-container,
:-moz-full-screen .sonometre-container,
:-ms-fullscreen .sonometre-container {
  padding: 0;
}
</style>