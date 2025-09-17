import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/components/HomeView.vue'
import DenainVoltaire from '@/components/DenainVoltaire.vue'
import LoupGarou from '@/components/LoupGarou.vue' // Ou `@/views/LoupGarou.vue` selon ta structure
import TheWelcome from '@/components/TheWelcome.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/loup-garou',
    name: 'loup-garou',
    component: LoupGarou
  },
  {
    path: '/denain-voltaire',
    name: 'denain-voltaire',
    component: DenainVoltaire
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
