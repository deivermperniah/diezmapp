<template>
  <PToolbar class="page-actions-toolbar">
    <template #end>
      <slot />
    </template>
  </PToolbar>
</template>

<style scoped>
.page-actions-toolbar {
  border: 0;
  background: transparent;
  padding: 0;
}
</style>
