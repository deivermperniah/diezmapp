<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  detail: { type: String, default: '' },
  icon: { type: String, default: 'pi pi-chart-line' },
  tone: { type: String, default: 'blue' },
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <PCard class="stat-card" :class="`tone-${tone}`">
    <template #content>
      <div class="stat-head">
        <span>{{ label }}</span>
        <i :class="icon" />
      </div>
      <PSkeleton v-if="loading" width="60%" height="2rem" />
      <strong v-else>{{ value }}</strong>
      <small v-if="detail">{{ detail }}</small>
    </template>
  </PCard>
</template>

<style scoped>
.stat-card {
  min-height: 126px;
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

.stat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

span {
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 800;
}

strong {
  color: var(--color-ink);
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0;
}

i {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 8px;
  background: var(--stat-soft);
  color: var(--stat-color);
}

small {
  color: var(--color-muted);
  font-weight: 700;
}

.tone-blue {
  --stat-soft: #e8eeff;
  --stat-color: #275efe;
}

.tone-green {
  --stat-soft: #e6f6ef;
  --stat-color: #16835f;
}

.tone-gray {
  --stat-soft: #eef2f7;
  --stat-color: #475569;
}
</style>
