<template>
  <transition name="fade-in">
    <div class="resume-fin">
      <h2>Les rôles ont été distribués !</h2>
      <ul class="liste-joueurs">
        <li v-for="(player, idx) in players" :key="idx" class="resume-player">
          <i :class="roles[idx].icon" class="role-icon"></i>
          <span class="player-name">{{ player }}</span>
          <span class="role-name">— {{ roles[idx].nom }}</span>
        </li>
      </ul>
      <p class="message-group">
        C’est parti pour la partie ! Le maître du jeu reprend la main pour mener l’aventure.
      </p>
      <button @click="$emit('startParty')">Commencer la partie officielle</button>

<button @click="$emit('restartGame')">Nouvelle partie</button>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  players: { type: Array, required: true },
  roles: { type: Array, required: true }
})

const emit = defineEmits(['restartGame'])

function relancer() {
  emit('restartGame')
}
</script>

<style scoped>
.resume-fin {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f5fafc;
  border-radius: 20px;
  box-shadow: 0 2px 14px #3a0ca345;
  padding: 5vh 3vw;
  margin: 3vh auto;
  max-width: 420px;
}
.liste-joueurs {
  list-style: none;
  padding: 0;
  margin: 1.2em 0 1.2em 0;
  width: 100%;
}
.resume-player {
  display: flex;
  align-items: center;
  margin: 0.7em 0;
  font-size: 1.15rem;
}
.role-icon {
  margin-right: 0.6em;
  font-size: 1.4rem;
  color: #12c2e9;
}
.player-name {
  font-weight: bold;
  margin-right: 0.4em;
}
.role-name {
  color: #444;
}
.message-group {
  margin: 1.3em 0 0.7em 0;
  color: #130f40;
}
button {
  background: #43e97b;
  padding: 0.7em 2em;
  border: none;
  border-radius: 18px;
  color: #222;
  font-size: 1.12rem;
  font-weight: bold;
  margin-top: 1em;
  box-shadow: 0 2px 8px #12c2e945;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover {
  background: #12c2e9;
  color: #fff;
}
.fade-in-enter-active, .fade-in-leave-active {
  transition: opacity 0.5s;
}
.fade-in-enter-from, .fade-in-leave-to {
  opacity: 0;
}
</style>
