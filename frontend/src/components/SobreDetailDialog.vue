<script setup>
import { computed, ref, watch } from 'vue'
import { getSobre } from '@/services/sobres.service'
import { formatDateEs } from '@/utils/date'
import { withMinimumDelay } from '@/utils/loading'

const props = defineProps({
  visible: { type: Boolean, default: false },
  idSobre: { type: [String, Number], default: null },
})

const loading = ref(false)
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

const loadSobre = async () => {
  if (!props.idSobre || !props.visible) return

  loading.value = true
  error.value = ''

  try {
    sobre.value = await withMinimumDelay(() => getSobre(props.idSobre))
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

watch(() => [props.visible, props.idSobre], loadSobre, { immediate: true })
</script>

<template>
  <PDialog
    :visible="visible"
    modal
    header="Detalle del sobre"
    class="receipt-dialog"
    :style="{ width: 'min(460px, 94vw)' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div v-if="loading" class="receipt-loading">
      <div class="receipt-skeleton-head">
        <PSkeleton width="70px" height="1rem" />
        <PSkeleton width="190px" height="1rem" />
        <PSkeleton width="130px" height="1rem" />
      </div>

      <div class="receipt-skeleton-lines">
        <div class="receipt-skeleton-line">
          <PSkeleton width="80px" height="1rem" />
          <PSkeleton width="72px" height="1.1rem" />
        </div>
        <div class="receipt-skeleton-line">
          <PSkeleton width="96px" height="1rem" />
          <PSkeleton width="72px" height="1.1rem" />
        </div>
      </div>

      <PSkeleton width="100%" height="1px" />

      <div class="receipt-skeleton-box">
        <PSkeleton width="92px" height="1rem" />
        <div class="receipt-skeleton-line">
          <PSkeleton width="160px" height="1rem" />
          <PSkeleton width="64px" height="1rem" />
        </div>
        <div class="receipt-skeleton-line">
          <PSkeleton width="72px" height="1rem" />
          <PSkeleton width="64px" height="1rem" />
        </div>
      </div>

      <div class="receipt-skeleton-box">
        <PSkeleton width="120px" height="1rem" />
        <div class="receipt-skeleton-line">
          <PSkeleton width="210px" height="1rem" />
          <PSkeleton width="74px" height="1rem" />
        </div>
      </div>

      <div class="receipt-skeleton-total">
        <PSkeleton width="56px" height="1.3rem" />
        <PSkeleton width="96px" height="2rem" />
      </div>
    </div>

    <p v-else-if="error" class="status status-error">{{ error }}</p>

    <article v-else-if="sobre" class="receipt-card">
      <header class="receipt-head">
        <div class="receipt-meta-line">
          <span>Nro:</span>
          <strong>{{ sobre.numeroSobre }}</strong>
        </div>
        <div class="receipt-meta-line">
          <span>Miembro:</span>
          <strong>{{ sobre.nombreMiembro }}</strong>
        </div>
        <div class="receipt-meta-line">
          <span>Fecha:</span>
          <strong>{{ formatDateEs(sobre.fecha) }}</strong>
        </div>
      </header>

      <div class="receipt-lines">
        <div class="receipt-line">
          <span>Diezmo</span>
          <strong>{{ money(sobre.montoDiezmo) }}</strong>
        </div>
        <div class="receipt-line">
          <span>Pacto amor</span>
          <strong>{{ money(sobre.montoPactoAmor) }}</strong>
        </div>
      </div>

      <section v-if="sobre.ofrendas?.length" class="receipt-detail">
        <h4>Ofrendas</h4>
        <div v-for="ofrenda in sobre.ofrendas" :key="ofrenda.idOfrenda" class="receipt-subline with-dot">
          <span>{{ ofrenda.nombreOfrenda || 'Ofrenda' }}</span>
          <strong>{{ money(ofrenda.montoOfrenda) }}</strong>
        </div>
        <div class="receipt-subline transfer-total">
          <span>Total</span>
          <strong>{{ money(totalOfrendas) }}</strong>
        </div>
      </section>

      <section class="receipt-detail transfer-list">
        <h4>Transferencias</h4>
        <div v-for="transferencia in sobre.transferencias" :key="transferencia.idTransferencia" class="receipt-subline with-dot">
          <span>{{ transferencia.bancoReceptorCuenta }} - Ref. {{ transferencia.numeroTransferencia }}</span>
          <strong>{{ money(transferencia.montoTransferencia) }}</strong>
        </div>
        <div class="receipt-subline transfer-total">
          <span>Total transferido</span>
          <strong>{{ money(totalTransferencias) }}</strong>
        </div>
      </section>

      <div class="receipt-total">
        <span>Total</span>
        <strong>{{ money(sobre.totalIncluido) }}</strong>
      </div>
    </article>
  </PDialog>
</template>

<style scoped>
.receipt-loading {
  display: grid;
  gap: 16px;
}

.receipt-skeleton-head,
.receipt-skeleton-lines,
.receipt-skeleton-box {
  display: grid;
  gap: 8px;
}

.receipt-skeleton-head {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-line);
}

.receipt-skeleton-line,
.receipt-skeleton-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.receipt-skeleton-box {
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
}

.receipt-skeleton-total {
  padding: 14px 0;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line);
}

.receipt-card {
  display: grid;
  gap: 16px;
}

.receipt-head {
  display: grid;
  gap: 7px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-line);
}

.receipt-meta-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.receipt-head span,
.receipt-line span,
.receipt-subline span {
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 800;
}

.receipt-head strong {
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 900;
}

.receipt-lines,
.receipt-detail {
  display: grid;
  gap: 8px;
}

.receipt-line,
.receipt-subline,
.receipt-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.receipt-line strong,
.receipt-subline strong {
  color: var(--color-ink);
  font-weight: 900;
}

.with-dot span {
  position: relative;
  padding-left: 13px;
}

.with-dot span::before {
  position: absolute;
  top: 50%;
  left: 0;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--color-primary);
  content: '';
  transform: translateY(-50%);
}

.receipt-detail {
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
}

.receipt-total {
  padding: 14px 0;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line);
}

.receipt-total span {
  color: var(--color-ink);
  font-size: 18px;
  font-weight: 900;
}

.receipt-total strong {
  color: #16835f;
  font-size: 30px;
  font-weight: 900;
}

.receipt-detail h4 {
  margin: 0 0 2px;
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 900;
}

.transfer-total {
  padding-top: 0;
}
</style>
