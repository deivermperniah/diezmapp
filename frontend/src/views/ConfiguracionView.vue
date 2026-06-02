<script setup>
import { computed, onMounted, ref } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import ChurchFormDialog from '@/components/ChurchFormDialog.vue'
import DataTable from '@/components/DataTable.vue'
import {
  createIglesia,
  deleteIglesia,
  getIglesias,
  updateIglesia,
} from '@/services/catalogos.service'
import { getTasaDolar } from '@/services/configuracion.service'
import {
  getIglesiaActivaId,
  setIglesiaActivaId,
} from '@/services/iglesia-activa.service'
import { formatDateTimeEs } from '@/utils/date'
import { withMinimumDelay } from '@/utils/loading'

const toast = useToast()
const confirm = useConfirm()
const iglesias = ref([])
const iglesiaActiva = ref('')
const error = ref('')
const loading = ref(false)
const dialogVisible = ref(false)
const selectedChurch = ref(null)
const saving = ref(false)
const optionsMenu = ref(null)
const selectedMenuRow = ref(null)

const columns = [
  { key: 'nombreIglesia', label: 'Iglesia', skeletonWidth: '140px' },
  { key: 'ciudad', label: 'Ciudad', skeletonWidth: '96px' },
]

const tasaDolar = ref(null)
const fechaTasa = ref('')
const loadingTasa = ref(false)
const BCV_PAGE_URL = 'https://www.bcv.org.ve/'

const setActive = (idIglesia) => {
  iglesiaActiva.value = idIglesia
  const iglesia = iglesias.value.find((item) => String(item.idIglesia) === String(idIglesia))
  setIglesiaActivaId(idIglesia, iglesia?.nombreIglesia || '')
}

const activateRow = (row) => {
  setActive(row.idIglesia)
  toast.add({
    severity: 'success',
    summary: `Iglesia ${row.nombreIglesia} activa`,
    life: 2200,
  })
}

const loadData = async ({ showLoading = true } = {}) => {
  if (showLoading) {
    loading.value = true
  }

  error.value = ''

  try {
    const loader = () => getIglesias()
    const iglesiasData = await (showLoading ? withMinimumDelay(loader) : loader())
    iglesias.value = iglesiasData

    const savedId = getIglesiaActivaId()
    const exists = iglesiasData.some((iglesia) => String(iglesia.idIglesia) === String(savedId))
    setActive(exists ? savedId : iglesiasData[0]?.idIglesia || '')
  } catch (err) {
    error.value = err.message
  } finally {
    if (showLoading) {
      loading.value = false
    }
  }
}

const formatRate = (value) =>
  value === null || value === undefined
    ? 'Sin valor'
      : Number(value).toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })

const formatDate = (value) => formatDateTimeEs(value) || 'Sin fecha'

const loadTasaDolar = async () => {
  loadingTasa.value = true

  try {
    const tasa = await withMinimumDelay(() => getTasaDolar())
    tasaDolar.value = tasa.valor
    fechaTasa.value = tasa.fechaActualizacion
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'No se pudo consultar el dólar oficial',
      detail: err.message,
      life: 3600,
    })
  } finally {
    loadingTasa.value = false
  }
}

const openBcvPage = () => {
  window.open(BCV_PAGE_URL, '_blank', 'noopener,noreferrer')
}

const openCreate = () => {
  selectedChurch.value = null
  dialogVisible.value = true
}

const openEdit = (row) => {
  selectedChurch.value = row
  dialogVisible.value = true
}

const optionItems = computed(() => {
  const row = selectedMenuRow.value

  return [
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      class: 'menu-item-edit',
      command: () => openEdit(row),
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      class: 'menu-item-danger',
      command: () => removeRow(row),
    },
  ]
})

const toggleOptions = (event, row) => {
  selectedMenuRow.value = row
  optionsMenu.value.toggle(event)
}

const saveChurch = async (payload) => {
  error.value = ''
  saving.value = true

  try {
    const iglesia = selectedChurch.value?.idIglesia
      ? await updateIglesia(selectedChurch.value.idIglesia, payload)
      : await createIglesia(payload)

    setIglesiaActivaId(iglesia.idIglesia, iglesia.nombreIglesia)
    toast.add({
      severity: 'success',
      summary: selectedChurch.value?.idIglesia ? 'Iglesia actualizada' : 'Iglesia registrada',
      life: 2600,
    })
    dialogVisible.value = false
    selectedChurch.value = null
    await loadData({ showLoading: false })
  } catch (err) {
    error.value = err.message
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
    header: 'Eliminar iglesia',
    message: `Seguro que deseas eliminar ${row.nombreIglesia}?`,
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptLabel: 'Eliminar',
    acceptIcon: 'pi pi-trash',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteIglesia(row.idIglesia)
        if (String(iglesiaActiva.value) === String(row.idIglesia)) {
          setActive('')
        }
        toast.add({ severity: 'success', summary: 'Iglesia eliminada', life: 2600 })
        await loadData({ showLoading: false })
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

onMounted(() => {
  loadData()
  loadTasaDolar()
})
</script>

<template>
  <section class="page">
    <p v-if="error" class="status status-error">{{ error }}</p>

    <h2 class="config-section-title">Dólar</h2>

    <section class="rate-card">
      <div class="rate-content">
        <div class="rate-main">
          <div class="rate-icon">
            <i class="pi pi-dollar" />
          </div>

          <div class="rate-value">
            <PSkeleton v-if="loadingTasa" width="170px" height="2rem" />
            <strong v-else>Bs. {{ formatRate(tasaDolar) }}</strong>
          </div>

          <div class="rate-meta">
            <div class="rate-detail rate-source">
              <i class="pi pi-building" />
              <strong>Banco Central de Venezuela</strong>
            </div>

            <div class="rate-detail rate-date">
              <i class="pi pi-calendar" />
              <PSkeleton v-if="loadingTasa" width="220px" height="1rem" />
              <strong v-else>{{ formatDate(fechaTasa) }}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="rate-actions">
        <PButton
          v-tooltip.top="'Actualizar tasa'"
          class="rate-action-button"
          icon="pi pi-refresh"
          aria-label="Actualizar tasa"
          severity="secondary"
          outlined
          :loading="loadingTasa"
          @click="loadTasaDolar"
        />
        <PButton
          v-tooltip.top="'Abrir BCV'"
          class="rate-action-button rate-bank-button"
          icon="pi pi-building-columns"
          aria-label="Abrir BCV"
          severity="secondary"
          outlined
          @click="openBcvPage"
        />
      </div>
    </section>

    <h2 class="config-section-title">Iglesias</h2>

    <DataTable
      :columns="columns"
      :rows="iglesias"
      :loading="loading"
      actions-width="160px"
      empty-text="Aun no hay iglesias registradas."
    >
      <template #toolbarStart>
        <div class="button-row">
          <PButton icon="pi pi-refresh" severity="secondary" outlined :loading="loading" @click="loadData" />
          <PButton label="Nueva iglesia" icon="pi pi-plus" @click="openCreate" />
        </div>
      </template>
      <template #actions="{ row }">
        <div class="button-row actions">
          <PButton
            v-if="String(row.idIglesia) === String(iglesiaActiva)"
            label="Activa"
            icon="pi pi-check"
            class="church-state-button"
            severity="success"
            size="small"
            disabled
          />
          <PButton
            v-else
            label="Usar"
            icon="pi pi-building"
            class="church-state-button"
            severity="secondary"
            outlined
            size="small"
            @click="activateRow(row)"
          />
          <PButton v-tooltip.top="'Opciones'" icon="pi pi-ellipsis-v" severity="secondary" outlined size="small" @click="toggleOptions($event, row)" />
        </div>
      </template>
    </DataTable>
    <PMenu ref="optionsMenu" :model="optionItems" popup />

    <ChurchFormDialog
      v-model:visible="dialogVisible"
      :church="selectedChurch"
      :saving="saving"
      @save="saveChurch"
    />
  </section>
</template>

<style scoped>
.config-section-title {
  margin: 0;
  color: var(--color-ink);
  font-size: 18px;
  font-weight: 900;
}

.rate-card {
  position: relative;
  display: block;
  padding: 20px 124px 20px 20px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.rate-content {
  min-width: 0;
}

.rate-main {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 14px;
  min-width: 0;
}

.rate-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #fff3d6;
  color: #b45309;
  font-size: 18px;
}

.rate-value {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.rate-value span,
.rate-detail span {
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 800;
}

.rate-value strong {
  color: #7c2d12;
  font-size: 28px;
  font-weight: 900;
  line-height: 1;
}

.rate-detail {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.rate-detail i {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 8px;
  font-size: 13px;
}

.rate-meta {
  display: grid;
  gap: 8px;
  padding-left: 18px;
  border-left: 1px solid var(--color-line);
}

.rate-detail strong {
  overflow: hidden;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rate-source strong,
.rate-date strong {
  color: #475569;
  font-size: 16px;
  font-weight: 700;
}

.rate-source i {
  background: #e8eeff;
  color: #275efe;
}

.rate-date i {
  background: #e6f6ef;
  color: #16835f;
}

.rate-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  top: 50%;
  right: 18px;
  transform: translateY(-50%);
}

.rate-actions :deep(.rate-action-button) {
  width: 42px;
  height: 42px;
}

.rate-actions :deep(.rate-bank-button) {
  border-color: rgba(39, 94, 254, 0.24);
  color: #275efe;
}

.rate-actions :deep(.rate-bank-button:hover) {
  background: #e8eeff;
  border-color: rgba(39, 94, 254, 0.32);
  color: #275efe;
}

.actions {
  justify-content: flex-end;
  flex-wrap: nowrap;
}

.church-state-button {
  width: 92px;
}

@media (max-width: 860px) {
  .rate-card {
    padding-right: 20px;
    padding-bottom: 78px;
  }

  .rate-main {
    flex-wrap: wrap;
  }

  .rate-actions {
    top: auto;
    right: 20px;
    bottom: 20px;
    height: 42px;
    transform: none;
    justify-self: end;
    justify-content: flex-end;
  }

  .rate-actions :deep(.rate-action-button) {
    width: 42px;
    height: 42px;
  }
}
</style>
