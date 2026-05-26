<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const reportsOpen = ref(true)

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Miembros', to: '/miembros' },
  { label: 'Sobres', to: '/sobres' },
]

const reportItems = [
  { label: 'Semanal', to: '/reportes/semanal' },
  { label: 'Mensual', to: '/reportes/mensual' },
]

const bottomItems = [{ label: 'Configuración', to: '/configuracion' }]

const isReportsActive = computed(() => route.path.startsWith('/reportes'))
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">D</div>
      <div>
        <strong>diezmapp</strong>
      </div>
    </div>

    <nav class="nav-list" aria-label="Navegacion principal">
      <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" custom v-slot="{ href, navigate, isActive, isExactActive }">
        <a
          :href="href"
          class="nav-link"
          :class="{ active: item.to === '/' ? isExactActive : isActive }"
          @click="navigate"
        >
          {{ item.label }}
        </a>
      </RouterLink>

      <div class="nav-group">
        <button
          class="nav-link nav-toggle"
          :class="{ active: isReportsActive }"
          type="button"
          :aria-expanded="reportsOpen"
          @click="reportsOpen = !reportsOpen"
        >
          <span>Reportes</span>
          <span class="chevron" aria-hidden="true">{{ reportsOpen ? '-' : '+' }}</span>
        </button>

        <div v-if="reportsOpen" class="nav-sublist">
          <RouterLink v-for="item in reportItems" :key="item.to" :to="item.to" custom v-slot="{ href, navigate, isActive }">
            <a
              :href="href"
              class="nav-sublink"
              :class="{ active: isActive }"
              @click="navigate"
            >
              {{ item.label }}
            </a>
          </RouterLink>
        </div>
      </div>

      <RouterLink v-for="item in bottomItems" :key="item.to" :to="item.to" custom v-slot="{ href, navigate, isActive }">
        <a
          :href="href"
          class="nav-link"
          :class="{ active: isActive }"
          @click="navigate"
        >
          {{ item.label }}
        </a>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--sidebar-width);
  padding: 22px 18px;
  background: var(--color-sidebar);
  color: #fff;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 6px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 8px;
  background: var(--color-primary);
  font-size: 20px;
  font-weight: 900;
}

.brand strong {
  display: block;
}

.brand strong {
  font-size: 16px;
  letter-spacing: 0;
}

.nav-list {
  display: grid;
  gap: 6px;
  margin-top: 22px;
}

.nav-link {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border-radius: 7px;
  border: 0;
  background: transparent;
  color: #d1d5db;
  padding: 11px 12px;
  text-align: left;
  font-weight: 800;
  transition:
    background 0.16s ease,
    color 0.16s ease;
}

.nav-link:hover,
.nav-link.active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-group {
  display: grid;
  gap: 6px;
}

.nav-toggle {
  appearance: none;
}

.chevron {
  font-size: 14px;
  line-height: 1;
}

.nav-sublist {
  display: grid;
  gap: 4px;
  padding-left: 12px;
}

.nav-sublink {
  display: block;
  border-radius: 7px;
  color: #cbd5e1;
  padding: 9px 12px;
  font-size: 14px;
  font-weight: 750;
}

.nav-sublink:hover,
.nav-sublink.active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

@media (max-width: 860px) {
  .sidebar {
    position: static;
    width: 100%;
  }

  .nav-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
