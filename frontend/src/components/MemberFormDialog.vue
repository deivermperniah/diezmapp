<script setup>
import { computed, reactive, watch } from 'vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import FormDialog from '@/components/ui/FormDialog.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  member: { type: Object, default: null },
  iglesias: { type: Array, default: () => [] },
  defaultIglesia: { type: [String, Number], default: '' },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'save'])

const form = reactive({
  nombre: '',
  email: '',
  idIglesia: '',
})

const isEditing = computed(() => Boolean(props.member?.idMiembro))

watch(
  () => [props.visible, props.member, props.defaultIglesia],
  () => {
    form.nombre = props.member?.nombre || ''
    form.email = props.member?.email || ''
    form.idIglesia = props.member?.idIglesia || props.defaultIglesia || ''
  },
  { immediate: true },
)

const submit = () => {
  emit('save', {
    nombre: form.nombre,
    email: form.email || null,
    idIglesia: Number(form.idIglesia),
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
      <AppField id="nombre" label="Nombre">
        <AppInput id="nombre" v-model="form.nombre" required />
      </AppField>

      <AppField id="email" label="Email">
        <AppInput id="email" v-model="form.email" type="email" />
      </AppField>

      <AppField id="iglesia" label="Iglesia">
        <AppSelect
          id="iglesia"
          v-model="form.idIglesia"
          :options="iglesias"
          option-label="nombreIglesia"
          option-value="idIglesia"
        />
      </AppField>
    </form>
  </FormDialog>
</template>

<style scoped>
.dialog-form {
  display: grid;
  gap: 20px;
}
</style>
