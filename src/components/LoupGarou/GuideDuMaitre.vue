<template>
  <transition name="fade-slide">
    <div class="guide-mj">
      <h2>La partie commence !</h2>
      <p>
        <strong>Remettez l'appareil au Maître du Jeu.</strong><br>
        Voici le rappel des rôles en présence : <br>
        <span v-for="r in rolesSummary" :key="r.nom">
          <i :class="r.icon"></i> {{ r.nom }} ({{ r.count }})&nbsp;|&nbsp;
        </span>
      </p>
      <ul>
        <li>Nuit : Faites fermer les yeux de tous.</li>
        <li>Réveillez les Loups-Garous pour choisir une cible.</li>
        <li>Faites agir la Voyante…</li>
        <li>Au matin : annoncez le résultat, puis place au débat suivi d’un vote.</li>
      </ul>
      <button @click="$emit('suivant')">Commencer la Nuit 1</button>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ roles: Array })
const rolesSummary = computed(() => {
  const counts = {}
  for (const r of props.roles) {
    if (!counts[r.nom]) counts[r.nom] = { ...r, count: 0 }
    counts[r.nom].count++
  }
  return Object.values(counts)
})
</script>
