<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import DataTable from '@/components/DataTable.vue'
import { iglesiaActivaId } from '@/services/iglesia-activa.service'
import { getOfrendas } from '@/services/ofrendas.service'
import { withMinimumDelay } from '@/utils/loading'

const ofrendas = ref([])
const error = ref('')
const loading = ref(false)

const money = (value) =>
  `$ ${Number(value || 0).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const columns = [
  { key: 'numeroSobre', label: 'Sobre', skeletonWidth: '38px' },
  { key: 'fechaSobre', label: 'Fecha', skeletonWidth: '86px' },
  { key: 'nombreMiembro', label: 'Miembro', skeletonWidth: '130px' },
  { key: 'nombreOfrenda', label: 'Nombre', skeletonWidth: '110px' },
  { key: 'montoOfrenda', label: 'Ofrenda', skeletonWidth: '74px' },
]

const tableRows = computed(() =>
  ofrendas.value.map((ofrenda) => ({
    ...ofrenda,
    nombreOfrenda: ofrenda.nombreOfrenda || '-',
    montoOfrenda: money(ofrenda.montoOfrenda),
  })),
)

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    ofrendas.value = await withMinimumDelay(() => getOfrendas())
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
watch(iglesiaActivaId, loadData)
</script>

<template>
  <section class="page">
    <p v-if="error" class="status status-error">{{ error }}</p>

    <DataTable :columns="columns" :rows="tableRows" :loading="loading" empty-text="Aun no hay ofrendas registradas.">
      <template #toolbarStart>
        <PButton icon="pi pi-refresh" severity="secondary" outlined :loading="loading" @click="loadData" />
      </template>
    </DataTable>
  </section>
</template>
