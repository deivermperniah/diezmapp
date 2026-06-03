import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import ConfiguracionView from '@/views/ConfiguracionView.vue'
import DashboardView from '@/views/DashboardView.vue'
import MiembrosView from '@/views/MiembrosView.vue'
import ReportesView from '@/views/ReportesView.vue'
import SobresView from '@/views/SobresView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: '', name: 'dashboard', component: DashboardView, meta: { title: 'Dashboard', keepAlive: true } },
        { path: 'miembros', name: 'miembros', component: MiembrosView, meta: { title: 'Miembros', keepAlive: true } },
        { path: 'sobres', name: 'sobres', component: SobresView, meta: { title: 'Sobres', keepAlive: true } },
        { path: 'reportes', name: 'reportes', component: ReportesView, meta: { title: 'Reportes', keepAlive: true } },
        {
          path: 'configuracion',
          name: 'configuracion',
          component: ConfiguracionView,
          meta: { title: 'Configuración', keepAlive: true },
        },
        { path: 'iglesias', redirect: '/configuracion' },
      ],
    },
  ],
})

export default router
