<script setup>
import { onMounted, ref, watch } from 'vue'
import DataTable from '@/components/DataTable.vue'
import { getSobres } from '@/services/sobres.service'
import { iglesiaActivaId } from '@/services/iglesia-activa.service'
import { withMinimumDelay } from '@/utils/loading'

const sobres = ref([])
const error = ref('')
const loading = ref(false)

const sobreColumns = [
  { key: 'numeroSobre', label: 'Sobre' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'nombreMiembro', label: 'Miembro' },
  { key: 'montoDiezmo', label: 'Diezmo' },
  { key: 'montoPactoAmor', label: 'Pacto amor' },
  { key: 'totalIncluido', label: 'Total incluido' },
]

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

    <DataTable :columns="sobreColumns" :rows="sobres" :loading="loading" empty-text="Aun no hay sobres registrados.">
      <template #toolbarStart>
        <PButton icon="pi pi-refresh" severity="secondary" outlined :loading="loading" @click="loadData" />
      </template>
    </DataTable>
  </section>
</template>
