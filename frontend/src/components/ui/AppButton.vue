<script setup>
defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
})
</script>

<template>
  <PButton
    :type="type"
    :severity="variant === 'danger' ? 'danger' : variant === 'secondary' ? 'secondary' : undefined"
    :outlined="variant === 'secondary'"
    :size="size === 'sm' ? 'small' : undefined"
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
