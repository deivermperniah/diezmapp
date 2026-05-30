<script setup>
import { onMounted, ref, watch } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import DataTable from '@/components/DataTable.vue'
import MemberFormDialog from '@/components/MemberFormDialog.vue'
import { getIglesias } from '@/services/catalogos.service'
import { getIglesiaActivaId, iglesiaActivaId } from '@/services/iglesia-activa.service'
import {
  createMiembro,
  deleteMiembro,
  getMiembros,
  updateMiembro,
} from '@/services/miembros.service'
import { withMinimumDelay } from '@/utils/loading'

const miembros = ref([])
const iglesias = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const selectedMember = ref(null)
const saving = ref(false)
const confirm = useConfirm()
const toast = useToast()

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'nombreIglesia', label: 'Iglesia' },
]

const loadData = async ({ showLoading = true } = {}) => {
  if (showLoading) {
    loading.value = true
  }

  try {
    const loader = () => Promise.all([getMiembros(), getIglesias()])
    const [miembrosData, iglesiasData] = await (showLoading ? withMinimumDelay(loader) : loader())
    miembros.value = miembrosData
    iglesias.value = iglesiasData
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'No se pudieron cargar los miembros',
      detail: err.message,
      life: 3600,
    })
  } finally {
    if (showLoading) {
      loading.value = false
    }
  }
}

const openCreate = () => {
  selectedMember.value = null
  dialogVisible.value = true
}

const openEdit = (row) => {
  selectedMember.value = row
  dialogVisible.value = true
}

const saveMember = async (payload) => {
  saving.value = true
  try {
    const data = {
      ...payload,
      idIglesia: Number(getIglesiaActivaId() || payload.idIglesia),
    }

    if (selectedMember.value?.idMiembro) {
      await updateMiembro(selectedMember.value.idMiembro, data)
      toast.add({ severity: 'success', summary: 'Miembro actualizado', life: 2600 })
    } else {
      await createMiembro(data)
      toast.add({ severity: 'success', summary: 'Miembro registrado', life: 2600 })
    }

    dialogVisible.value = false
    selectedMember.value = null
    await loadData({ showLoading: false })
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'No se pudo guardar',
      detail: err.message,
      life: 3600,
    })
  } finally {
    saving.value = false
  }
}

const removeRow = (row) => {
  confirm.require({
    header: 'Eliminar miembro',
    message: `Seguro que deseas eliminar a ${row.nombre}?`,
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptLabel: 'Eliminar',
    acceptIcon: 'pi pi-trash',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteMiembro(row.idMiembro)
        toast.add({ severity: 'success', summary: 'Miembro eliminado', life: 2600 })
        await loadData({ showLoading: false })
      } catch (err) {
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
watch(iglesiaActivaId, loadData)
</script>

<template>
  <section class="page">
    <DataTable :columns="columns" :rows="miembros" :loading="loading" empty-text="Aun no hay miembros registrados.">
      <template #toolbarStart>
        <div class="button-row">
          <PButton icon="pi pi-refresh" severity="secondary" outlined :loading="loading" @click="loadData" />
          <PButton label="Nuevo miembro" icon="pi pi-plus" @click="openCreate" />
        </div>
      </template>
      <template #actions="{ row }">
        <div class="button-row actions">
          <PButton icon="pi pi-pencil" severity="secondary" outlined size="small" @click="openEdit(row)" />
          <PButton icon="pi pi-trash" severity="danger" outlined size="small" @click="removeRow(row)" />
        </div>
      </template>
    </DataTable>

    <MemberFormDialog
      v-model:visible="dialogVisible"
      :member="selectedMember"
      :iglesias="iglesias"
      :default-iglesia="getIglesiaActivaId()"
      :saving="saving"
      @save="saveMember"
    />
  </section>
</template>

<style scoped>
.actions {
  justify-content: flex-end;
}
</style>
