<template>
  <transition name="reveal">
    <div v-if="!role" class="step step-prenom" key="prenom">
      <p class="pronom">Passer l’appareil à</p>
      <h2>{{ player }}</h2>
      <button @click="revealRole">Voir mon rôle</button>
    </div>
    <div v-else class="step step-role" key="role">
      <h2>{{ role.nom }}</h2>
      <i :class="role.icon" class="role-icone"></i>
      <p class="desc-role">{{ role.description }}</p>
      <button @click="$emit('nextPlayer')">Joueur suivant</button>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ player: String, role: Object })
const role = ref(null)
const revealRole = () => (role.value = props.role)
</script>

<style scoped>
.step-prenom, .step-role { display: flex; flex-direction:column; align-items: center; padding: 4vh 2vw;}
.role-icone { font-size: 2.7rem; margin: 18px 0; color: #12c2e9; }
.desc-role { color: #2b2d4a; margin: 18px 0; font-size: 1.1rem;}
.reveal-enter-active,.reveal-leave-active{ transition:all .5s;}
.reveal-enter-from, .reveal-leave-to{ opacity:0; transform:scale(0.7);}
</style>
