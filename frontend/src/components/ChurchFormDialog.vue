<script setup>
import { computed, reactive, watch } from 'vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import FormDialog from '@/components/ui/FormDialog.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  church: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'save'])

const form = reactive({
  nombreIglesia: '',
  ciudad: '',
})

const isEditing = computed(() => Boolean(props.church?.idIglesia))

watch(
  () => [props.visible, props.church],
  () => {
    form.nombreIglesia = props.church?.nombreIglesia || ''
    form.ciudad = props.church?.ciudad || ''
  },
  { immediate: true },
)

const submit = () => {
  emit('save', {
    nombreIglesia: form.nombreIglesia,
    ciudad: form.ciudad,
  })
}
</script>

<template>
  <FormDialog
    :visible="visible"
    :title="isEditing ? 'Editar iglesia' : 'Nueva iglesia'"
    icon="pi pi-building"
    :submit-label="isEditing ? 'Guardar cambios' : 'Crear iglesia'"
    :saving="saving"
    @update:visible="$emit('update:visible', $event)"
    @submit="submit"
  >
    <form class="dialog-form" @submit.prevent="submit">
      <AppField id="nombreIglesia" label="Nombre de la iglesia">
        <AppInput id="nombreIglesia" v-model="form.nombreIglesia" required />
      </AppField>

      <AppField id="ciudad" label="Ciudad">
        <AppInput id="ciudad" v-model="form.ciudad" required />
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
