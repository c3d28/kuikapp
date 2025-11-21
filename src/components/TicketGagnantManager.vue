<template>
  <div class="manager-container">
    <h1>Gestion des Tickets à Gratter</h1>
    <button @click="showPopup = true">Créer un événement</button>
    <div v-if="showPopup" class="popup">
      <h2>Nouvel événement</h2>
      <input v-model="newEvent.name" placeholder="Nom de l'événement" />
      <input v-model.number="newEvent.ticketCount" type="number" min="1" placeholder="Nombre de tickets" />
      <input v-model.number="newEvent.winnerCount" type="number" min="1" placeholder="Nombre de tickets gagnants" />
      <button @click="createEvent">Créer</button>
      <button @click="showPopup = false">Annuler</button>
    </div>
    <ul>
      <li v-for="event in events" :key="event._id">
        <strong>{{ event.name }}</strong> - {{ event.ticketCount }} tickets, {{ event.winnerCount }} gagnants
        <!-- Ajoute ici la gestion des tickets si besoin -->
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// Remplace par tes appels API MongoDB
const events = ref([])
const showPopup = ref(false)
const newEvent = ref({ name: '', ticketCount: 10, winnerCount: 1 })

function createEvent() {
  // Appel API pour créer l'événement en base MongoDB
  events.value.push({ ...newEvent.value, _id: Date.now() })
  showPopup.value = false
  newEvent.value = { name: '', ticketCount: 10, winnerCount: 1 }
}

// onMounted(() => { ...fetch events depuis MongoDB... })
</script>

<style scoped>
.manager-container { padding: 2rem; }
.popup {
  background: #fff;
  border: 2px solid #12c2e9;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}
</style>