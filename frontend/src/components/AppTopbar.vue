<template>
  <header class="topbar">
    <div>
      <p class="eyebrow">Sistema de gestion</p>
      <h1>Diezmos y ofrendas</h1>
    </div>
    <div class="topbar-badge">Local</div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  min-height: var(--topbar-height);
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 30px;
  border-bottom: 1px solid var(--color-line);
  background: rgba(246, 247, 251, 0.88);
  backdrop-filter: blur(14px);
}

.eyebrow {
  margin: 0;
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1 {
  margin: 2px 0 0;
  font-size: 19px;
  font-weight: 900;
}

.topbar-badge {
  border: 1px solid var(--color-line);
  border-radius: 999px;
  background: #fff;
  color: var(--color-muted);
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 800;
}

@media (max-width: 860px) {
  .topbar {
    padding: 18px;
  }
}
</style>
