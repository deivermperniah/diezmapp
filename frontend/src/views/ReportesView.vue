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

const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const buildFilename = (extension) =>
  `${tipoReporte.value}-${reportPeriod.value.replaceAll(' ', '-').replaceAll('/', '-')}.${extension}`

const sanitizePdfText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')

const escapePdfText = (value) =>
  sanitizePdfText(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')

const buildPdf = ({ title, period, headers, rows }) => {
  const color = ([r, g, b]) => `${r} ${g} ${b}`
  const text = (value, x, y, size = 10, bold = false, fill = [0.08, 0.12, 0.2]) =>
    `BT ${color(fill)} rg /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET`
  const line = (x1, y1, x2, y2, stroke = [0.83, 0.87, 0.92]) =>
    `q ${color(stroke)} RG ${x1} ${y1} m ${x2} ${y2} l S Q`
  const rect = (x, y, width, height, fill) => `q ${color(fill)} rg ${x} ${y} ${width} ${height} re f Q`
  const colX = [48, 104, 190, 456]
  const colWidths = [44, 76, 230, 80]
  const rowStartY = 652
  const rowHeight = 28
  const content = [
    rect(0, 0, 595, 842, [0.97, 0.98, 1]),
    rect(36, 742, 523, 70, [1, 1, 1]),
    line(36, 742, 559, 742),
    text(title, 52, 788, 20, true, [0.04, 0.1, 0.22]),
    text(period, 52, 766, 11, false, [0.39, 0.46, 0.56]),
    rect(36, 692, 523, 36, [0.09, 0.23, 0.47]),
    ...headers.map((header, index) => text(header, colX[index], 706, 10, true, [1, 1, 1])),
  ]

  rows.slice(0, 21).forEach((row, rowIndex) => {
    const rowY = rowStartY - rowIndex * rowHeight
    const textY = rowY + 10
    content.push(rect(36, rowY, 523, rowHeight, rowIndex % 2 === 0 ? [1, 1, 1] : [0.94, 0.96, 0.98]))

    headers.forEach((header, index) => {
      const value = String(row[header] ?? '')
      const maxLength = Math.floor(colWidths[index] / 5)
      const visibleValue = value.length > maxLength ? `${value.slice(0, Math.max(maxLength - 3, 1))}...` : value
      const isTotal = header.toLowerCase() === 'total'
      content.push(text(visibleValue, colX[index], textY, 10, isTotal, isTotal ? [0.04, 0.48, 0.29] : [0.08, 0.12, 0.2]))
    })
    content.push(line(36, rowY, 559, rowY))
  })

  content.push(text(`Registros: ${rows.length}`, 48, 48, 10, true, [0.39, 0.46, 0.56]))

  const stream = content.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return pdf
}

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
  const rows = exportRows.value.map((row) =>
    headers
      .map((header) => `"${String(row[header] ?? '').replaceAll('"', '""')}"`)
      .join(','),
  )

  downloadFile(
    `\uFEFF${headers.join(',')}\n${rows.join('\n')}`,
    buildFilename('csv'),
    'text/csv;charset=utf-8;',
  )
}

const exportExcel = () => {
  if (!ensureExportData()) return

  const headerCells = columns.value.map((column) => `<th>${column.label}</th>`).join('')
  const bodyRows = exportRows.value
    .map((row) => `<tr>${columns.value.map((column) => `<td>${row[column.label]}</td>`).join('')}</tr>`)
    .join('')

  downloadFile(
    `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body, table, th, td, p { font-family: Arial, sans-serif; font-size: 12px; }
            h2 { font-size: 12px; }
          </style>
        </head>
        <body>
          <h2>${reportTitle.value}</h2>
          <p>${reportPeriod.value}</p>
          <table border="1">
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </body>
      </html>
    `,
    buildFilename('xls'),
    'application/vnd.ms-excel;charset=utf-8;',
  )
}

const exportPdf = () => {
  if (!ensureExportData()) return

  const pdf = buildPdf({
    title: reportTitle.value,
    period: reportPeriod.value,
    headers: columns.value.map((column) => column.label),
    rows: exportRows.value,
  })

  downloadFile(pdf, buildFilename('pdf'), 'application/pdf')
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
            <span>Abre una vista lista para imprimir o guardar como PDF.</span>
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
