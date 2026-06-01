<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import DataTable from '@/components/DataTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
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

const money = (value) =>
  `$ ${Number(value || 0).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const columns = [
  { key: 'numeroSobre', label: 'Sobre', skeletonWidth: '38px' },
  { key: 'nombre', label: 'Miembro', skeletonWidth: '130px' },
  { key: 'fecha', label: 'Fecha', skeletonWidth: '86px' },
  { key: 'totalSobre', label: 'Total', skeletonWidth: '74px' },
]

const tableRows = computed(() =>
  reporte.value.items.map((item) => ({
    ...item,
    totalSobre: money(item.totalSobre),
  })),
)

const loadReporte = async () => {
  error.value = ''
  try {
    const reporteData = await getReporteSemanal({
      fechaInicio: filtros.fechaInicio,
      fechaFin: filtros.fechaFin,
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
      <DataTable :columns="columns" :rows="tableRows" empty-text="Sin datos semanales." />
    </AppPanel>
  </section>
</template>
