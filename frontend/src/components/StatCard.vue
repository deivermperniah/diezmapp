<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  detail: { type: String, default: '' },
})
</script>

<template>
  <article class="stat-card">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
    <small v-if="detail">{{ detail }}</small>
  </article>
</template>

<style scoped>
.stat-card {
  display: grid;
  min-height: 132px;
  align-content: space-between;
  gap: 14px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: 18px;
  box-shadow: var(--shadow-sm);
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
