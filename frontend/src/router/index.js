import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import ConfiguracionView from '@/views/ConfiguracionView.vue'
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
        { path: '', name: 'dashboard', component: DashboardView, meta: { title: 'Dashboard' } },
        { path: 'miembros', name: 'miembros', component: MiembrosView, meta: { title: 'Miembros' } },
        { path: 'sobres', name: 'sobres', component: SobresView, meta: { title: 'Sobres' } },
        { path: 'ofrendas', name: 'ofrendas', component: OfrendasView, meta: { title: 'Ofrendas' } },
        {
          path: 'transferencias',
          name: 'transferencias',
          component: TransferenciasView,
          meta: { title: 'Transferencias' },
        },
        { path: 'reportes', name: 'reportes', component: ReportesView, meta: { title: 'Reportes' } },
        {
          path: 'configuracion',
          name: 'configuracion',
          component: ConfiguracionView,
          meta: { title: 'Configuración' },
        },
        { path: 'iglesias', redirect: '/configuracion' },
      ],
    },
  ],
})

export default router
