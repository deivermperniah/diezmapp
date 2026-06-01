<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import DataTable from '@/components/DataTable.vue'
import { getSobres } from '@/services/sobres.service'
import { iglesiaActivaId } from '@/services/iglesia-activa.service'
import { withMinimumDelay } from '@/utils/loading'

const sobres = ref([])
const error = ref('')
const loading = ref(false)

const sobreColumns = [
  { key: 'numeroSobre', label: 'Sobre', skeletonWidth: '38px' },
  { key: 'fecha', label: 'Fecha', skeletonWidth: '86px' },
  { key: 'nombreMiembro', label: 'Miembro', skeletonWidth: '130px' },
  { key: 'montoDiezmo', label: 'Diezmo', skeletonWidth: '74px' },
  { key: 'montoPactoAmor', label: 'Pacto amor', skeletonWidth: '74px' },
  { key: 'totalIncluido', label: 'Total', skeletonWidth: '74px' },
]

const money = (value) =>
  `$ ${Number(value || 0).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const tableRows = computed(() =>
  sobres.value.map((sobre) => ({
    ...sobre,
    montoDiezmo: money(sobre.montoDiezmo),
    montoPactoAmor: money(sobre.montoPactoAmor),
    totalIncluido: money(sobre.totalIncluido),
  })),
)

const loadData = async () => {
  loading.value = true
  error.value = ''

  try {
    sobres.value = await withMinimumDelay(() => getSobres())
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
    <PToolbar class="section-toolbar">
      <template #start>
        <div>
          <h2>Historial de sobres</h2>
          <p>Sobres registrados para la iglesia activa.</p>
        </div>
      </template>
      <template #end>
        <PButton label="Exportar" icon="pi pi-download" severity="secondary" outlined disabled />
      </template>
    </PToolbar>

    <p v-if="error" class="status status-error">{{ error }}</p>

    <DataTable :columns="sobreColumns" :rows="tableRows" :loading="loading" empty-text="Aun no hay sobres registrados.">
      <template #toolbarStart>
        <PButton icon="pi pi-refresh" severity="secondary" outlined :loading="loading" @click="loadData" />
      </template>
    </DataTable>
  </section>
</template>
