<script setup>
import { onMounted, reactive, ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import StatCard from '@/components/StatCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import PageActions from '@/components/ui/PageActions.vue'
import { getConfiguracion } from '@/services/configuracion.service'
import { getReporteMensual, getReporteSemanal } from '@/services/reportes.service'

const today = new Date().toISOString().slice(0, 10)
const start = new Date()
start.setDate(start.getDate() - 6)

const filtros = reactive({
  fechaInicio: start.toISOString().slice(0, 10),
  fechaFin: today,
  mes: new Date().getMonth() + 1,
  anio: new Date().getFullYear(),
})

const semanal = ref({ items: [], totals: { totalGeneral: 0 } })
const mensual = ref({
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

const money = (value) => `${simboloMoneda.value} ${Number(value || 0).toLocaleString('es-VE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`

const semanalColumns = [
  { key: 'numeroSobre', label: 'Sobre' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'totalSobre', label: 'Total' },
]

const mensualColumns = [
  { key: 'numeroSobre', label: 'Sobre' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'montoDiezmo', label: 'Diezmo' },
  { key: 'montoPactoAmor', label: 'Pacto amor' },
  { key: 'otrasOfrendas', label: 'Ofrendas' },
  { key: 'totalSobre', label: 'Total' },
]

const loadReportes = async () => {
  error.value = ''
  try {
    const [configuracionData, semanalData, mensualData] = await Promise.all([
      getConfiguracion(),
      getReporteSemanal({
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
      }),
      getReporteMensual({
        mes: filtros.mes,
        anio: filtros.anio,
      }),
    ])
    simboloMoneda.value = configuracionData.simboloMonedaPrincipal
    semanal.value = semanalData
    mensual.value = mensualData
  } catch (err) {
    error.value = err.message
  }
}

onMounted(loadReportes)
</script>

<template>
  <section class="page">
    <PageActions>
      <AppButton variant="secondary" @click="loadReportes">Actualizar</AppButton>
    </PageActions>

    <p v-if="error" class="status status-error">{{ error }}</p>

    <div class="grid grid-3">
      <StatCard label="Diezmos" :value="money(mensual.totals.totalDiezmos)" />
      <StatCard
        label="Pacto amor"
        :value="money(mensual.totals.totalPactoAmor)"
      />
      <StatCard
        label="Total general"
        :value="money(mensual.totals.totalGeneral)"
      />
    </div>

    <AppPanel title="Reporte semanal">
      <form class="panel-body form-grid" @submit.prevent="loadReportes">
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
      <DataTable :columns="semanalColumns" :rows="semanal.items" empty-text="Sin datos semanales." />
    </AppPanel>

    <AppPanel title="Reporte mensual">
      <template #actions>
        <strong>{{ money(mensual.totals.totalGeneral) }}</strong>
      </template>
      <form class="panel-body form-grid" @submit.prevent="loadReportes">
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
      <DataTable :columns="mensualColumns" :rows="mensual.items" empty-text="Sin datos mensuales." />
    </AppPanel>
  </section>
</template>
