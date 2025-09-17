
<template>
  <section class="home-fullscreen">
    <!-- Logo animé ou statique -->
    <div class="logo-container">
    </div>
    <!-- Slogan et sous-titre animé -->
    <h1 class="title">
      Soirée&nbsp;Jeux
    </h1>
    <p class="subtitle">
      Des jeux de société pour animer toutes vos soirées ! <i class="fas fa-dice"></i>


    </p>
    <!-- Catalogue des jeux -->
    <div class="games-list">
      <div
        v-for="jeu in jeux"
        :key="jeu.id"
        class="game-card"
        @click="jouer(jeu.id)"
      >
        <i :class="jeu.class"></i>
        <div class="game-info">
          <h2>{{ jeu.nom }}</h2>
          <p>{{ jeu.description }}</p>
        </div>
      </div>
    </div>
    <!-- Espace pour Autres (ex: lottie, particules) -->
    <div class="animation-bg"></div>
    <h1 class="title">
      Applications 
    </h1>
    <p class="subtitle">
      Liste des autres applications <i class="fas fa-dice"></i>


    </p>
    <!-- Catalogue des appli -->
    <div class="games-list">
      <div
        v-for="appli in applis"
        :key="appli.id"
        class="game-card"
        @click="jouer(appli.id)"
      >
        <i :class="appli.class"></i>
        <div class="game-info">
          <h2>{{ appli.nom }}</h2>
          <p>{{ appli.description }}</p>
        </div>
      </div>
    </div>
    <!-- Espace pour animation (ex: lottie, particules) -->
    <div class="animation-bg"></div>
  </section>
</template>

<script setup>
  import { useRouter } from 'vue-router';
  const router = useRouter()
const jeux = [
  {
    id: 'loup-garou',
    nom: 'Loup-Garou',
    description: 'Rôles cachés, bluff, suspense. (7–18 joueurs)',
    class: 'fas fa-user-secret game-img'
  },
  {
    id: 'timesup',
    nom: 'Times Up!',
    description: 'Devine et mime en équipe ! (4+ joueurs)',
    class: 'fas fa-user-secret game-img'
  }
  // Ajoute d’autres jeux ici
]
const applis = [
  {
    id: 'denain-voltaire',
    nom: 'Denain Voltaire',
    description: 'Appli pour Denain Voltaire ',
    class: 'fas fa-user-secret game-img'
  }
]

const jouer = (id) => {
  if (id === 'loup-garou') {
    router.push({ name: 'loup-garou' })
  }
  if (id === 'denain-voltaire') {
    router.push({ name: 'denain-voltaire' })
  }
  // else Tu peux gérer d'autres jeux ici
}
</script>

<style scoped>
.home-fullscreen {
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background: linear-gradient(135deg, #38f9d7 40%, #43e97b 100%);
  overflow-x: hidden;
  padding: 0 1rem;
  position: relative;
}
.logo-container {
  margin-top: 6vh;
  margin-bottom: 2vh;
}
.logo {
  max-width: 120px;
  width: 28vw;
  filter: drop-shadow(0 2px 15px #0003);
}
.title {
  font-size: 2.4rem;
  margin: 0.2em 0 0.7em 0;
  color: #120038;
  text-shadow: 0 2px 8px #fff5;
  letter-spacing: 0.03em;
  text-align: center;
}
.subtitle {
  color: #3337a2;
  font-size: 1.1rem;
  margin-bottom: 1.9em;
  text-align: center;
}
.games-list {
  width: 100%;
  max-width: 670px;
  display: flex;
  flex-wrap: wrap;
  gap: 1.3rem;
  justify-content: center;
  z-index: 2;
}
.game-card {
  background: #fff9;
  border-radius: 22px;
  padding: 1.05rem 1.2rem;
  align-items: center;
  display: flex;
  box-shadow: 0 2px 15px #0002;
  min-width: 180px;
  max-width: 245px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.16s cubic-bezier(.47,1.64,.41,.8), box-shadow 0.16s;
  flex-direction: column;
  text-align: center;
}
.game-card:hover {
  transform: scale(1.05) rotate(-1deg);
  box-shadow: 0 7px 26px #53e97b73;
}
.game-img {
  width: 85px;
  border-radius: 14px;
  margin-bottom: 1.1em;
  background: #f4f4fa;
}
.game-info h2 {
  font-size: 1.18rem;
  color: #12c2e9;
  margin: 0 0 0.3rem 0;
}
.game-info p {
  color: #3a0ca3;
  font-size: 1rem;
}

.animation-bg {
  /* Ici tu pourras intégrer lottie/GSAP/particles en fond */
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

/* Responsive mobile paysage et desktop */
@media (max-width: 760px), (orientation: landscape) {
  .home-fullscreen {
    padding-top: 1.3vh;
    justify-content: flex-start;
  }
  .logo {
    max-width: 90px;
    width: 21vw;
  }
  .title {
    font-size: 1.4rem;
  }
  .game-card {
    min-width: 98vw;
    max-width: 97vw;
    margin-bottom: 0.6em;
  }
}
</style>
