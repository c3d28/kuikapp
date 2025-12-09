<template>
  <div
    ref="root"
    :class="['live-root', `theme-${theme}`]"
    :style="rootStyle"
    tabindex="0"
    aria-hidden="true"
  >
    <div class="court">
      <div class="court-bg"></div>

      <div class="slots">
        <div
          v-for="(pos, i) in slotPositions"
          :key="i"
          :ref="el => slotRefs[i] = el"
          class="slot"
          :data-pos="pos.name"
        >
          <div class="final-card" v-if="revealed[i]">
            <div class="final-photo">
              <img v-if="players[i].photo" :src="players[i].photo" alt="" class="final-photo-img" />
            </div>
            <div class="final-name">{{ players[i].name || ('Joueur ' + (i+1)) }}</div>
            <div class="final-pos">Poste {{ pos.name }}</div>
          </div>
        </div>
      </div>

      <div class="anim-layer">
        <div
          v-for="(p, i) in players"
          :key="i"
          :ref="el => cardRefs[i] = el"
          class="anim-card"
        >
          <div class="big-photo" :style="photoStyle(p.photo)"></div>
          <div class="big-body">
            <div class="big-name">{{ p.name || ('Joueur ' + (i+1)) }}</div>
            <div class="big-meta">Poste {{ slotPositions[i].name }} • #{{ p.number || '--' }}</div>

            <div class="stats-panel" :ref="el => statsRefs[i] = el">
              <div class="stat"><span class="stat-label">PTS</span> <span class="stat-value">{{ p.stats?.pts ?? randomStat(10,28) }}</span></div>
              <div class="stat"><span class="stat-label">REB</span> <span class="stat-value">{{ p.stats?.reb ?? randomStat(3,14) }}</span></div>
              <div class="stat"><span class="stat-label">AST</span> <span class="stat-value">{{ p.stats?.ast ?? randomStat(2,12) }}</span></div>
              <div class="stat small"><span class="stat-label">EFF</span> <span class="stat-value small-val">{{ p.stats?.eff ?? randomStat(5,28) }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap } from 'gsap'

const root = ref(null)
const cardRefs = []
const statsRefs = []
const slotRefs = []

const players = reactive([
  { name: '', number: '', photo: '', stats: null },
  { name: '', number: '', photo: '', stats: null },
  { name: '', number: '', photo: '', stats: null },
  { name: '', number: '', photo: '', stats: null },
  { name: '', number: '', photo: '', stats: null }
])

const revealed = reactive(new Array(players.length).fill(false))

const slotPositions = [
  { name: 'PG' },
  { name: 'SG' },
  { name: 'SF' },
  { name: 'PF' },
  { name: 'C' }
]

let timeline = null
let timers = []
let settings = { stagger: 900, statsDuration: 720, moveDuration: 800 }

const theme = ref('red')
const bgUrl = ref('')


const rootStyle = computed(() => {
  // si on a une image, priorité à l'image de fond
  if (bgUrl.value) {
    return {
      backgroundImage: `url('${bgUrl.value}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
  // sinon retourne un background inline selon le thème (évite que la classe CSS masque tout)
  if (theme.value === 'red') {
    return { background: 'linear-gradient(180deg, #c9181e 0%, #ff3b3b 38%, rgba(7,7,7,0.35) 100%)' }
  }
  // thème bleu par défaut
  return { background: 'linear-gradient(180deg, #07121a 0%, #0b1720 100%)' }
})

function randomStat(min=5, max=20) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function photoStyle(url) {
  const bg = url ? `url('${url}')` : `linear-gradient(135deg,#1e7fe0,#8fc7ff)`
  return { backgroundImage: bg, backgroundSize: 'cover', backgroundPosition: 'center' }
}

function loadPlayersFromStorage(){
  try {
    const raw = sessionStorage.getItem('tipoff_players')
    if (!raw) return
    const arr = JSON.parse(raw)
    for (let i=0;i<players.length;i++){
      if (!arr[i]) continue
      players[i].name = arr[i].name || players[i].name
      players[i].number = arr[i].number || players[i].number
      players[i].photo = arr[i].photo || players[i].photo
      if (arr[i].stats) players[i].stats = arr[i].stats
    }
  } catch {}
}
function loadSettings(){
  try {
    const raw = sessionStorage.getItem('tipoff_settings')
    if (!raw) {
      console.debug('tipoff_settings absent')
      return
    }
    const s = JSON.parse(raw)
    settings.stagger = s.stagger ?? settings.stagger
    settings.statsDuration = s.statsDuration ?? settings.statsDuration
    settings.moveDuration = s.moveDuration ?? settings.moveDuration
    theme.value = s.theme ?? theme.value

    const candidate = s.background ?? ''
    if (candidate) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        bgUrl.value = candidate
        console.debug('background loaded', candidate)
      }
      img.onerror = (e) => {
        console.warn('background failed to load (hotlink/CORS?):', candidate, e)
        bgUrl.value = '' // fallback → utilise le dégradé du thème
      }
      img.src = candidate
    } else {
      bgUrl.value = bgUrl.value
    }

    console.debug('TipoffLive loaded settings', { theme: theme.value, background: bgUrl.value })
  } catch (err) {
    console.error('loadSettings error', err)
  }
}

function enterFullscreen(){
  const el = root.value
  if (!el) return
  const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen
  if (fn) try { fn.call(el) } catch (e) {}
}

async function revealFinalCard(slotEl, idx) {
  if (idx == null) return
  revealed[idx] = true
  await nextTick()
  const final = slotEl && slotEl.querySelector('.final-card')
  if (!final) return
  gsap.killTweensOf(final)
  gsap.to(final, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.1)" })
  try {
    slotEl.style.zIndex = '2'
    final.style.zIndex = '2'
  } catch (e) {}
}

function buildAndPlaySequence(){
  if (timeline) timeline.kill()
  timeline = gsap.timeline({ defaults: { ease: "power3.out" } })

  // reset revealed states
  for (let r=0; r<revealed.length; r++) revealed[r] = false

  // prepare elements
  cardRefs.forEach((el, idx) => {
    if (!el) return
    gsap.set(el, { clearProps: "all" })
    el.style.position = 'absolute'
    const w = el.offsetWidth || Math.min(window.innerWidth * 0.6, 900)
    const h = el.offsetHeight || Math.min(window.innerHeight * 0.55, 700)
    el.style.left = `${Math.round(window.innerWidth/2 - w/2)}px`
    el.style.top = `${Math.round(window.innerHeight/2 - h/2)}px`
    el.style.transform = 'none'
    gsap.set(el, { x: 0, y: 0, scale: 1.12, opacity: 0 })
    const stats = statsRefs[idx]
    if (stats) gsap.set(stats, { x: 24, opacity: 0 })
    const slot = slotRefs[idx]
    if (slot) {
      const final = slot.querySelector('.final-card')
      if (final) gsap.set(final, { opacity: 0, scale: 0.96 })
    }
  })

  let cursor = 0
  for (let i=0;i<players.length;i++){
    const card = cardRefs[i]; const stats = statsRefs[i]; const slot = slotRefs[i]
    if (!card || !slot) continue

    timeline.to(card, { duration: 0.52, opacity: 1, scale: 1, ease: "back.out(1.2)" }, cursor)
    timeline.to(stats, { duration: 0.44, x: 0, opacity: 1 }, cursor + 0.06)

    const statsVisibleSec = (settings.statsDuration || 720) / 1000
    timeline.to(stats, { duration: 0.36, x: 18, opacity: 0 }, cursor + statsVisibleSec)

    timeline.add(() => {
      const cardRect = card.getBoundingClientRect()
      const slotRect = slot.getBoundingClientRect()
      const targetScale = Math.min(1, (slotRect.width / cardRect.width) * 0.95)
      const deltaX = (slotRect.left + slotRect.width/2) - (cardRect.left + cardRect.width/2)
      const deltaY = (slotRect.top + slotRect.height/2) - (cardRect.top + cardRect.height/2)
      gsap.to(card, { duration: (settings.moveDuration || 800)/1000, x: deltaX, y: deltaY, scale: targetScale, ease: "power2.inOut" })
      const onComplete = () => {
        revealFinalCard(slot, i)
        gsap.to(card, { opacity: 0, duration: 0.28 })
      }
      const t = setTimeout(onComplete, (settings.moveDuration || 800) + 80)
      timers.push(t)
    }, cursor + statsVisibleSec + 0.06)

    const totalSec = 0.52 + statsVisibleSec + ((settings.moveDuration || 800)/1000) + 0.28
    cursor += totalSec
  }

  timeline.add(() => {
    const finals = slotRefs.map(s => s && s.querySelector('.final-card')).filter(Boolean)
    gsap.fromTo(finals, { scale: 0.98 }, { scale: 1, duration: 0.6, ease: "elastic.out(1,0.6)", stagger: 0.06 })
  }, "+=0.18")

  timeline.play()
}

function onKeyDown(e){
  const k = e.key?.toLowerCase()
  if (!timeline) return
  if (k === ' ' || k === 'spacebar') {
    e.preventDefault()
    timeline.restart()
  } else if (k === 's') {
    timeline.pause()
  } else if (k === 'r') {
    timeline.resume()
  } else if (k === 'z') {
    if (timeline.reversed()) timeline.play()
    else timeline.reverse()
  }
}

onMounted(async () => {
  loadPlayersFromStorage()
  loadSettings()
  await nextTick()
  for (let i=0;i<players.length;i++){
    if (!cardRefs[i]) cardRefs[i] = null
    if (!slotRefs[i]) slotRefs[i] = null
    if (!statsRefs[i]) statsRefs[i] = null
  }
  enterFullscreen()
  const t = setTimeout(() => buildAndPlaySequence(), 260)
  timers.push(t)
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  timers.forEach(t => clearTimeout(t))
  timers = []
  if (timeline) timeline.kill()
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
:root{
  --dv-red: #c9181e;
  --dv-red-bright: #ff3b3b;
  --dv-blue-start: #1e7fe0;
  --dv-blue-end: #8fc7ff;
  --dv-white: #eaf6ff;
}

/* base root and default (blue) theme */
.live-root { width:100vw; height:100vh; background:transparent; overflow:hidden; display:flex; align-items:center; justify-content:center; color:var(--dv-white); }
.live-root.theme-blue { background: linear-gradient(180deg, #07121a 0%, #0b1720 100%); }
.live-root.theme-red { background: linear-gradient(180deg, var(--dv-red) 0%, var(--dv-red-bright) 38%, rgba(7,7,7,0.35) 100%); }

.court { position:relative; width:100%; height:100%; }
/* base court-bg (pour thème bleu / par défaut) */
.court-bg{
  position:absolute;
  inset:0;
  background: radial-gradient(circle at 50% 35%, rgba(10,40,80,0.12), rgba(8,12,22,0.8)),
              linear-gradient(180deg,#07121a,#071a22);
  filter: contrast(1.02);
  z-index:1;
}

.live-root.theme-red .court-bg {
  background: transparent !important;
  mix-blend-mode: normal;
}

/* slots and final small cards */
.slots{ position:absolute; inset:0; z-index:4; pointer-events:none; display:block; }
.slot{ position:absolute; width:150px; height:200px; left:50%; top:10%; transform:translate(-50%,-50%); }

/* semantic positions */
.slot[data-pos="PG"]{ left:50%; top:18%; transform:translate(-50%,-50%); }
.slot[data-pos="SG"]{ left:78%; top:36%; transform:translate(-50%,-50%); }
.slot[data-pos="SF"]{ left:22%; top:36%; transform:translate(-50%,-50%); }
.slot[data-pos="PF"]{ left:30%; top:68%; transform:translate(-50%,-50%); }
.slot[data-pos="C"] { left:52%; top:76%; transform:translate(-50%,-50%); }

.final-card{
  width:150px; height:200px; border-radius:12px; overflow:hidden;
  background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  display:flex; flex-direction:column; align-items:center; padding-top:10px;
  border:1px solid rgba(255,255,255,0.03); box-shadow: 0 18px 40px rgba(0,0,0,0.5);
  color:var(--dv-white); font-weight:700;
  opacity: 0;
  transform: scale(0.96);
}
.final-photo{ width:86%; height:110px; border-radius:8px; background-size:cover; background-position:center; margin-bottom:8px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
.final-photo-img{ width:100%; height:100%; object-fit:cover; }

/* animated cards */
.anim-layer{ position:absolute; inset:0; z-index:8; pointer-events:none; }

.anim-card{
  width:60vw; max-width:980px; height:56vh; max-height:760px;
  border-radius:14px; overflow:hidden; display:flex; gap:18px; align-items:stretch;
  background:linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02));
  box-shadow: 0 40px 110px rgba(0,0,0,0.8);
  position:absolute;
}

.big-photo{ width:58%; height:100%; background-size:cover; background-position:center; }
.big-body{ padding:28px; display:flex; flex-direction:column; justify-content:center; gap:8px; flex:1; }
.big-name{ font-size:3.2rem; font-weight:900; color:#fff; line-height:1; }
.big-meta{ font-size:1.05rem; color:#cfe8ff; }

.stats-panel{
  position: static;
  margin-top: 12px;
  align-self: flex-end;
  background: linear-gradient(180deg, rgba(2,20,40,0.6), rgba(1,10,25,0.55));
  padding: 18px 20px;
  border-radius:12px;
  color:#dff2ff;
  min-width:220px;
  box-shadow: 0 18px 42px rgba(0,0,0,0.6);
  opacity:1;
  transform: none;
}
.stat{ display:flex; justify-content:space-between; gap:12px; padding:6px 0; font-weight:800; font-size:1.15rem; }
.stat .stat-label{ color:#9fbfdc; font-weight:700; margin-right:8px; }
.stat .stat-value{ color:#fff; font-weight:900; font-size:1.25rem; }
.stat.small{ font-size:1rem; opacity:0.95 }
.small-val{ font-size:1.05rem; }

@media (max-width:1100px){
  .stats-panel{ display:none; }
  .anim-card{ width:90vw; height:60vh; }
  .big-name{ font-size:2.2rem; }
  .slot{ width:120px; height:160px; }
  .final-card{ width:120px; height:160px; }
  .final-photo{ height:90px; }
}
</style>