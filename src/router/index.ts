import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/components/HomeView.vue'
import DenainVoltaire from '@/components/DenainVoltaire.vue'
import LoupGarou from '@/components/LoupGarou.vue'
import DashboardDenain from '@/components/DashboardVoltaire.vue'
import SosieCam from '@/components/SosieCam.vue'
import TicketGagnant from '@/components/TicketGagnant.vue'
import TicketGagnantManager from '@/components/TicketGagnantManager.vue'
import Tipoff from '@/components/Tipoff.vue'
import TipoffLive from '@/components/TipoffLive.vue'


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

  // "dashboard" page renamed to "sonometre" (this is the Denain dashboard)
  {
    path: '/sonometre',
    name: 'sonometre-dashboard',
    component: DashboardDenain
  },

  // actual standalone sonometre app (monitor)
  {
    path: '/denain-voltaire',
    name: 'denain-voltaire',
    component: DenainVoltaire
  },

  {
    path: '/sosie-cam',
    name: 'sosie-cam',
    component: SosieCam
  },
  {
    path: '/ticket-gagnant-manager',
    name: 'ticket-gagnant-manager',
    component: TicketGagnantManager
  },
  {
    path: '/ticket-gagnant',
    name: 'ticket-gagnant',
    component: TicketGagnant
  },

  // new stub for Tipoff (added to dashboard menu)
  {
    path: '/tipoff',
    name: 'tipoff',
    component: Tipoff
  },
  {
    path: '/tipoff/live',
    name: 'tipoff-live',
    component: TipoffLive
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router