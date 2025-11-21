<template>
  <div class="sosiecam-wrapper">
    <div class="banner top-banner">
      <div class="marquee">
        <span>SOSIE CAM - DENAIN VOLTAIRE</span>
      </div>
    </div>
    <div class="sosiecam-panels">
      <div class="left-panel">
        <!-- Zone vide pour la photo de référence -->
      </div>
      <div class="right-panel">
        <video ref="video" autoplay playsinline class="webcam-video"></video>
      </div>
    </div>
    <div class="banner bottom-banner">
      <div class="marquee">
        <span>SOSIE CAM - DENAIN VOLTAIRE</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const video = ref(null)
let stream = null

onMounted(async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true })
    if (video.value) {
      video.value.srcObject = stream
    }
  } catch (err) {
    alert('Impossible d’accéder à la caméra')
  }
})

onUnmounted(() => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
})
</script>

<style scoped>
.sosiecam-wrapper {
  width: 100vw;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.banner {
  width: 100vw;
  height: 60px;
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, #d90429 0%, #fff 50%, #222 100%);
  color: #fff;
  font-weight: bold;
  font-size: 2rem;
  position: relative;
  overflow: hidden;
  z-index: 2;
  border-top: 4px solid #222;
  border-bottom: 4px solid #d90429;
}

.top-banner {
  border-bottom: 4px solid #d90429;
}

.bottom-banner {
  border-top: 4px solid #222;
}

.marquee {
  width: 100vw;
  overflow: hidden;
  white-space: nowrap;
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
}

.marquee span {
  display: inline-block;
  padding-left: 100vw;
  animation: marquee 8s linear infinite;
  color: #fff;
  font-family: 'Arial Black', Arial, sans-serif;
  letter-spacing: 2px;
  text-shadow: 2px 2px 8px #222;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100vw); }
}

.sosiecam-panels {
  flex: 1;
  display: flex;
  width: 100vw;
  height: calc(100vh - 120px); /* 2x 60px pour les bandeaux */
}

.left-panel, .right-panel {
  flex: 1 1 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.left-panel {
  background: #fff;
  border-right: 4px solid #d90429;
}

.right-panel {
  background: #222;
  border-left: 4px solid #d90429;
}

.webcam-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: none;
  background: #222;
}
</style>