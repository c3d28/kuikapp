<template>
  <div class="ticket-container">
    <h1>Ticket à Gratter</h1>
    <div class="ticket" @click="scratchTicket" :class="{ scratched }">
      <span v-if="!scratched">Clique pour gratter !</span>
      <span v-else>
        <span v-if="isWinner">🎉 Gagné !</span>
        <span v-else>😢 Perdu...</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// Remplace par tes appels API MongoDB
const scratched = ref(false)
const isWinner = ref(false)

function scratchTicket() {
  scratched.value = true
}

onMounted(() => {
  // Appel API pour générer et stocker le ticket en base MongoDB
  // Simule aléatoirement pour l'exemple :
  isWinner.value = Math.random() < 0.2 // 20% de chance de gagner
})
</script>

<style scoped>
.ticket-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.ticket {
  width: 320px;
  height: 180px;
  background: repeating-linear-gradient(45deg, #d90429, #fff 20px, #222 40px);
  border-radius: 18px;
  box-shadow: 0 2px 16px #12c2e933;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #fff;
  cursor: pointer;
  margin-top: 2rem;
  position: relative;
  user-select: none;
  transition: filter 0.3s;
}
.ticket.scratched {
  filter: brightness(1.2) blur(0.5px);
  background: #fff;
  color: #d90429;
}
</style>