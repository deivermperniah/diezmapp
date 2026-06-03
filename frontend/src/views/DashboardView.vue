<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import ContributionFormDialog from '@/components/ContributionFormDialog.vue'
import DataTable from '@/components/DataTable.vue'
import SobreDetailDialog from '@/components/SobreDetailDialog.vue'
import StatCard from '@/components/StatCard.vue'
import { getMonedas } from '@/services/catalogos.service'
import { getIglesiaActivaId, iglesiaActivaId, iglesiaActivaReady } from '@/services/iglesia-activa.service'
import { getMiembros } from '@/services/miembros.service'
import { deleteSobre, getSobre, getSobres, updateSobre } from '@/services/sobres.service'
import { formatDateEs } from '@/utils/date'
import { withMinimumDelay } from '@/utils/loading'
import { buildSobrePayload } from '@/utils/sobrePayload'

const loading = ref(true)
const loadingCards = ref(true)
const saving = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const error = ref('')
const miembros = ref([])
const monedas = ref([])
const sobres = ref([])
const selectedSobre = ref(null)
const selectedDetailId = ref(null)
const optionsMenu = ref(null)
const selectedMenuRow = ref(null)
const confirm = useConfirm()
const toast = useToast()

const money = (value) => `$ ${Number(value || 0).toLocaleString('es-VE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`

const totalGeneral = computed(() =>
  sobres.value.reduce((total, sobre) => total + Number(sobre.totalIncluido || 0), 0),
)

const columns = [
  { key: 'numeroSobre', label: 'Sobre', skeletonWidth: '38px' },
  { key: 'fecha', label: 'Fecha', skeletonWidth: '86px' },
  { key: 'nombre', label: 'Miembro', skeletonWidth: '130px' },
  { key: 'totalSobre', label: 'Total', skeletonWidth: '74px' },
]

const tableRows = computed(() =>
  sobres.value
    .slice(0, 10)
    .map((sobre) => ({
      idSobre: sobre.idSobre,
      numeroSobre: sobre.numeroSobre,
      nombre: sobre.nombreMiembro,
      fecha: formatDateEs(sobre.fecha),
      totalSobre: money(sobre.totalIncluido),
    })),
)

const loadDashboard = async ({ showLoading = true } = {}) => {
  if (!iglesiaActivaReady.value) return

  if (!getIglesiaActivaId()) {
    miembros.value = []
    monedas.value = []
    sobres.value = []
    loading.value = false
    loadingCards.value = false
    return
  }

  if (showLoading) {
    loading.value = true
  }
  error.value = ''

  try {
    const loader = () => Promise.all([
      getMiembros(),
      getMonedas(),
      getSobres(),
    ])
    const [miembrosData, monedasData, sobresData] =
      await (showLoading ? withMinimumDelay(loader) : loader())

    miembros.value = miembrosData
    monedas.value = monedasData
    sobres.value = sobresData
  } catch (err) {
    error.value = err.message
  } finally {
    if (showLoading) {
      loading.value = false
      loadingCards.value = false
    }
  }
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

const saveContribution = async (form) => {
  if (!selectedSobre.value?.idSobre) return

  saving.value = true
  try {
    await updateSobre(selectedSobre.value.idSobre, buildSobrePayload(form, getIglesiaActivaId()))

    toast.add({ severity: 'success', summary: 'Sobre actualizado', life: 2600 })
    dialogVisible.value = false
    selectedSobre.value = null
    await loadDashboard({ showLoading: false })
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
        await loadDashboard({ showLoading: false })
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

onMounted(loadDashboard)
watch([iglesiaActivaReady, iglesiaActivaId], () => loadDashboard())
</script>

<template>
  <section class="page">
    <ContributionFormDialog
      v-model:visible="dialogVisible"
      :miembros="miembros"
      :monedas="monedas"
      :sobre="selectedSobre"
      :saving="saving"
      @save="saveContribution"
    />

    <SobreDetailDialog v-model:visible="detailDialogVisible" :id-sobre="selectedDetailId" />

    <p v-if="error" class="status status-error">{{ error }}</p>

    <div class="grid grid-3">
      <StatCard label="Miembros" :value="miembros.length" icon="pi pi-users" :loading="loadingCards" />
      <StatCard label="Sobres" :value="sobres.length" icon="pi pi-inbox" tone="gray" :loading="loadingCards" />
      <StatCard
        label="Total general"
        :value="money(totalGeneral)"
        icon="pi pi-dollar"
        tone="green"
        :loading="loadingCards"
      />
    </div>

    <h2 class="section-title">Últimos sobres registrados</h2>

    <section class="section-block">

    <DataTable
      :columns="columns"
      :rows="tableRows"
      :loading="loading"
      actions-width="76px"
      empty-text="Aun no hay sobres para este mes."
    >
      <template #toolbarStart>
        <PButton icon="pi pi-refresh" severity="secondary" outlined :loading="loading" @click="loadDashboard" />
      </template>
      <template #actions="{ row }">
        <div class="button-row actions">
          <PButton v-tooltip.top="'Opciones'" icon="pi pi-ellipsis-v" severity="secondary" outlined size="small" @click="toggleOptions($event, row)" />
        </div>
      </template>
    </DataTable>
    <PMenu ref="optionsMenu" :model="optionItems" popup />
    </section>
  </section>
</template>

<style scoped>
.section-heading h3 {
  margin-top: 0;
}

.section-title {
  margin: 0;
  color: var(--color-ink);
  font-size: 18px;
  font-weight: 900;
}

.actions {
  justify-content: flex-end;
}
</style>
