<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: 'pi pi-pencil' },
  submitLabel: { type: String, required: true },
  saving: { type: Boolean, default: false },
  width: { type: String, default: 'min(560px, 94vw)' },
})

const emit = defineEmits(['update:visible', 'submit'])

const close = () => emit('update:visible', false)
</script>

<template>
  <PDialog
    :visible="visible"
    modal
    class="form-dialog"
    :style="{ width }"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="dialog-heading">
        <span class="dialog-icon">
          <i :class="icon" aria-hidden="true"></i>
        </span>
        <span>
          <strong>{{ title }}</strong>
          <small v-if="subtitle">{{ subtitle }}</small>
        </span>
      </div>
    </template>

    <div class="dialog-content-shell">
      <slot />
    </div>

    <template #footer>
      <div class="dialog-actions">
        <PButton label="Cancelar" severity="secondary" @click="close" />
        <PButton :label="submitLabel" icon="pi pi-check" :loading="saving" @click="$emit('submit')" />
      </div>
    </template>
  </PDialog>
</template>

<style scoped>
.dialog-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.dialog-icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.dialog-heading strong,
.dialog-heading small {
  display: block;
}

.dialog-heading strong {
  color: var(--color-ink);
  font-size: 18px;
  font-weight: 900;
}

.dialog-heading small {
  margin-top: 2px;
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 700;
}

.dialog-content-shell {
  padding: 2px 0;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
}

.form-dialog :deep(.p-dialog-header) {
  padding: 22px 24px 18px;
}

.form-dialog :deep(.p-dialog-content) {
  padding: 22px 24px 24px;
}

.form-dialog :deep(.p-dialog-footer) {
  padding: 16px 20px 20px;
}

@media (max-width: 560px) {
  .dialog-actions {
    display: grid;
  }

  .dialog-actions :deep(.p-button) {
    width: 100%;
  }
}
</style>
