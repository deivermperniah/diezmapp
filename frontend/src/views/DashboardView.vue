<script setup>
import { onMounted, ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import StatCard from '@/components/StatCard.vue'
import { getMiembros } from '@/services/miembros.service'
import { getOfrendas } from '@/services/ofrendas.service'
import { getReporteMensual } from '@/services/reportes.service'
import { getSobres } from '@/services/sobres.service'
import { getTransferencias } from '@/services/transferencias.service'

const loading = ref(true)
const error = ref('')
const miembros = ref([])
const sobres = ref([])
const ofrendas = ref([])
const transferencias = ref([])
const reporteMensual = ref({ totals: { totalGeneral: 0 }, items: [] })

const currentDate = new Date()
const currentMonth = currentDate.getMonth() + 1
const currentYear = currentDate.getFullYear()

const money = (value) => `Bs ${Number(value || 0).toLocaleString('es-VE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`

const columns = [
  { key: 'numeroSobre', label: 'Sobre' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'totalSobre', label: 'Total' },
]

const loadDashboard = async () => {
  loading.value = true
  error.value = ''

  try {
    const [miembrosData, sobresData, ofrendasData, transferenciasData, reporteData] =
      await Promise.all([
        getMiembros(),
        getSobres(),
        getOfrendas(),
        getTransferencias(),
        getReporteMensual({ mes: currentMonth, anio: currentYear }),
      ])

    miembros.value = miembrosData
    sobres.value = sobresData
    ofrendas.value = ofrendasData
    transferencias.value = transferenciasData
    reporteMensual.value = reporteData
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <section class="page">
    <div class="page-header">
      <div>
        <p class="page-kicker">Resumen general</p>
        <h2 class="page-title">Dashboard</h2>
        <p class="page-subtitle">Vista rapida del movimiento registrado en DIEZMAPP.</p>
      </div>
      <button class="btn btn-secondary" type="button" @click="loadDashboard">Actualizar</button>
    </div>

    <p v-if="error" class="status status-error">{{ error }}</p>
    <p v-else-if="loading" class="status">Cargando informacion...</p>

    <div class="grid grid-3">
      <StatCard label="Miembros" :value="miembros.length" detail="Registrados en la iglesia" />
      <StatCard label="Sobres" :value="sobres.length" detail="Sobres cargados" />
      <StatCard
        label="Total del mes"
        :value="money(reporteMensual.totals.totalGeneral)"
        :detail="`Mes ${currentMonth}/${currentYear}`"
      />
    </div>

    <div class="grid grid-3">
      <StatCard label="Ofrendas" :value="ofrendas.length" detail="Colaboraciones registradas" />
      <StatCard
        label="Transferencias"
        :value="transferencias.length"
        detail="Operaciones bancarias"
      />
      <StatCard
        label="Diezmos del mes"
        :value="money(reporteMensual.totals.totalDiezmos)"
        detail="Solo monto diezmo"
      />
    </div>

    <section class="panel">
      <div class="panel-header">
        <h3 class="panel-title">Movimiento mensual</h3>
      </div>
      <DataTable
        :columns="columns"
        :rows="reporteMensual.items"
        empty-text="Aun no hay sobres para este mes."
      />
    </section>
  </section>
</template>
