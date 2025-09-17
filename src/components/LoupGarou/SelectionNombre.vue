<template>
  <transition name="fade-zoom">
    <div class="step step-nombre" v-if="visible">
      <h2>Combien de joueurs ?</h2>
      <input
        v-model.number="nombre"
        :min="6"
        :max="18"
        type="number"
        class="input-nombre"
      />
      <button :disabled="!isValid" @click="valider">Valider</button>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted,computed } from 'vue'
const nombre = ref(7)
const visible = ref(false)
onMounted(() => visible.value = true)

const emit = defineEmits(['setPlayersCount'])
const isValid = computed(() => nombre.value >= 6 && nombre.value <= 18)
const valider = () => emit('setPlayersCount', nombre.value)
</script>

<style scoped>
.step-nombre {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4vh 2vw;
  background: #fff2;
  border-radius: 18px;
  box-shadow: 0 2px 18px #0002;
}
.input-nombre {
  font-size: 2rem;
  width: 7ch;
  text-align: center;
  margin: 2vh 0;
}
.fade-zoom-enter-active, .fade-zoom-leave-active {
  transition: 0.5s cubic-bezier(.56,2.09,.52,.94);
}
.fade-zoom-enter-from, .fade-zoom-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
