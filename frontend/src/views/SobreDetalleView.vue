<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import StatCard from '@/components/StatCard.vue'
import { getOfrendasBySobre } from '@/services/ofrendas.service'
import { getSobre } from '@/services/sobres.service'
import { getTransferenciasBySobre } from '@/services/transferencias.service'
import { formatDateEs } from '@/utils/date'
import { withMinimumDelay } from '@/utils/loading'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref('')
const sobre = ref(null)

const money = (value) =>
  `$ ${Number(value || 0).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const totalOfrendas = computed(() =>
  sobre.value?.ofrendas?.reduce((total, ofrenda) => total + Number(ofrenda.montoOfrenda || 0), 0) || 0,
)

const totalTransferencias = computed(() =>
  sobre.value?.transferencias?.reduce(
    (total, transferencia) => total + Number(transferencia.montoTransferencia || 0),
    0,
  ) || 0,
)

const ofrendaColumns = [
  { key: 'nombreOfrenda', label: 'Ofrenda' },
  { key: 'montoOfrenda', label: 'Monto' },
]

const transferenciaColumns = [
  { key: 'fechaTransferencia', label: 'Fecha' },
  { key: 'numeroTransferencia', label: 'Nro. transferencia' },
  { key: 'bancoReceptorCuenta', label: 'Banco' },
  { key: 'montoTransferencia', label: 'Monto' },
]

const ofrendaRows = computed(() =>
  (sobre.value?.ofrendas || []).map((ofrenda) => ({
    ...ofrenda,
    nombreOfrenda: ofrenda.nombreOfrenda || 'Sin nombre',
    montoOfrenda: money(ofrenda.montoOfrenda),
  })),
)

const transferenciaRows = computed(() =>
  (sobre.value?.transferencias || []).map((transferencia) => ({
    ...transferencia,
    fechaTransferencia: formatDateEs(transferencia.fechaTransferencia),
    montoTransferencia: money(transferencia.montoTransferencia),
  })),
)

const loadSobre = async () => {
  loading.value = true
  error.value = ''

  try {
    const [sobreData, ofrendas, transferencias] = await withMinimumDelay(() =>
      Promise.all([
        getSobre(route.params.id),
        getOfrendasBySobre(route.params.id),
        getTransferenciasBySobre(route.params.id),
      ]),
    )
    sobre.value = {
      ...sobreData,
      ofrendas,
      transferencias,
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadSobre)
</script>

<template>
  <section class="page">
    <div class="detail-actions">
      <PButton icon="pi pi-arrow-left" label="Volver" severity="secondary" outlined @click="router.back()" />
    </div>

    <p v-if="error" class="status status-error">{{ error }}</p>

    <template v-if="sobre">
      <div class="detail-heading">
        <div>
          <span class="eyebrow">Sobre #{{ sobre.numeroSobre }}</span>
          <h2>{{ sobre.nombreMiembro }}</h2>
        </div>
        <span class="detail-date">{{ formatDateEs(sobre.fecha) }}</span>
      </div>

      <div class="grid grid-3">
        <StatCard label="Diezmo" :value="money(sobre.montoDiezmo)" icon="pi pi-dollar" tone="green" />
        <StatCard label="Pacto amor" :value="money(sobre.montoPactoAmor)" icon="pi pi-heart" tone="gray" />
        <StatCard label="Ofrendas" :value="money(totalOfrendas)" icon="pi pi-gift" tone="blue" />
      </div>

      <div class="grid grid-2">
        <StatCard label="Total incluido" :value="money(sobre.totalIncluido)" icon="pi pi-wallet" tone="green" />
        <StatCard label="Transferencias" :value="money(totalTransferencias)" icon="pi pi-credit-card" tone="gray" />
      </div>

      <section class="detail-section">
        <h3>Ofrendas</h3>
        <DataTable
          :columns="ofrendaColumns"
          :rows="ofrendaRows"
          :searchable="false"
          empty-text="Este sobre no tiene ofrendas."
        />
      </section>

      <section class="detail-section">
        <h3>Transferencias</h3>
        <DataTable
          :columns="transferenciaColumns"
          :rows="transferenciaRows"
          :searchable="false"
          empty-text="Este sobre no tiene transferencias."
        />
      </section>
    </template>
  </section>
</template>

<style scoped>
.detail-actions {
  display: flex;
  justify-content: flex-start;
}

.detail-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.detail-heading h2 {
  margin: 4px 0 0;
  color: var(--color-ink);
  font-size: 24px;
  font-weight: 900;
}

.eyebrow,
.detail-date {
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 800;
}

.detail-section {
  display: grid;
  gap: 10px;
}

.detail-section h3 {
  margin: 0;
  color: var(--color-ink);
  font-size: 18px;
  font-weight: 900;
}

@media (max-width: 720px) {
  .detail-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
