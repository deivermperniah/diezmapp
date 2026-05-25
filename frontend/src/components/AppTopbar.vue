<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => route.meta.title || 'DIEZMAPP')
</script>

<template>
  <header class="topbar">
    <div>
      <h1>{{ pageTitle }}</h1>
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

@media (max-width: 860px) {
  .topbar {
    padding: 18px;
  }
}
</style>
