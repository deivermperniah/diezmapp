<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import DataTable from '@/components/DataTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import PageActions from '@/components/ui/PageActions.vue'
import {
  createIglesia,
  deleteIglesia,
  getIglesias,
  updateIglesia,
} from '@/services/catalogos.service'
import {
  getIglesiaActivaId,
  setIglesiaActivaId,
} from '@/services/iglesia-activa.service'

const toast = useToast()
const confirm = useConfirm()
const iglesias = ref([])
const iglesiaActiva = ref('')
const error = ref('')
const loading = ref(false)
const editingId = ref(null)

const form = reactive({
  nombreIglesia: '',
  ciudad: '',
})

const columns = [
  { key: 'nombreIglesia', label: 'Iglesia' },
  { key: 'ciudad', label: 'Ciudad' },
]

const isEditing = computed(() => Boolean(editingId.value))

const resetForm = () => {
  editingId.value = null
  form.nombreIglesia = ''
  form.ciudad = ''
}

const setActive = (idIglesia) => {
  iglesiaActiva.value = idIglesia
  setIglesiaActivaId(idIglesia)
}

const loadData = async () => {
  loading.value = true
  error.value = ''

  try {
    const iglesiasData = await getIglesias()
    iglesias.value = iglesiasData

    const savedId = getIglesiaActivaId()
    const exists = iglesiasData.some((iglesia) => String(iglesia.idIglesia) === String(savedId))
    setActive(exists ? savedId : iglesiasData[0]?.idIglesia || '')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  error.value = ''

  try {
    const payload = {
      nombreIglesia: form.nombreIglesia,
      ciudad: form.ciudad,
    }

    const iglesia = isEditing.value
      ? await updateIglesia(editingId.value, payload)
      : await createIglesia(payload)

    setActive(iglesia.idIglesia)
    toast.add({
      severity: 'success',
      summary: isEditing.value ? 'Iglesia actualizada' : 'Iglesia registrada',
      life: 2600,
    })
    resetForm()
    await loadData()
  } catch (err) {
    error.value = err.message
    toast.add({
      severity: 'error',
      summary: 'No se pudo guardar',
      detail: err.message,
      life: 3600,
    })
  }
}

const editRow = (row) => {
  editingId.value = row.idIglesia
  form.nombreIglesia = row.nombreIglesia
  form.ciudad = row.ciudad
}

const removeRow = (row) => {
  confirm.require({
    header: 'Eliminar iglesia',
    message: `Seguro que deseas eliminar ${row.nombreIglesia}?`,
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Eliminar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteIglesia(row.idIglesia)
        if (String(iglesiaActiva.value) === String(row.idIglesia)) {
          setActive('')
        }
        toast.add({ severity: 'success', summary: 'Iglesia eliminada', life: 2600 })
        await loadData()
      } catch (err) {
        error.value = err.message
        toast.add({
          severity: 'error',
          summary: 'No se pudo eliminar',
          detail: err.message,
          life: 3600,
        })
      }
    },
  })
}

onMounted(loadData)
</script>

<template>
  <section class="page">
    <PageActions>
      <AppButton variant="secondary" @click="loadData">Actualizar</AppButton>
    </PageActions>

    <p v-if="error" class="status status-error">{{ error }}</p>
    <p v-else-if="loading" class="status">Cargando iglesias...</p>

    <AppPanel title="Iglesia activa">
      <div class="panel-body form-grid">
        <AppField id="iglesiaActiva" label="Iglesia">
          <AppSelect
            id="iglesiaActiva"
            v-model="iglesiaActiva"
            :options="iglesias"
            option-label="nombreIglesia"
            option-value="idIglesia"
            @update:model-value="setActive"
          />
        </AppField>
      </div>
    </AppPanel>

    <AppPanel :title="isEditing ? 'Editar iglesia' : 'Nueva iglesia'">
      <form class="panel-body form-grid" @submit.prevent="submitForm">
        <AppField id="nombreIglesia" label="Nombre de la iglesia">
          <AppInput id="nombreIglesia" v-model="form.nombreIglesia" required />
        </AppField>

        <AppField id="ciudad" label="Ciudad">
          <AppInput id="ciudad" v-model="form.ciudad" required />
        </AppField>

        <div class="button-row">
          <AppButton type="submit">
            {{ isEditing ? 'Guardar cambios' : 'Registrar iglesia' }}
          </AppButton>
          <AppButton v-if="isEditing" variant="secondary" @click="resetForm">Cancelar</AppButton>
        </div>
      </form>
    </AppPanel>

    <AppPanel title="Iglesias registradas">
      <DataTable :columns="columns" :rows="iglesias" empty-text="Aun no hay iglesias registradas.">
        <template #actions="{ row }">
          <div class="button-row actions">
            <AppButton variant="secondary" size="sm" @click="setActive(row.idIglesia)">Usar</AppButton>
            <AppButton variant="secondary" size="sm" @click="editRow(row)">Editar</AppButton>
            <AppButton variant="danger" size="sm" @click="removeRow(row)">Eliminar</AppButton>
          </div>
        </template>
      </DataTable>
    </AppPanel>
  </section>
</template>

<style scoped>
.actions {
  justify-content: flex-end;
}
</style>
