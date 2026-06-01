<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import DataTable from '@/components/DataTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import { iglesiaActivaId } from '@/services/iglesia-activa.service'
import { getReporteMensual } from '@/services/reportes.service'

const filtros = reactive({
  mes: new Date().getMonth() + 1,
  anio: new Date().getFullYear(),
})

const reporte = ref({
  items: [],
  totals: {
    totalDiezmos: 0,
    totalPactoAmor: 0,
    totalOfrendas: 0,
    totalGeneral: 0,
  },
})
const error = ref('')

const money = (value) =>
  `$ ${Number(value || 0).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const columns = [
  { key: 'numeroSobre', label: 'Sobre', skeletonWidth: '38px' },
  { key: 'nombre', label: 'Miembro', skeletonWidth: '130px' },
  { key: 'montoDiezmo', label: 'Diezmo', skeletonWidth: '74px' },
  { key: 'montoPactoAmor', label: 'Pacto amor', skeletonWidth: '74px' },
  { key: 'otrasOfrendas', label: 'Ofrendas', skeletonWidth: '74px' },
  { key: 'totalSobre', label: 'Total', skeletonWidth: '74px' },
]

const tableRows = computed(() =>
  reporte.value.items.map((item) => ({
    ...item,
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
  error.value = ''
  try {
    const reporteData = await getReporteMensual({
      mes: filtros.mes,
      anio: filtros.anio,
    })

    reporte.value = reporteData
  } catch (err) {
    error.value = err.message
  }
}

onMounted(loadReporte)
watch(iglesiaActivaId, loadReporte)
</script>

<template>
  <section class="page">
    <p v-if="error" class="status status-error">{{ error }}</p>

    <AppPanel title="Reporte mensual">
      <template #actions>
        <strong>{{ money(reporte.totals.totalGeneral) }}</strong>
      </template>
      <form class="panel-body form-grid" @submit.prevent="loadReporte">
        <AppField id="mes" label="Mes">
          <AppInput id="mes" v-model="filtros.mes" type="number" min="1" max="12" />
        </AppField>
        <AppField id="anio" label="Anio">
          <AppInput id="anio" v-model="filtros.anio" type="number" min="2000" />
        </AppField>
        <div class="button-row">
          <AppButton type="submit">Consultar</AppButton>
        </div>
      </form>
      <DataTable :columns="columns" :rows="tableRows" empty-text="Sin datos mensuales." />
      <div class="report-totals">
        <span>Diezmo: {{ monthlyTotals.montoDiezmo }}</span>
        <span>Pacto amor: {{ monthlyTotals.montoPactoAmor }}</span>
        <span>Ofrendas: {{ monthlyTotals.otrasOfrendas }}</span>
        <strong>Total: {{ monthlyTotals.totalSobre }}</strong>
      </div>
    </AppPanel>
  </section>
</template>

<style scoped>
.report-totals {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 14px;
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 800;
}

.report-totals strong {
  color: var(--color-ink);
}
</style>
