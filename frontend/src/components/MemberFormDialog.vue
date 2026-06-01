<script setup>
import { computed, reactive, watch } from 'vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import FormDialog from '@/components/ui/FormDialog.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  member: { type: Object, default: null },
  defaultIglesia: { type: [String, Number], default: '' },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'save'])

const form = reactive({
  nombre: '',
  apellido: '',
  email: '',
})

const isEditing = computed(() => Boolean(props.member?.idMiembro))

watch(
  () => [props.visible, props.member],
  () => {
    form.nombre = props.member?.nombre || ''
    form.apellido = props.member?.apellido || ''
    form.email = props.member?.email || ''
  },
  { immediate: true },
)

const submit = () => {
  emit('save', {
    nombre: form.nombre,
    apellido: form.apellido,
    email: form.email || null,
    idIglesia: Number(props.defaultIglesia),
  })
}
</script>

<template>
  <FormDialog
    :visible="visible"
    :title="isEditing ? 'Editar miembro' : 'Nuevo miembro'"
    icon="pi pi-user"
    :submit-label="isEditing ? 'Guardar cambios' : 'Crear miembro'"
    :saving="saving"
    @update:visible="$emit('update:visible', $event)"
    @submit="submit"
  >
    <form class="dialog-form" @submit.prevent="submit">
      <div class="name-row">
        <AppField id="nombre" label="Nombre">
          <AppInput id="nombre" v-model="form.nombre" required />
        </AppField>

        <AppField id="apellido" label="Apellido">
          <AppInput id="apellido" v-model="form.apellido" required />
        </AppField>
      </div>

      <AppField id="email" label="Email">
        <AppInput id="email" v-model="form.email" type="email" />
      </AppField>
    </form>
  </FormDialog>
</template>

<style scoped>
.dialog-form {
  display: grid;
  gap: 20px;
}

.name-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
}

@media (max-width: 640px) {
  .name-row {
    grid-template-columns: 1fr;
  }
}
</style>
