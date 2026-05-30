<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import DataTable from '@/components/DataTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import { getConfiguracion } from '@/services/configuracion.service'
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
const simboloMoneda = ref('Bs')

const money = (value) =>
  `${simboloMoneda.value} ${Number(value || 0).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const columns = [
  { key: 'numeroSobre', label: 'Sobre' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'montoDiezmo', label: 'Diezmo' },
  { key: 'montoPactoAmor', label: 'Pacto amor' },
  { key: 'otrasOfrendas', label: 'Ofrendas' },
  { key: 'totalSobre', label: 'Total' },
]

const loadReporte = async () => {
  error.value = ''
  try {
    const [configuracionData, reporteData] = await Promise.all([
      getConfiguracion(),
      getReporteMensual({
        mes: filtros.mes,
        anio: filtros.anio,
      }),
    ])

    simboloMoneda.value = configuracionData.simboloMonedaPrincipal
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
      <DataTable :columns="columns" :rows="reporte.items" empty-text="Sin datos mensuales." />
    </AppPanel>
  </section>
</template>
