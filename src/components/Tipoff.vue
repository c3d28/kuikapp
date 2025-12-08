<template>
  <div class="tipoff-root container">
    <header class="tipoff-header py-5">
      <div class="level">
        <div class="level-left">
          <div>
            <h2 class="title is-4">Tipoff — Gestion 5 majeurs</h2>
            <p class="subtitle is-6">Définis les 5 joueurs et les timings d'animation</p>
          </div>
        </div>
        <div class="level-right">
          <div class="tabs is-toggle is-toggle-rounded">
            <ul>
              <li :class="{ 'is-active': mode==='manage' }"><a @click="mode='manage'">Manage</a></li>
              <li :class="{ 'is-active': mode==='live' }"><a @click="mode='live'">Live</a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <section v-if="mode === 'manage'" class="manage box">
      <p class="mb-4">Les changements sont sauvegardés localement (session).</p>

      <div class="timing box">
        <h4 class="title is-6">Timing / animation</h4>
        <div class="columns is-mobile is-multiline">
          <div class="column is-4">Stagger (ms)</div>
          <div class="column is-8"><input class="input" type="number" v-model.number="settings.stagger" /></div>

          <div class="column is-4">Stats visible (ms)</div>
          <div class="column is-8"><input class="input" type="number" v-model.number="settings.statsDuration" /></div>

          <div class="column is-4">Move duration (ms)</div>
          <div class="column is-8"><input class="input" type="number" v-model.number="settings.moveDuration" /></div>
        </div>
      </div>

      <form @submit.prevent="save">
        <div v-for="(p, i) in players" :key="i" class="player-row box mb-3">
          <div class="columns is-vcentered is-mobile">
            <div class="column is-narrow">
              <div class="tag is-dark is-medium">Poste {{ i+1 }}</div>
            </div>

            <div class="column">
              <input class="input" v-model="p.name" placeholder="Nom du joueur" />
            </div>

            <div class="column is-narrow" style="max-width:90px">
              <input class="input" v-model="p.number" placeholder="N°" />
            </div>

            <div class="column">
              <input class="input" v-model="p.photo" placeholder="URL image (optionnel)" />
            </div>

            <div class="column is-narrow">
              <button type="button" class="button is-small is-light" @click="resetPlayer(i)">Reset</button>
            </div>
          </div>
        </div>

        <div class="manage-actions buttons">
          <button type="button" class="button is-primary" @click="startLive">Aller en Live</button>
          <button type="button" class="button is-info" @click="save">Enregistrer</button>
          <button type="button" class="button is-light" @click="loadDefaults">Defaults rapides</button>
          <button type="button" class="button" @click="saveSettings">Enregistrer settings</button>
          <button type="button" class="button" @click="loadSettings">Charger settings</button>
        </div>
      </form>

      <p class="hint mt-4">Raccourcis : SPACE = relancer, S = stop, R = reprendre, Z = retour arrière</p>
    </section>

    <section v-else class="live box">
      <p>Mode Live (plein écran). La page Live utilise les settings définis ici.</p>
      <div class="manage-actions mt-3">
        <router-link class="button is-primary" :to="{ name: 'tipoff-live' }">Ouvrir le Live (plein écran)</router-link>
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
.tipoff-root { padding-top: 18px; padding-bottom: 28px; color: #eaf6ff; }
.tipoff-header { border-bottom: 1px solid rgba(255,255,255,0.04); }
.player-row .input { background: rgba(255,255,255,0.02); color: #eaf6ff; }
.box { background: linear-gradient(180deg, #07121a 0%, #0b1720 100%); border: 1px solid rgba(255,255,255,0.03); }
.hint { color:#9fbfdc; font-size:0.9rem; }
.tabs a { color:#eaf6ff; }
.button.is-primary { background-color:#c9181e; border-color: transparent; color:#fff; }
</style>