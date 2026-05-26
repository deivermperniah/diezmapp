<script setup>
defineProps({
  title: { type: String, required: true },
})
</script>

<template>
  <PCard class="app-panel">
    <template #title>
      <div class="app-panel-header">
        <h3>{{ title }}</h3>
        <slot name="actions" />
      </div>
    </template>
    <template #content>
      <slot />
    </template>
  </PCard>
</template>

<style scoped>
.app-panel {
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.app-panel :deep(.p-card-body) {
  padding: 0;
}

.app-panel :deep(.p-card-title) {
  margin: 0;
}

.app-panel :deep(.p-card-content) {
  padding: 0;
}

.app-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-line);
}

h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
}
</style>
