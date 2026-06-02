<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import DataTable from '@/components/DataTable.vue'
import { iglesiaActivaId } from '@/services/iglesia-activa.service'
import { getTransferencias } from '@/services/transferencias.service'
import { formatDateEs } from '@/utils/date'
import { withMinimumDelay } from '@/utils/loading'

const transferencias = ref([])
const error = ref('')
const loading = ref(false)

const money = (value) =>
  `$ ${Number(value || 0).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const columns = [
  { key: 'numeroSobre', label: 'Sobre', skeletonWidth: '38px' },
  { key: 'fechaTransferencia', label: 'Fecha', skeletonWidth: '86px' },
  { key: 'nombreMiembro', label: 'Miembro', skeletonWidth: '130px' },
  { key: 'numeroTransferencia', label: 'Operacion', skeletonWidth: '110px' },
  { key: 'bancoReceptorCuenta', label: 'Banco', skeletonWidth: '120px' },
  { key: 'montoTransferencia', label: 'Monto', skeletonWidth: '74px' },
]

const tableRows = computed(() =>
  transferencias.value.map((transferencia) => ({
    ...transferencia,
    fechaTransferencia: formatDateEs(transferencia.fechaTransferencia),
    montoTransferencia: money(transferencia.montoTransferencia),
  })),
)

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    transferencias.value = await withMinimumDelay(() => getTransferencias())
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

    <DataTable
      :columns="columns"
      :rows="tableRows"
      :loading="loading"
      empty-text="Aun no hay transferencias registradas."
    >
      <template #toolbarStart>
        <PButton icon="pi pi-refresh" severity="secondary" outlined :loading="loading" @click="loadData" />
      </template>
    </DataTable>
  </section>
</template>
