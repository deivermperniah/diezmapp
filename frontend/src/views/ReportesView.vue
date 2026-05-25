<script setup>
import { onMounted, reactive, ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import StatCard from '@/components/StatCard.vue'
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

const money = (value) => `Bs ${Number(value || 0).toLocaleString('es-VE', {
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
    const [semanalData, mensualData] = await Promise.all([
      getReporteSemanal({
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
      }),
      getReporteMensual({
        mes: filtros.mes,
        anio: filtros.anio,
      }),
    ])
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
    <div class="page-actions">
      <button class="btn btn-secondary" type="button" @click="loadReportes">Actualizar</button>
    </div>

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

    <section class="panel">
      <div class="panel-header">
        <h3 class="panel-title">Reporte semanal</h3>
      </div>
      <form class="panel-body form-grid" @submit.prevent="loadReportes">
        <div class="field">
          <label for="inicio">Inicio</label>
          <input id="inicio" v-model="filtros.fechaInicio" class="control" type="date" />
        </div>
        <div class="field">
          <label for="fin">Fin</label>
          <input id="fin" v-model="filtros.fechaFin" class="control" type="date" />
        </div>
        <div class="button-row">
          <button class="btn btn-primary" type="submit">Consultar</button>
        </div>
      </form>
      <DataTable :columns="semanalColumns" :rows="semanal.items" empty-text="Sin datos semanales." />
    </section>

    <section class="panel">
      <div class="panel-header">
        <h3 class="panel-title">Reporte mensual</h3>
        <strong>{{ money(mensual.totals.totalGeneral) }}</strong>
      </div>
      <form class="panel-body form-grid" @submit.prevent="loadReportes">
        <div class="field">
          <label for="mes">Mes</label>
          <input id="mes" v-model="filtros.mes" class="control" min="1" max="12" type="number" />
        </div>
        <div class="field">
          <label for="anio">Anio</label>
          <input id="anio" v-model="filtros.anio" class="control" min="2000" type="number" />
        </div>
        <div class="button-row">
          <button class="btn btn-primary" type="submit">Consultar</button>
        </div>
      </form>
      <DataTable :columns="mensualColumns" :rows="mensual.items" empty-text="Sin datos mensuales." />
    </section>
  </section>
</template>
