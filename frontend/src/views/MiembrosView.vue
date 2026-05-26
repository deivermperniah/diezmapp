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
import { getIglesias } from '@/services/catalogos.service'
import { getIglesiaActivaId } from '@/services/iglesia-activa.service'
import {
  createMiembro,
  deleteMiembro,
  getMiembros,
  updateMiembro,
} from '@/services/miembros.service'

const miembros = ref([])
const iglesias = ref([])
const loading = ref(false)
const error = ref('')
const editingId = ref(null)
const confirm = useConfirm()
const toast = useToast()

const form = reactive({
  nombre: '',
  email: '',
  idIglesia: '',
})

const columns = [
  { key: 'idMiembro', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'nombreIglesia', label: 'Iglesia' },
]

const isEditing = computed(() => Boolean(editingId.value))

const resetForm = () => {
  editingId.value = null
  form.nombre = ''
  form.email = ''
  form.idIglesia = getIglesiaActivaId() || iglesias.value[0]?.idIglesia || ''
}

const loadData = async () => {
  loading.value = true
  error.value = ''

  try {
    const [miembrosData, iglesiasData] = await Promise.all([getMiembros(), getIglesias()])
    miembros.value = miembrosData
    iglesias.value = iglesiasData

    if (!form.idIglesia) {
      form.idIglesia = getIglesiaActivaId() || iglesiasData[0]?.idIglesia || ''
    }
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
      nombre: form.nombre,
      email: form.email || null,
      idIglesia: Number(getIglesiaActivaId() || form.idIglesia),
    }

    if (isEditing.value) {
      await updateMiembro(editingId.value, payload)
      toast.add({
        severity: 'success',
        summary: 'Miembro actualizado',
        life: 2600,
      })
    } else {
      await createMiembro(payload)
      toast.add({
        severity: 'success',
        summary: 'Miembro registrado',
        life: 2600,
      })
    }

    await loadData()
    resetForm()
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
  editingId.value = row.idMiembro
  form.nombre = row.nombre
  form.email = row.email || ''
  form.idIglesia = row.idIglesia
}

const removeRow = (row) => {
  confirm.require({
    header: 'Eliminar miembro',
    message: `Seguro que deseas eliminar a ${row.nombre}?`,
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Eliminar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      error.value = ''

      try {
        await deleteMiembro(row.idMiembro)
        toast.add({
          severity: 'success',
          summary: 'Miembro eliminado',
          life: 2600,
        })
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

    <AppPanel :title="isEditing ? 'Editar miembro' : 'Nuevo miembro'">
      <form class="panel-body form-grid" @submit.prevent="submitForm">
        <AppField id="nombre" label="Nombre">
          <AppInput id="nombre" v-model="form.nombre" required />
        </AppField>
        <AppField id="email" label="Email">
          <AppInput id="email" v-model="form.email" type="email" />
        </AppField>
        <AppField id="iglesia" label="Iglesia">
          <AppSelect id="iglesia" v-model="form.idIglesia" :options="iglesias" option-label="nombreIglesia" option-value="idIglesia" />
        </AppField>
        <div class="button-row">
          <AppButton type="submit">
            {{ isEditing ? 'Guardar cambios' : 'Registrar miembro' }}
          </AppButton>
          <AppButton v-if="isEditing" variant="secondary" @click="resetForm">Cancelar</AppButton>
        </div>
      </form>
    </AppPanel>

    <p v-if="error" class="status status-error">{{ error }}</p>
    <p v-else-if="loading" class="status">Cargando miembros...</p>

    <AppPanel title="Listado de miembros">
      <DataTable :columns="columns" :rows="miembros" empty-text="Aun no hay miembros registrados.">
        <template #actions="{ row }">
          <div class="button-row actions">
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
