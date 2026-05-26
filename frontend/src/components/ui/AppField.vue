<script setup>
defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
})
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <slot />
  </div>
</template>
