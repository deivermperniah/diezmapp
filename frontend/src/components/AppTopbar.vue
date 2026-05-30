<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { iglesiaActivaNombre } from '@/services/iglesia-activa.service'

const route = useRoute()
const pageTitle = computed(() => route.meta.title || 'DIEZMAPP')
const showActiveChurch = computed(() => route.name !== 'configuracion')
</script>

<template>
  <header class="topbar">
    <div>
      <h1>{{ pageTitle }}</h1>
    </div>
    <div v-if="showActiveChurch" class="active-church">
      <i class="pi pi-building" aria-hidden="true"></i>
      <span>Iglesia</span>
      <strong>{{ iglesiaActivaNombre || 'Sin seleccionar' }}</strong>
    </div>
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

h1 {
  margin: 0;
  font-size: 19px;
  font-weight: 900;
}

.active-church {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
  margin-left: auto;
  min-height: 36px;
  padding: 6px 11px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #eff6ff;
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 850;
}

.active-church i {
  color: var(--color-primary);
}

.active-church span {
  color: var(--color-primary);
}

.active-church strong {
  overflow: hidden;
  max-width: 260px;
  color: var(--color-primary);
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 860px) {
  .topbar {
    padding: 18px;
  }

  .active-church strong {
    max-width: 160px;
  }
}
</style>
