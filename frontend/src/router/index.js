import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import DashboardView from '@/views/DashboardView.vue'
import MiembrosView from '@/views/MiembrosView.vue'
import OfrendasView from '@/views/OfrendasView.vue'
import ReportesView from '@/views/ReportesView.vue'
import SobresView from '@/views/SobresView.vue'
import TransferenciasView from '@/views/TransferenciasView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: '', name: 'dashboard', component: DashboardView },
        { path: 'miembros', name: 'miembros', component: MiembrosView },
        { path: 'sobres', name: 'sobres', component: SobresView },
        { path: 'ofrendas', name: 'ofrendas', component: OfrendasView },
        { path: 'transferencias', name: 'transferencias', component: TransferenciasView },
        { path: 'reportes', name: 'reportes', component: ReportesView },
      ],
    },
  ],
})

export default router
