<script setup>
import { computed, onActivated, onMounted, ref, watch } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import ContributionFormDialog from '@/components/ContributionFormDialog.vue'
import DataTable from '@/components/DataTable.vue'
import MemberFormDialog from '@/components/MemberFormDialog.vue'
import SobreDetailDialog from '@/components/SobreDetailDialog.vue'
import { getMonedas } from '@/services/catalogos.service'
import { getIglesiaActivaId, iglesiaActivaId, iglesiaActivaReady } from '@/services/iglesia-activa.service'
import { createMiembro, getMiembros } from '@/services/miembros.service'
import { createSobre, deleteSobre, getSiguienteNumeroSobre, getSobre, getSobres, updateSobre } from '@/services/sobres.service'
import { formatDateEs, toLocalDateString } from '@/utils/date'
import { withMinimumDelay } from '@/utils/loading'
import { buildSobrePayload } from '@/utils/sobrePayload'

const today = toLocalDateString()
const miembros = ref([])
const monedas = ref([])
const sobres = ref([])
const siguiente = ref(null)
const dialogVisible = ref(false)
const memberDialogVisible = ref(false)
const saving = ref(false)
const savingMember = ref(false)
const loadedOnce = ref(false)
const loading = ref(false)
const selectedSobre = ref(null)
const detailDialogVisible = ref(false)
const selectedDetailId = ref(null)
const optionsMenu = ref(null)
const selectedMenuRow = ref(null)
const toast = useToast()
const confirm = useConfirm()
const idMiembroSeleccionado = ref(null)

const columns = [
  { key: 'numeroSobre', label: 'Sobre', skeletonWidth: '38px' },
  { key: 'fecha', label: 'Fecha', skeletonWidth: '86px' },
  { key: 'nombreMiembro', label: 'Miembro', skeletonWidth: '130px' },
  { key: 'totalIncluido', label: 'Total', skeletonWidth: '74px' },
]

const money = (value) =>
  `$ ${Number(value || 0).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const tableRows = computed(() =>
  sobres.value.map((sobre) => ({
    ...sobre,
    fecha: formatDateEs(sobre.fecha),
    totalIncluido: money(sobre.totalIncluido),
  })),
)

const loadData = async ({ showLoading = true } = {}) => {
  if (!iglesiaActivaReady.value) return

  if (!getIglesiaActivaId()) {
    miembros.value = []
    monedas.value = []
    sobres.value = []
    siguiente.value = null
    loading.value = false
    return
  }

  if (showLoading) {
    loading.value = true
  }

  try {
    const loader = () => Promise.all([
      getMiembros(),
      getMonedas(),
      getSobres(),
    ])
    const [miembrosData, monedasData, sobresData] = await (showLoading ? withMinimumDelay(loader) : loader())
    miembros.value = miembrosData
    monedas.value = monedasData
    sobres.value = sobresData
    await loadSiguiente(today)
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'No se pudo cargar la información',
      detail: err.message,
      life: 3600,
    })
  } finally {
    if (showLoading) {
      loading.value = false
    }
    loadedOnce.value = true
  }
}

const loadSiguiente = async (fecha = today) => {
  if (!fecha) return
  siguiente.value = await getSiguienteNumeroSobre(fecha)
}

const openCreate = () => {
  selectedSobre.value = null
  dialogVisible.value = true
}

const openEdit = async (row) => {
  try {
    selectedSobre.value = await getSobre(row.idSobre)
    dialogVisible.value = true
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'No se pudo cargar el sobre',
      detail: err.message,
      life: 3600,
    })
  }
}

const openDetails = (row) => {
  selectedDetailId.value = row.idSobre
  detailDialogVisible.value = true
}

const optionItems = computed(() => [
  {
    label: 'Detalles',
    icon: 'pi pi-eye',
    class: 'menu-item-info',
    command: () => openDetails(selectedMenuRow.value),
  },
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
  savingMember.value = true

  try {
    const miembroCreado = await createMiembro({
      ...payload,
      idIglesia: Number(getIglesiaActivaId() || payload.idIglesia),
    })
    toast.add({ severity: 'success', summary: 'Miembro registrado', life: 2600 })
    memberDialogVisible.value = false
    miembros.value = await getMiembros()
    idMiembroSeleccionado.value = miembroCreado.idMiembro
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'No se pudo guardar el miembro',
      detail: err.message,
      life: 3600,
    })
  } finally {
    savingMember.value = false
  }
}

const saveContribution = async (form) => {
  saving.value = true
  try {
    const payload = buildSobrePayload(form, getIglesiaActivaId())

    if (selectedSobre.value?.idSobre) {
      await updateSobre(selectedSobre.value.idSobre, payload)
    } else {
      await createSobre(payload)
    }

    toast.add({
      severity: 'success',
      summary: selectedSobre.value?.idSobre ? 'Sobre actualizado' : 'Sobre registrado',
      detail: 'El registro fue guardado correctamente.',
      life: 2600,
    })
    dialogVisible.value = false
    selectedSobre.value = null
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
    header: 'Eliminar sobre',
    message: `Seguro que deseas eliminar el sobre ${row.numeroSobre}?`,
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptLabel: 'Eliminar',
    acceptIcon: 'pi pi-trash',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteSobre(row.idSobre)
        toast.add({ severity: 'success', summary: 'Sobre eliminado', life: 2600 })
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
onActivated(() => {
  if (loadedOnce.value) {
    loadData({ showLoading: false })
  }
})
watch([iglesiaActivaReady, iglesiaActivaId], () => loadData())
</script>

<template>
  <section class="page">
    <ContributionFormDialog
      v-model:visible="dialogVisible"
      :miembros="miembros"
      :monedas="monedas"
      :siguiente="siguiente"
      :sobre="selectedSobre"
      :saving="saving"
      :id-miembro-seleccionado="idMiembroSeleccionado"
      @date-change="loadSiguiente"
      @create-member="memberDialogVisible = true"
      @save="saveContribution"
      @clear-miembro-seleccionado="idMiembroSeleccionado = null"
    />

    <MemberFormDialog
      v-model:visible="memberDialogVisible"
      :default-iglesia="getIglesiaActivaId()"
      :saving="savingMember"
      @save="saveMember"
    />

    <SobreDetailDialog v-model:visible="detailDialogVisible" :id-sobre="selectedDetailId" />

    <DataTable
      :columns="columns"
      :rows="tableRows"
      :loading="loading"
      actions-width="76px"
      empty-text="Aun no hay sobres registrados."
    >
      <template #toolbarStart>
        <div class="button-row">
          <PButton icon="pi pi-refresh" severity="secondary" outlined :loading="loading" @click="loadData" />
          <PButton label="Nuevo sobre" icon="pi pi-plus" @click="openCreate" />
        </div>
      </template>
      <template #actions="{ row }">
        <div class="button-row actions">
          <PButton v-tooltip.top="'Opciones'" icon="pi pi-ellipsis-v" severity="secondary" outlined size="small" @click="toggleOptions($event, row)" />
        </div>
      </template>
    </DataTable>
    <PMenu ref="optionsMenu" :model="optionItems" popup />
  </section>
</template>

<style scoped>
.actions {
  justify-content: flex-end;
}
</style>
