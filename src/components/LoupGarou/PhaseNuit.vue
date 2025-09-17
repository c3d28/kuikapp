<template>
  <transition name="fade-slide">
    <div class="phase-nuit">
      <h2>Nuit {{ numeroNuit }}</h2>
      <ul>
        <li>
          Demandez à <strong>tous les joueurs</strong> de fermer les yeux.
        </li>
        <li>
          <strong>Les Loups-Garous</strong> ouvrent les yeux et désignent une cible.
        </li>
        <li v-if="avecVoyante">
          <strong>La Voyante</strong> ouvre les yeux et peut demander le rôle d’un joueur.
        </li>
        <!-- Ajoute ici d’autres personnages spéciaux si besoin -->
      </ul>
      <button @click="finNuit">Valider et passer au Jour</button>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  numeroNuit: { type: Number, default: 1 }, 
  avecVoyante: { type: Boolean, default: true }
})
const emit = defineEmits(['finNuit'])
function finNuit() {
  emit('finNuit')
}
</script>

<style scoped>
.phase-nuit {
  background: #223;
  color: #fff;
  border-radius: 19px;
  box-shadow: 0 2px 14px #0005;
  padding: 4vh 3vw;
  text-align: left;
  margin: 3vh auto;
  max-width: 400px;
}
ul {
  margin: 1.4em 0 2em 0;
}
button {
  background: #43e97b;
  color: #223;
  font-weight: bold;
  border: none;
  border-radius: 16px;
  padding: 0.9em 2.1em;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background .2s;
}
button:hover {
  background: #12c2e9;
  color: #fff;
}
.fade-slide-enter-active, .fade-slide-leave-active { transition: 0.5s; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(40px);}
</style>
