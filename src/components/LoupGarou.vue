<template>
  <div class="loupgarou-jeu">
    <SelectionNombre v-if="step === 1" @setPlayersCount="onSetCount" />
    <SaisieNoms v-else-if="step === 2" :count="playersCount" @submitNames="onSubmitNames" />
    <MessageMaitre
      v-else-if="step === 3"
      :variante="playersCount === 6"
      @startGame="startGame"
    />
<DecouverteRole
  v-if="step === 4"
  :key="currentIndex"
  :player="players[currentIndex]"
  :role="roles[currentIndex]"
  :last="currentIndex === players.length - 1"
  @nextPlayer="nextPlayer"
/>

  <ResumeFin v-if="step === 5" :players="players" :roles="roles" @restartGame="restartGame" @startParty="startParty" />
  <GuideDuMaitre v-else-if="step === 6" @suivant="démarrerNuit" :players="players" :roles="roles" />
<PhaseNuit 
  v-if="step === 7" 
  :numeroNuit="numeroNuit"
  :avecVoyante="roles.some(r => r.nom === 'Voyante')" 
  @finNuit="allerAuJour" 
/>


  </div>
</template>

<script setup>
import { ref } from 'vue'
import SelectionNombre from './LoupGarou/SelectionNombre.vue'
import SaisieNoms from './LoupGarou/SaisieNoms.vue'
import MessageMaitre from './LoupGarou/MessageMaitre.vue'
import DecouverteRole from './LoupGarou/DecouverteRole.vue'
import ResumeFin from './LoupGarou/ResumeFin.vue'
import GuideDuMaitre from './LoupGarou/GuideDuMaitre.vue'
import PhaseNuit from './LoupGarou/PhaseNuit.vue'

const step = ref(1)
const playersCount = ref(6)
const players = ref([])
const roles = ref([])
const currentIndex = ref(0)

// Attribution des rôles selon le nombre de joueurs
function assignRoles(count) {
  if (count === 6) {
    return [
      { nom: 'Loup-Garou', icon: 'fas fa-user-secret', description: 'Vous éliminez ensemble chaque nuit un villageois.' },
      { nom: 'Loup-Garou', icon: 'fas fa-user-secret', description: 'Vous éliminez ensemble chaque nuit un villageois.' },
      { nom: 'Voyante', icon: 'fas fa-eye', description: 'Chaque nuit, découvrez le rôle d\'un joueur de votre choix.' },
      { nom: 'Villageois', icon: 'fas fa-user', description: 'Votre objectif : démasquer et éliminer les Loups-Garous.' },
      { nom: 'Villageois', icon: 'fas fa-user', description: 'Votre objectif : démasquer et éliminer les Loups-Garous.' },
      { nom: 'Villageois', icon: 'fas fa-user', description: 'Votre objectif : démasquer et éliminer les Loups-Garous.' }
    ].sort(() => Math.random() - 0.5)
  }
  // Pour 7+ joueurs (à enrichir selon tes variantes désirées)
  // Exemple classique : 2 ou 3 loups selon effectif ; voyante ; simple villageois ; cupidon...
  const base = [
    { nom: 'Loup-Garou', icon: 'fas fa-user-secret', description: 'Vous éliminez chaque nuit un villageois.' },
    { nom: 'Loup-Garou', icon: 'fas fa-user-secret', description: 'Vous éliminez chaque nuit un villageois.' },
    { nom: 'Voyante', icon: 'fas fa-eye', description: 'Chaque nuit, découvrez le rôle d\'un joueur.' },
  ]
  while (base.length < count) base.push({ nom: 'Villageois', icon: 'fas fa-user', description: 'Confiance ou suspicion ? À vous de survivre !' })
  return base.sort(() => Math.random() - 0.5)
}

function onSetCount(count) {
  playersCount.value = count
  step.value = 2
}
function onSubmitNames(noms) {
  players.value = noms
  roles.value = assignRoles(noms.length)
  step.value = 3
}
function startGame() {
  currentIndex.value = 0
  step.value = 4
}
function restartGame() {
  step.value = 1
  // Réinitialise players, roles, etc.
}
function startParty() {
  step.value = 6  // 
}
function nextPlayer() {
  if (currentIndex.value < players.value.length - 1) {
    currentIndex.value++
  } else {
    step.value = 5
  }
}
function démarrerNuit() {
  step.value = 7
}
function allerAuJour() {
  step.value = 8 // ou le numéro d’étape pour la phase Jour
}
</script>
