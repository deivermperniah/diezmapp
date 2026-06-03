import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const ConfiguracionView = () => import('@/views/ConfiguracionView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const MiembrosView = () => import('@/views/MiembrosView.vue')
const ReportesView = () => import('@/views/ReportesView.vue')
const SobresView = () => import('@/views/SobresView.vue')

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
