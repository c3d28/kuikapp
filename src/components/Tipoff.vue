<template>
  <div class="tipoff-root container">
    <header class="tipoff-header py-5">
      <div class="level">
        <div class="level-left">
          <div>
            <h2 class="title is-4">Tipoff — Gestion 5 majeurs</h2>
            <p class="subtitle is-6">Définis les joueurs et le thème live</p>
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

      <div class="appearance box">
        <h4 class="title is-6">Apparence Live</h4>
        <div class="field">
          <label class="label">Thème</label>
          <div class="control">
            <div class="select">
              <select v-model="settings.theme">
                <option value="blue">Bleu (par défaut)</option>
                <option value="red">Rouge</option>
              </select>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">Image de fond (URL)</label>
          <div class="control">
            <input class="input" placeholder="https://..." v-model="settings.background" />
          </div>
          <p class="hint">Laisser vide pour utiliser le dégradé du thème.</p>
        </div>

        <div class="buttons mt-3">
          <button class="button is-primary" @click="saveSettings">Enregistrer le thème</button>
          <button class="button is-light" @click="loadSettings">Restaurer</button>
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
import { useRouter } from 'vue-router'

const router = useRouter()
const mode = ref('manage')
// agrandi à 5 lignes de joueurs
const players = reactive([
  { name: '', number: '', photo: '' },
  { name: '', number: '', photo: '' },
  { name: '', number: '', photo: '' },
  { name: '', number: '', photo: '' },
  { name: '', number: '', photo: '' }
])

const defaultSettings = { stagger: 900, statsDuration: 720, moveDuration: 800, theme: 'blue', background: '' }
const settings = reactive(JSON.parse(JSON.stringify(defaultSettings)))

function save(){
  try { sessionStorage.setItem('tipoff_players', JSON.stringify(players)) } catch {}
}
function load(){
  try {
    const raw = sessionStorage.getItem('tipoff_players')
    if (!raw) return
    const arr = JSON.parse(raw)
    for (let i=0;i<players.length;i++){
      if (!arr[i]) continue
      players[i].name = arr[i].name || players[i].name
      players[i].number = arr[i].number || players[i].number
      players[i].photo = arr[i].photo || players[i].photo
    }
  } catch {}
}

// génère un prénom aléatoire simple
function getRandomName(){
  const sample = ['Alpha','Bravo','Charlie','Delta','Echo','Foxtrot','Goliath','Hector','Icare','Jules']
  return sample[Math.floor(Math.random()*sample.length)]
}
function loadDefaults(){
  for (let i=0;i<players.length;i++){
    players[i].name = getRandomName()
    players[i].number = ''
    players[i].photo = ''
  }
}
function resetPlayer(i){
  players[i].name = ''
  players[i].number = ''
  players[i].photo = ''
}

function startLive(){
  save()
  saveSettings()
  router.push({ name: 'tipoff-live' })
}

/* settings persistence */
function saveSettings(){
  try { sessionStorage.setItem('tipoff_settings', JSON.stringify(settings)) } catch {}
}
function loadSettings(){
  try {
    const raw = sessionStorage.getItem('tipoff_settings')
    if (!raw) return
    const s = JSON.parse(raw)
    settings.stagger = s.stagger ?? settings.stagger
    settings.statsDuration = s.statsDuration ?? settings.statsDuration
    settings.moveDuration = s.moveDuration ?? settings.moveDuration
    settings.theme = s.theme ?? settings.theme
    settings.background = s.background ?? settings.background
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