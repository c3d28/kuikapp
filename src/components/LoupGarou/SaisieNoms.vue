<template>
  <transition-group name="fade-list">
    <div class="step step-noms" v-if="visible">
      <h2>Entrez les prénoms des joueurs</h2>
      <div v-for="(j, idx) in joueurs" :key="idx" class="player-field">
        <input
          v-model="joueurs[idx]"
          :placeholder="`Joueur ${idx + 1}`"
          class="input-nom"
        />
      </div>
      <button :disabled="!allValid" @click="valider">Valider</button>
    </div>
  </transition-group>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
const props = defineProps({ count: Number })
const joueurs = ref(Array(props.count).fill(''))
const visible = ref(false)
onMounted(() => visible.value = true)
const emit = defineEmits(['submitNames'])
const allValid = computed(() => joueurs.value.every(n => n.length > 0))
const valider = () => emit('submitNames', joueurs.value)
</script>

<style scoped>
.step-noms { padding: 3vh 2vw; }
.input-nom {
  font-size: 1.25rem;
  margin: 0.6rem 0;
  width: 80vw;
  max-width: 340px;
  padding: 0.6rem;
  border-radius: 9px;
  border: 1px solid #12c2e9;
}
.player-field { margin-bottom: 0.6rem; }
.fade-list-enter-active, .fade-list-leave-active { transition: all 0.36s; }
.fade-list-enter-from, .fade-list-leave-to { opacity: 0; transform: translateY(15px);}
</style>
