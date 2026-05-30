<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import DataTable from '@/components/DataTable.vue'
import StatCard from '@/components/StatCard.vue'
import { getConfiguracion } from '@/services/configuracion.service'
import { iglesiaActivaId } from '@/services/iglesia-activa.service'
import { getMiembros } from '@/services/miembros.service'
import { getReporteMensual } from '@/services/reportes.service'
import { getSobres } from '@/services/sobres.service'
import { withMinimumDelay } from '@/utils/loading'

const loading = ref(true)
const loadingCards = ref(true)
const error = ref('')
const miembros = ref([])
const sobres = ref([])
const reporteMensual = ref({ totals: { totalGeneral: 0 }, items: [] })
const simboloMoneda = ref('Bs')

const currentDate = new Date()
const currentMonth = currentDate.getMonth() + 1
const currentYear = currentDate.getFullYear()

const money = (value) => `${simboloMoneda.value} ${Number(value || 0).toLocaleString('es-VE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`

const totalGeneral = computed(() =>
  sobres.value.reduce((total, sobre) => total + Number(sobre.totalIncluido || 0), 0),
)

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
    const [configuracionData, miembrosData, sobresData, reporteData] =
      await withMinimumDelay(() => Promise.all([
        getConfiguracion(),
        getMiembros(),
        getSobres(),
        getReporteMensual({ mes: currentMonth, anio: currentYear }),
      ]))

    simboloMoneda.value = configuracionData.simboloMonedaPrincipal
    miembros.value = miembrosData
    sobres.value = sobresData
    reporteMensual.value = reporteData
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
    loadingCards.value = false
  }
}

onMounted(loadDashboard)
watch(iglesiaActivaId, loadDashboard)
</script>

<template>
  <section class="page">
    <p v-if="error" class="status status-error">{{ error }}</p>

    <div class="grid grid-3">
      <StatCard label="Miembros" :value="miembros.length" icon="pi pi-users" :loading="loadingCards" />
      <StatCard label="Sobres" :value="sobres.length" icon="pi pi-inbox" tone="gray" :loading="loadingCards" />
      <StatCard
        label="Total general"
        :value="money(totalGeneral)"
        icon="pi pi-dollar"
        tone="green"
        :loading="loadingCards"
      />
    </div>

    <h2 class="section-title">Últimos sobres registrados</h2>

    <section class="section-block">

    <DataTable
      :columns="columns"
      :rows="reporteMensual.items"
      :loading="loading"
      empty-text="Aun no hay sobres para este mes."
    >
      <template #toolbarStart>
        <PButton icon="pi pi-refresh" severity="secondary" outlined :loading="loading" @click="loadDashboard" />
      </template>
    </DataTable>
    </section>
  </section>
</template>

<style scoped>
.section-heading h3 {
  margin-top: 0;
}

.section-title {
  margin: 0;
  color: var(--color-ink);
  font-size: 18px;
  font-weight: 900;
}
</style>
