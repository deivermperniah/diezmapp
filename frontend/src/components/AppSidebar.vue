<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const items = computed(() => [
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    to: '/',
    command: () => router.push('/'),
  },
  {
    label: 'Miembros',
    icon: 'pi pi-users',
    to: '/miembros',
    command: () => router.push('/miembros'),
  },
  {
    label: 'Sobres',
    icon: 'pi pi-wallet',
    to: '/sobres',
    command: () => router.push('/sobres'),
  },
  {
    label: 'Reportes',
    icon: 'pi pi-chart-bar',
    to: '/reportes',
    command: () => router.push('/reportes'),
  },
  {
    label: 'Configuración',
    icon: 'pi pi-cog',
    to: '/configuracion',
    command: () => router.push('/configuracion'),
  },
])

const isActive = (to) => route.path === to
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <img class="brand-logo" src="/logo.png" alt="Logo diezmapp" />
      <div>
        <strong>diezmapp</strong>
      </div>
    </div>

    <nav class="nav-menu" aria-label="Navegación principal">
      <button
        v-for="item in items"
        :key="item.label"
        type="button"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
        @click="item.command"
      >
        <i :class="item.icon" aria-hidden="true"></i>
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--sidebar-width);
  padding: 20px 16px;
  background: var(--color-sidebar);
  color: #fff;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-logo {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: #fff;
  object-fit: contain;
  padding: 5px;
}

.brand strong,
.brand span {
  display: block;
}

.brand strong {
  font-size: 15px;
  letter-spacing: 0;
}

.brand span {
  color: var(--color-sidebar-muted);
  font-size: 12px;
  font-weight: 700;
}

.nav-menu {
  display: grid;
  gap: 6px;
  margin-top: 18px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 42px;
  padding: 11px 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #d1d5db;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  text-align: left;
}

.nav-item i {
  width: 18px;
  text-align: center;
}

.nav-item:hover,
.nav-item:focus-visible,
.nav-item.active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

@media (max-width: 860px) {
  .sidebar {
    position: static;
    width: 100%;
  }
}
</style>
