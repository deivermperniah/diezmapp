<script setup>
defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  icon: { type: String, default: '' },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <PButton
    :type="type"
    :severity="variant === 'danger' ? 'danger' : variant === 'secondary' ? 'secondary' : variant === 'success' ? 'success' : undefined"
    :outlined="variant === 'secondary'"
    :size="size === 'sm' ? 'small' : undefined"
    :icon="icon || undefined"
    :label="label || undefined"
    :disabled="disabled"
    class="app-button"
  >
    <slot />
  </PButton>
</template>

<style scoped>
.app-button {
  border-radius: var(--radius-sm);
  font-weight: 800;
}
</style>
