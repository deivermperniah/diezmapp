<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import DataTable from '@/components/DataTable.vue'
import MemberFormDialog from '@/components/MemberFormDialog.vue'
import { getIglesiaActivaId, iglesiaActivaId } from '@/services/iglesia-activa.service'
import {
  createMiembro,
  deleteMiembro,
  getMiembros,
  updateMiembro,
} from '@/services/miembros.service'
import { withMinimumDelay } from '@/utils/loading'

const miembros = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const selectedMember = ref(null)
const saving = ref(false)
const optionsMenu = ref(null)
const selectedMenuRow = ref(null)
const confirm = useConfirm()
const toast = useToast()

const columns = [
  { key: 'nombre', label: 'Nombre', width: '190px', skeletonWidth: '82px' },
  { key: 'apellido', label: 'Apellido', width: '190px', skeletonWidth: '82px' },
  { key: 'email', label: 'Email', skeletonWidth: '150px' },
]

const loadData = async ({ showLoading = true } = {}) => {
  if (showLoading) {
    loading.value = true
  }

  try {
    const loader = () => getMiembros()
    miembros.value = await (showLoading ? withMinimumDelay(loader) : loader())
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

const optionItems = computed(() => [
  {
    label: 'Editar',
    icon: 'pi pi-pencil',
    class: 'menu-item-edit',
    command: () => openEdit(selectedMenuRow.value),
  },
  {
    label: 'Eliminar',
    icon: 'pi pi-trash',
    class: 'menu-item-danger',
    command: () => removeRow(selectedMenuRow.value),
  },
])

const toggleOptions = (event, row) => {
  selectedMenuRow.value = row
  optionsMenu.value.toggle(event)
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
    message: `Seguro que deseas eliminar a ${row.nombreCompleto || row.nombre}?`,
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
    <DataTable
      :columns="columns"
      :rows="miembros"
      :loading="loading"
      actions-width="76px"
      empty-text="Aun no hay miembros registrados."
    >
      <template #toolbarStart>
        <div class="button-row">
          <PButton icon="pi pi-refresh" severity="secondary" outlined :loading="loading" @click="loadData" />
          <PButton label="Nuevo miembro" icon="pi pi-plus" @click="openCreate" />
        </div>
      </template>
      <template #actions="{ row }">
        <div class="button-row actions">
          <PButton v-tooltip.top="'Opciones'" icon="pi pi-ellipsis-v" severity="secondary" outlined size="small" @click="toggleOptions($event, row)" />
        </div>
      </template>
    </DataTable>
    <PMenu ref="optionsMenu" :model="optionItems" popup />

    <MemberFormDialog
      v-model:visible="dialogVisible"
      :member="selectedMember"
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
