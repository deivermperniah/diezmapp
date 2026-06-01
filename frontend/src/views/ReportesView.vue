<script setup>
import { computed, reactive, ref, watch } from 'vue'
import DataTable from '@/components/DataTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import { iglesiaActivaId } from '@/services/iglesia-activa.service'
import { getReporteMensual, getReporteSemanal } from '@/services/reportes.service'
import { withMinimumDelay } from '@/utils/loading'

const today = new Date().toISOString().slice(0, 10)
const start = new Date()
start.setDate(start.getDate() - 6)

const tipoReporte = ref('mensual')
const filtros = reactive({
  fechaInicio: start.toISOString().slice(0, 10),
  fechaFin: today,
  mes: new Date().getMonth() + 1,
  anio: new Date().getFullYear(),
})

const reporte = ref({ items: [], totals: { totalGeneral: 0 } })
const error = ref('')
const loading = ref(false)
const consulted = ref(false)

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
    filtros.fechaInicio = toDateString(value)
  },
})

const fechaFinSemanal = computed({
  get: () => {
    const [year, month, day] = String(filtros.fechaFin).split('-').map(Number)
    return new Date(year, month - 1, day)
  },
  set: (value) => {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return
    filtros.fechaFin = toDateString(value)
  },
})

const toDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const money = (value) =>
  `$ ${Number(value || 0).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

const semanalColumns = [
  { key: 'numeroSobre', label: 'Sobre', skeletonWidth: '38px' },
  { key: 'nombre', label: 'Miembro', skeletonWidth: '130px' },
  { key: 'fecha', label: 'Fecha', skeletonWidth: '86px' },
  { key: 'totalSobre', label: 'Total', skeletonWidth: '74px' },
]

const mensualColumns = [
  { key: 'numeroSobre', label: 'Sobre', skeletonWidth: '38px' },
  { key: 'nombre', label: 'Miembro', skeletonWidth: '130px' },
  { key: 'montoDiezmo', label: 'Diezmo', skeletonWidth: '74px' },
  { key: 'montoPactoAmor', label: 'Pacto amor', skeletonWidth: '74px' },
  { key: 'otrasOfrendas', label: 'Ofrendas', skeletonWidth: '74px' },
  { key: 'totalSobre', label: 'Total', skeletonWidth: '74px' },
]

const columns = computed(() => (tipoReporte.value === 'semanal' ? semanalColumns : mensualColumns))
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
    fecha: formatDate(item.fecha),
    montoDiezmo: money(item.montoDiezmo),
    montoPactoAmor: money(item.montoPactoAmor),
    otrasOfrendas: money(item.otrasOfrendas),
    totalSobre: money(item.totalSobre),
  })),
)

const monthlyTotals = computed(() => ({
  montoDiezmo: money(reporte.value.totals?.totalDiezmos),
  montoPactoAmor: money(reporte.value.totals?.totalPactoAmor),
  otrasOfrendas: money(reporte.value.totals?.totalOfrendas),
  totalSobre: money(reporte.value.totals?.totalGeneral),
}))

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
              fluid
            />
          </AppField>

          <AppField id="fechaFin" label="Fin" class="compact-field">
            <PDatePicker
              input-id="fechaFin"
              v-model="fechaFinSemanal"
              date-format="dd/mm/yy"
              show-icon
              fluid
            />
          </AppField>
        </template>

        <div class="filter-actions">
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

      <div v-if="tipoReporte === 'mensual' && consulted" class="report-totals">
        <span>Diezmo: {{ monthlyTotals.montoDiezmo }}</span>
        <span>Pacto amor: {{ monthlyTotals.montoPactoAmor }}</span>
        <span>Ofrendas: {{ monthlyTotals.otrasOfrendas }}</span>
        <strong>Total: {{ monthlyTotals.totalSobre }}</strong>
      </div>
    </section>
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
}

.report-card :deep(.report-table) {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.report-totals {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  padding: 14px 20px;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 800;
}

.report-totals strong {
  color: var(--color-ink);
}

@media (max-width: 980px) {
  .report-filter-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions,
  .filter-actions :deep(.p-button) {
    width: 100%;
  }
}
</style>
