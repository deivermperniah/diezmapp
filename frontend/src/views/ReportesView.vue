<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import DataTable from '@/components/DataTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import { iglesiaActivaId } from '@/services/iglesia-activa.service'
import { getReporteMensual, getReporteSemanal } from '@/services/reportes.service'
import { formatDateEs, toLocalDateString } from '@/utils/date'
import { exportCsvFile, exportExcelFile, exportPdfFile } from '@/utils/exporters'
import { withMinimumDelay } from '@/utils/loading'

const toast = useToast()
const today = toLocalDateString()
const start = new Date()
start.setDate(start.getDate() - 6)

const tipoReporte = ref('mensual')
const filtros = reactive({
  fechaInicio: toLocalDateString(start),
  fechaFin: today,
  mes: new Date().getMonth() + 1,
  anio: new Date().getFullYear(),
})

const reporte = ref({ items: [], totals: { totalGeneral: 0 } })
const error = ref('')
const loading = ref(false)
const consulted = ref(false)
const exportInfoVisible = ref(false)

const tiposReporte = [
  { label: 'Mensual', value: 'mensual' },
  { label: 'Semanal', value: 'semanal' },
]

const periodoMensual = computed({
  get: () => new Date(Number(filtros.anio), Number(filtros.mes) - 1, 1),
  set: (value) => {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return
    filtros.mes = value.getMonth() + 1
    filtros.anio = value.getFullYear()
  },
})

const fechaInicioSemanal = computed({
  get: () => {
    const [year, month, day] = String(filtros.fechaInicio).split('-').map(Number)
    return new Date(year, month - 1, day)
  },
  set: (value) => {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return
    const weekEnd = new Date(value)
    weekEnd.setDate(weekEnd.getDate() + 6)

    filtros.fechaInicio = toLocalDateString(value)
    filtros.fechaFin = toLocalDateString(weekEnd)
  },
})

const fechaFinSemanal = computed({
  get: () => {
    const [year, month, day] = String(filtros.fechaFin).split('-').map(Number)
    return new Date(year, month - 1, day)
  },
  set: (value) => {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return
    const weekStart = new Date(value)
    weekStart.setDate(weekStart.getDate() - 6)

    filtros.fechaInicio = toLocalDateString(weekStart)
    filtros.fechaFin = toLocalDateString(value)
  },
})

const money = (value) =>
  `$ ${Number(value || 0).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const reportColumns = [
  { key: 'numeroSobre', label: 'Sobre', skeletonWidth: '38px' },
  { key: 'fecha', label: 'Fecha', skeletonWidth: '86px' },
  { key: 'nombre', label: 'Miembro', skeletonWidth: '130px' },
  { key: 'totalSobre', label: 'Total', skeletonWidth: '74px' },
]

const columns = computed(() => reportColumns)
const hasRecords = computed(() => tableRows.value.length > 0)
const emptyText = computed(() =>
  consulted.value
    ? tipoReporte.value === 'semanal'
      ? 'Sin datos semanales.'
      : 'Sin datos mensuales.'
    : 'Consulta y Exporta.',
)

const tableRows = computed(() =>
  reporte.value.items.map((item) => ({
    ...item,
    fecha: formatDateEs(item.fecha),
    montoDiezmo: money(item.montoDiezmo),
    montoPactoAmor: money(item.montoPactoAmor),
    otrasOfrendas: money(item.otrasOfrendas),
    totalSobre: money(item.totalSobre),
  })),
)

const reportTitle = computed(() => (tipoReporte.value === 'semanal' ? 'Reporte semanal' : 'Reporte mensual'))
const reportPeriod = computed(() => {
  if (tipoReporte.value === 'semanal') {
    return `${formatDateEs(filtros.fechaInicio)} - ${formatDateEs(filtros.fechaFin)}`
  }

  return new Intl.DateTimeFormat('es-VE', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Number(filtros.anio), Number(filtros.mes) - 1, 1))
})

const exportRows = computed(() =>
  tableRows.value.map((row) =>
    columns.value.reduce((record, column) => {
      record[column.label] = row[column.key] ?? ''
      return record
    }, {}),
  ),
)

const buildFilename = (extension) =>
  `${tipoReporte.value}-${reportPeriod.value.replaceAll(' ', '-').replaceAll('/', '-')}.${extension}`

const ensureExportData = () => {
  if (hasRecords.value) return true

  toast.add({
    severity: 'warn',
    summary: 'Sin datos',
    life: 2200,
  })

  return false
}

const clearReporte = () => {
  reporte.value = { items: [], totals: { totalGeneral: 0 } }
  consulted.value = false
  error.value = ''
}

const exportCsv = () => {
  if (!ensureExportData()) return

  const headers = columns.value.map((column) => column.label)
  exportCsvFile({ headers, rows: exportRows.value, filename: buildFilename('csv') })
}

const exportExcel = () => {
  if (!ensureExportData()) return

  exportExcelFile({
    columns: columns.value,
    rows: exportRows.value,
    title: reportTitle.value,
    period: reportPeriod.value,
    filename: buildFilename('xls'),
  })
}

const exportPdf = () => {
  if (!ensureExportData()) return

  exportPdfFile({
    title: reportTitle.value,
    period: reportPeriod.value,
    headers: columns.value.map((column) => column.label),
    rows: exportRows.value,
    filename: buildFilename('pdf'),
  })
}

const loadReporte = async () => {
  consulted.value = true
  loading.value = true
  error.value = ''

  try {
    const reporteData = await withMinimumDelay(() =>
      tipoReporte.value === 'semanal'
        ? getReporteSemanal({
            fechaInicio: filtros.fechaInicio,
            fechaFin: filtros.fechaFin,
          })
        : getReporteMensual({
            mes: filtros.mes,
            anio: filtros.anio,
          }),
    )

    reporte.value = reporteData
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

watch(iglesiaActivaId, () => {
  if (consulted.value) {
    loadReporte()
  }
})
</script>

<template>
  <section class="page">
    <p v-if="error" class="status status-error">{{ error }}</p>

    <section class="report-card">
      <form class="report-filter-grid" :class="{ weekly: tipoReporte === 'semanal' }" @submit.prevent="loadReporte">
        <AppField id="tipoReporte" label="Tipo de reporte" class="compact-field">
          <AppSelect
            id="tipoReporte"
            v-model="tipoReporte"
            :options="tiposReporte"
            option-label="label"
            option-value="value"
          />
        </AppField>

        <AppField v-if="tipoReporte === 'mensual'" id="periodoMensual" label="Mes y año" class="compact-field">
          <PDatePicker
            input-id="periodoMensual"
            v-model="periodoMensual"
            view="month"
            date-format="mm/yy"
            show-icon
            :manual-input="false"
            fluid
          />
        </AppField>

        <template v-else>
          <AppField id="fechaInicio" label="Inicio" class="compact-field">
            <PDatePicker
              input-id="fechaInicio"
              v-model="fechaInicioSemanal"
              date-format="dd/mm/yy"
              show-icon
              :manual-input="false"
              fluid
            />
          </AppField>

          <AppField id="fechaFin" label="Fin" class="compact-field">
            <PDatePicker
              input-id="fechaFin"
              v-model="fechaFinSemanal"
              date-format="dd/mm/yy"
              show-icon
              :manual-input="false"
              fluid
            />
          </AppField>
        </template>

        <div class="filter-actions">
          <PButton
            v-tooltip.top="'Limpiar consulta'"
            icon="pi pi-eraser"
            severity="secondary"
            outlined
            aria-label="Limpiar consulta"
            @click="clearReporte"
          />
          <AppButton type="submit" icon="pi pi-search" label="Consultar" />
        </div>
      </form>

      <DataTable
        class="report-table"
        :columns="columns"
        :rows="tableRows"
        :loading="loading"
        :empty-text="emptyText"
        :searchable="false"
      >
      </DataTable>

    </section>

    <h2 class="report-section-title">Exportar</h2>

    <section class="export-section">
      <div class="export-actions">
        <div class="export-button-row">
          <AppButton
            class="export-button export-excel"
            variant="secondary"
            icon="pi pi-file-excel"
            label="Excel"
            @click="exportExcel"
          />
          <AppButton
            class="export-button export-pdf"
            variant="secondary"
            icon="pi pi-file-pdf"
            label="PDF"
            @click="exportPdf"
          />
          <AppButton
            class="export-button export-csv"
            variant="secondary"
            icon="pi pi-file"
            label="CSV"
            @click="exportCsv"
          />
        </div>

        <PButton
          v-tooltip.top="'Información'"
          icon="pi pi-info"
          severity="secondary"
          outlined
          aria-label="Información de exportación"
          @click="exportInfoVisible = true"
        />
      </div>
    </section>

    <PDialog
      v-model:visible="exportInfoVisible"
      modal
      class="export-info-dialog"
      :style="{ width: 'min(420px, 92vw)' }"
    >
      <template #header>
        <div class="export-dialog-heading">
          <span class="export-dialog-icon">
            <i class="pi pi-info" />
          </span>
          <strong>Información de exportación</strong>
        </div>
      </template>

      <div class="export-info">
        <div class="export-info-item excel">
          <i class="pi pi-file-excel" />
          <div>
            <strong>Excel</strong>
            <span>Descarga una tabla compatible con hojas de cálculo.</span>
          </div>
        </div>

        <div class="export-info-item pdf">
          <i class="pi pi-file-pdf" />
          <div>
            <strong>PDF</strong>
            <span>Descarga un archivo listo para compartir o imprimir.</span>
          </div>
        </div>

        <div class="export-info-item csv">
          <i class="pi pi-file" />
          <div>
            <strong>CSV</strong>
            <span>Genera un archivo simple para importar datos.</span>
          </div>
        </div>
      </div>
    </PDialog>
  </section>
</template>

<style scoped>
.report-card {
  display: grid;
  gap: 0;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: #fff;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.report-filter-grid {
  display: grid;
  grid-template-columns: 220px 220px auto;
  align-items: end;
  gap: 16px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-line);
}

.report-filter-grid.weekly {
  grid-template-columns: 220px 220px 220px auto;
}

.compact-field :deep(label) {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.report-card :deep(.report-table) {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.export-section {
  display: grid;
  padding: 16px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.report-section-title {
  margin: 0;
  color: var(--color-ink);
  font-size: 18px;
  font-weight: 900;
}

.export-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.export-button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.export-actions :deep(.export-button) {
  border-color: transparent;
}

.export-actions :deep(.export-excel) {
  background: #dcfce7 !important;
  color: #166534 !important;
}

.export-actions :deep(.export-excel:hover) {
  background: #86efac !important;
  color: #14532d !important;
}

.export-actions :deep(.export-pdf) {
  background: #fee2e2 !important;
  color: #991b1b !important;
}

.export-actions :deep(.export-pdf:hover) {
  background: #fca5a5 !important;
  color: #7f1d1d !important;
}

.export-actions :deep(.export-csv) {
  background: #dbeafe !important;
  color: #1d4ed8 !important;
}

.export-actions :deep(.export-csv:hover) {
  background: #93c5fd !important;
  color: #1e40af !important;
}

.export-info {
  display: grid;
  gap: 10px;
}

.export-dialog-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.export-dialog-icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.export-dialog-heading strong {
  color: var(--color-ink);
  font-size: 18px;
  font-weight: 900;
}

.export-info-dialog :deep(.p-dialog-header) {
  padding: 22px 24px 18px;
}

.export-info-dialog :deep(.p-dialog-content) {
  padding: 16px 18px 18px;
}

.export-info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8fafc;
}

.export-info-item > i {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border-radius: 8px;
  font-size: 15px;
}

.export-info-item div {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.export-info-item strong {
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 900;
}

.export-info-item span {
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.export-info-item.excel > i {
  background: #dcfce7;
  color: #166534;
}

.export-info-item.pdf > i {
  background: #fee2e2;
  color: #991b1b;
}

.export-info-item.csv > i {
  background: #dbeafe;
  color: #1d4ed8;
}

@media (max-width: 980px) {
  .report-filter-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions,
  .filter-actions :deep(.p-button) {
    width: 100%;
  }

  .export-actions {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .export-button-row,
  .export-actions :deep(.p-button) {
    width: 100%;
  }
}
</style>
