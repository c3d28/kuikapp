<template>
  <div class="tipoff-root">
    <header class="tipoff-header">
      <h2>Tipoff — Gestion 5 majeurs</h2>
      <div class="tabs">
        <button :class="{active: mode==='manage'}" @click="mode='manage'">Manage</button>
        <button :class="{active: mode==='live'}" @click="mode='live'">Live</button>
      </div>
    </header>

    <section v-if="mode === 'manage'" class="manage">
      <p>Définis les 5 joueurs (poste 1→5). Les changements sont sauvegardés localement (session).</p>

      <div class="timing">
        <h4>Timing / animation</h4>
        <div class="timing-row">
          <label>Stagger (ms)</label>
          <input type="number" v-model.number="settings.stagger" />
        </div>
        <div class="timing-row">
          <label>Stats visible (ms)</label>
          <input type="number" v-model.number="settings.statsDuration" />
        </div>
        <div class="timing-row">
          <label>Move duration (ms)</label>
          <input type="number" v-model.number="settings.moveDuration" />
        </div>
      </div>

      <form @submit.prevent="save">
        <div v-for="(p, i) in players" :key="i" class="player-row">
          <div class="pos">Poste {{ i+1 }}</div>
          <input v-model="p.name" placeholder="Nom du joueur" />
          <input v-model="p.number" placeholder="N°" class="num" />
          <input v-model="p.photo" placeholder="URL image (optionnel)" />
          <button type="button" class="small" @click="resetPlayer(i)">Reset</button>
        </div>

        <div class="manage-actions">
          <button type="button" @click="startLive">Aller en Live</button>
          <button type="button" @click="save">Enregistrer</button>
          <button type="button" @click="loadDefaults">Defaults rapides</button>
          <button type="button" @click="saveSettings">Enregistrer settings</button>
          <button type="button" @click="loadSettings">Charger settings</button>
        </div>
      </form>

      <p class="hint">Raccourcis (globales) : SPACE = relancer, S = stop, R = reprendre, Z = retour arrière</p>
    </section>

    <section v-else class="live">
      <!-- no buttons as requested; live will be on its own route or opened fullscreen -->
      <p>Mode Live (plein écran). La page Live utilise les settings définis ici.</p>
      <div class="manage-actions">
        <router-link class="quick" :to="{ name: 'tipoff-live' }">Ouvrir le Live (plein écran)</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const mode = ref('manage')
const players = reactive([
  { name: '', number: '', photo: '' },
  { name: '', number: '', photo: '' },
  { name: '', number: '', photo: '' },
  { name: '', number: '', photo: '' },
  { name: '', number: '', photo: '' }
])

const defaultSettings = { stagger: 900, statsDuration: 720, moveDuration: 800 }
const settings = reactive(JSON.parse(JSON.stringify(defaultSettings)))

function save(){
  sessionStorage.setItem('tipoff_players', JSON.stringify(players))
  alert('Joueurs enregistrés')
}
function load(){
  try{
    const raw = sessionStorage.getItem('tipoff_players')
    if(!raw) return
    const arr = JSON.parse(raw)
    for(let i=0;i<5;i++){
      players[i].name = arr[i]?.name || players[i].name
      players[i].number = arr[i]?.number || players[i].number
      players[i].photo = arr[i]?.photo || players[i].photo
    }
  } catch {}
}
function loadDefaults(){
  const def = [
    { name: 'Théo L.', number: '4', photo: '' },
    { name: 'Lucas R.', number: '8', photo: '' },
    { name: 'Mika B.', number: '12', photo: '' },
    { name: 'Adrien P.', number: '22', photo: '' },
    { name: 'Olivier M.', number: '7', photo: '' }
  ]
  for (let i = 0; i < 5; i++) Object.assign(players[i], def[i])
  save()
}
function resetPlayer(i){
  players[i].name = ''
  players[i].number = ''
  players[i].photo = ''
}

function startLive(){
  // ensure players + settings saved then navigate to live
  save()
  saveSettings()
  // navigate to live route
  window.location.href = '/tipoff/live'
}

/* settings persistence */
function saveSettings(){
  sessionStorage.setItem('tipoff_settings', JSON.stringify(settings))
  alert('Settings enregistrés')
}
function loadSettings(){
  try{
    const raw = sessionStorage.getItem('tipoff_settings')
    if(!raw) { Object.assign(settings, defaultSettings); return }
    const s = JSON.parse(raw)
    settings.stagger = s.stagger ?? defaultSettings.stagger
    settings.statsDuration = s.statsDuration ?? defaultSettings.statsDuration
    settings.moveDuration = s.moveDuration ?? defaultSettings.moveDuration
    alert('Settings chargés')
  } catch {}
}

onMounted(()=>{
  load()
  loadSettings()
})
</script>

<style scoped>
/* ... keep existing styles, add timing styles */
.timing { margin: 12px 0 16px 0; background: rgba(255,255,255,0.02); padding:10px; border-radius:8px; }
.timing-row { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
.timing-row label { width:150px; color:#9fbfdc }
.timing-row input { flex:1; padding:6px 8px; border-radius:6px; border:0; background:rgba(255,255,255,0.03); color:#eaf6ff; }
.hint { margin-top:8px; color:#9fbfdc; font-size:0.9rem }
</style>