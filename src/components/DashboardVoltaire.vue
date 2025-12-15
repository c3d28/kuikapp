<template>
  <div class="dashboard-root">
    <aside class="sidebar">
      <h2 class="brand">Dashboard Denain</h2>

      <nav class="nav">
        <router-link class="nav-item" to="/denain-voltaire">Sonomètre</router-link>
        <router-link class="nav-item" to="/ticket-gagnant">Ticket Gagnant</router-link>
        <router-link class="nav-item" to="/sosie-cam">Sosie Cam</router-link>
        <router-link class="nav-item" to="/ticket-gagnant-manager">Ticket Gagnant Manager</router-link>
        <router-link class="nav-item" to="/tipoff">Tipoff</router-link>
      </nav>
    </aside>

    <main class="content">
      <header class="content-header">
        <h3>Bienvenue sur le Dashboard Denain</h3>
        <p>Utilise le menu à gauche pour ouvrir chaque application.</p>
      </header>

      <section class="quick-links">
        <h4>Raccourcis</h4>
        <div class="links">
          <router-link to="/sonometre" class="quick">Ouvrir Sonomètre</router-link>
          <router-link to="/ticket-gagnant" class="quick">Ouvrir Ticket Gagnant</router-link>
          <router-link to="/sosie-cam" class="quick">Ouvrir Sosie Cam</router-link>
          <router-link to="/tipoff" class="quick">Ouvrir Tipoff</router-link>
        </div>
      </section>

      <section class="placeholder">
        <p>Zone d'aperçu / widgets (ajoute ici tes composants de monitoring, stats, etc.).</p>
      </section>
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.dashboard-root {
  display: flex;
  height: 100vh;
  background: #0b0f14;
  color: #fff;
  font-family: Arial, sans-serif;
}

.sidebar {
  width: 260px;
  min-width: 200px;
  background: linear-gradient(180deg,#07121a,#0b1f2b);
  padding: 1.5rem;
  box-shadow: 2px 0 18px rgba(0,0,0,0.6);
  box-sizing: border-box;
}

.brand {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  letter-spacing: 0.6px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  color: #cfe8ff;
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  text-decoration: none;
}

.nav-item.router-link-exact-active,
.nav-item:hover {
  background: rgba(255,255,255,0.04);
  color: #fff;
  box-shadow: inset 0 0 10px rgba(0,140,255,0.06);
}

.content {
  flex: 1;
  padding: 2rem;
  overflow: auto;
}

.content-header h3 { margin: 0; }
.content-header p { margin: .4rem 0 1rem 0; color: #9fbfdc; }

.quick-links .links {
  display:flex;
  gap: .6rem;
  flex-wrap:wrap;
  margin-bottom: 1rem;
}

.quick {
  background: linear-gradient(180deg,#0e3a5b,#08314a);
  color: #bfe9ff;
  padding: .5rem .8rem;
  border-radius: 6px;
  text-decoration: none;
}

.placeholder {
  margin-top: 1.2rem;
  padding: 1rem;
  background: rgba(255,255,255,0.02);
  border-radius: 8px;
  color: #b8d9f0;
}
</style>