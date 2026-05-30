<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import DataTable from '@/components/DataTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import { getConfiguracion } from '@/services/configuracion.service'
import { iglesiaActivaId } from '@/services/iglesia-activa.service'
import { getReporteSemanal } from '@/services/reportes.service'

const today = new Date().toISOString().slice(0, 10)
const start = new Date()
start.setDate(start.getDate() - 6)

const filtros = reactive({
  fechaInicio: start.toISOString().slice(0, 10),
  fechaFin: today,
})

const reporte = ref({ items: [], totals: { totalGeneral: 0 } })
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
  { key: 'fecha', label: 'Fecha' },
  { key: 'totalSobre', label: 'Total' },
]

const loadReporte = async () => {
  error.value = ''
  try {
    const [configuracionData, reporteData] = await Promise.all([
      getConfiguracion(),
      getReporteSemanal({
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
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

    <AppPanel title="Reporte semanal">
      <template #actions>
        <strong>{{ money(reporte.totals.totalGeneral) }}</strong>
      </template>
      <form class="panel-body form-grid" @submit.prevent="loadReporte">
        <AppField id="inicio" label="Inicio">
          <AppInput id="inicio" v-model="filtros.fechaInicio" type="date" />
        </AppField>
        <AppField id="fin" label="Fin">
          <AppInput id="fin" v-model="filtros.fechaFin" type="date" />
        </AppField>
        <div class="button-row">
          <AppButton type="submit">Consultar</AppButton>
        </div>
      </form>
      <DataTable :columns="columns" :rows="reporte.items" empty-text="Sin datos semanales." />
    </AppPanel>
  </section>
</template>
