<template>
  <transition name="fade-slide">
    <div class="step step-maitre" v-if="visible">
      <i class="fas fa-user-secret fa-3x" style="color:goldenrod;"></i>
      <h2>Confiez l’appareil au Maître du Jeu</h2>
      <p>
        Le Maître du Jeu va attribuer les rôles et diriger la partie.<br>
        Protégez la confidentialité !
      </p>
      <button @click="$emit('startGame')">C’est parti !</button>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const visible = ref(false)
onMounted(() => visible.value = true)
</script>

<style scoped>
.step-maitre {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  background: linear-gradient(120deg, #333 20%, #12c2e9 100%);
  border-radius: 18px;
  box-shadow: 0 2px 18px #0007;
  padding: 5vh 3vw;
}
.fade-slide-enter-active, .fade-slide-leave-active { transition: 0.65s;}
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(40px);}
</style>
