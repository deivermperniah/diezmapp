<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  detail: { type: String, default: '' },
})
</script>

<template>
  <PCard class="stat-card">
    <template #content>
      <span>{{ label }}</span>
      <strong>{{ value }}</strong>
      <small v-if="detail">{{ detail }}</small>
    </template>
  </PCard>
</template>

<style scoped>
.stat-card {
  min-height: 132px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.stat-card :deep(.p-card-body),
.stat-card :deep(.p-card-content) {
  height: 100%;
  padding: 0;
}

.stat-card :deep(.p-card-content) {
  display: grid;
  align-content: space-between;
  gap: 14px;
  padding: 18px;
}

span {
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 800;
}

strong {
  color: var(--color-ink);
  font-size: 31px;
  font-weight: 900;
  letter-spacing: 0;
}

small {
  color: var(--color-muted);
  font-weight: 700;
}
</style>
