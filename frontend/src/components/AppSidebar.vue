<script setup>
const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Miembros', to: '/miembros' },
  { label: 'Sobres', to: '/sobres' },
  { label: 'Ofrendas', to: '/ofrendas' },
  { label: 'Transferencias', to: '/transferencias' },
  { label: 'Reportes', to: '/reportes' },
]
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">D</div>
      <div>
        <strong>DIEZMAPP</strong>
        <span>Administracion</span>
      </div>
    </div>

    <nav class="nav-list" aria-label="Navegacion principal">
      <RouterLink v-for="item in navItems" :key="item.to" class="nav-link" :to="item.to">
        {{ item.label }}
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

.brand strong,
.brand span {
  display: block;
}

.brand strong {
  font-size: 16px;
  letter-spacing: 0;
}

.brand span {
  color: var(--color-sidebar-muted);
  font-size: 13px;
  font-weight: 700;
}

.nav-list {
  display: grid;
  gap: 6px;
  margin-top: 22px;
}

.nav-link {
  border-radius: 7px;
  color: #d1d5db;
  padding: 11px 12px;
  font-weight: 800;
  transition:
    background 0.16s ease,
    color 0.16s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.1);
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
