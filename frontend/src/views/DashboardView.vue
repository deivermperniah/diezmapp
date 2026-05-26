<script setup>
import { onMounted, ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import StatCard from '@/components/StatCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import PageActions from '@/components/ui/PageActions.vue'
import { getConfiguracion } from '@/services/configuracion.service'
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
const simboloMoneda = ref('Bs')

const currentDate = new Date()
const currentMonth = currentDate.getMonth() + 1
const currentYear = currentDate.getFullYear()

const money = (value) => `${simboloMoneda.value} ${Number(value || 0).toLocaleString('es-VE', {
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
    const [configuracionData, miembrosData, sobresData, ofrendasData, transferenciasData, reporteData] =
      await Promise.all([
        getConfiguracion(),
        getMiembros(),
        getSobres(),
        getOfrendas(),
        getTransferencias(),
        getReporteMensual({ mes: currentMonth, anio: currentYear }),
      ])

    simboloMoneda.value = configuracionData.simboloMonedaPrincipal
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
    <PageActions>
      <AppButton variant="secondary" @click="loadDashboard">Actualizar</AppButton>
    </PageActions>

    <p v-if="error" class="status status-error">{{ error }}</p>
    <p v-else-if="loading" class="status">Cargando informacion...</p>

    <div class="grid grid-3">
      <StatCard label="Miembros" :value="miembros.length" />
      <StatCard label="Sobres" :value="sobres.length" />
      <StatCard
        label="Total del mes"
        :value="money(reporteMensual.totals.totalGeneral)"
      />
    </div>

    <div class="grid grid-3">
      <StatCard label="Ofrendas" :value="ofrendas.length" />
      <StatCard label="Transferencias" :value="transferencias.length" />
      <StatCard
        label="Diezmos del mes"
        :value="money(reporteMensual.totals.totalDiezmos)"
      />
    </div>

    <AppPanel title="Movimiento mensual">
      <DataTable
        :columns="columns"
        :rows="reporteMensual.items"
        empty-text="Aun no hay sobres para este mes."
      />
    </AppPanel>
  </section>
</template>
