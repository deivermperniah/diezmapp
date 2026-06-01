<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import FormDialog from '@/components/ui/FormDialog.vue'
import { getTasaDolar } from '@/services/configuracion.service'

const props = defineProps({
  visible: { type: Boolean, default: false },
  miembros: { type: Array, default: () => [] },
  monedas: { type: Array, default: () => [] },
  siguiente: { type: Object, default: null },
  sobre: { type: Object, default: null },
  saving: { type: Boolean, default: false },
  idMiembroSeleccionado: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:visible', 'save', 'date-change', 'create-member', 'clear-miembro-seleccionado'])

const today = new Date().toISOString().slice(0, 10)
const createKey = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const currentStep = ref(1)
const tasaDolar = ref(null)

const steps = [
  { id: 1, label: 'Datos generales', icon: 'pi pi-id-card' },
  { id: 2, label: 'Diezmos y pacto', icon: 'pi pi-dollar' },
  { id: 3, label: 'Ofrendas', icon: 'pi pi-heart' },
  { id: 4, label: 'Transferencias', icon: 'pi pi-credit-card' },
]

const offeringPlaceholders = ['Ej. Ayuda niños', 'Ej. Misiones', 'Ej. Alimentos', 'Ej. Escuela biblica']
const transferNumberPlaceholders = ['Ej. 00012345', 'Ej. 987654321', 'Ej. 20260531001', 'Ej. REF-4582']
const bankPlaceholders = ['Ej. Banesco', 'Ej. Bco. Venezuela', 'Ej. Provincial', 'Ej. Mercantil']
const memberLabel = (miembro) =>
  miembro?.nombreCompleto || [miembro?.nombre, miembro?.apellido].filter(Boolean).join(' ')

const form = reactive({
  fecha: today,
  idMiembro: '',
  idMonedaGlobal: '',
  montoDiezmo: '',
  montoPactoAmor: '',
  ofrendas: [],
  transferencias: [],
})

const newOfrenda = () => ({
  key: createKey(),
  nombreOfrenda: '',
  montoOfrenda: '',
  idMoneda: form.idMonedaGlobal || props.monedas[0]?.idMoneda || '$',
})

const newTransferencia = () => ({
  key: createKey(),
  fechaTransferencia: form.fecha || today,
  numeroTransferencia: '',
  bancoReceptorCuenta: '',
  montoTransferencia: '',
  idMoneda: form.idMonedaGlobal || props.monedas[0]?.idMoneda || '$',
})

const resetForm = () => {
  const dollarCurrency = props.monedas.find((moneda) => moneda.simbolo === '$')?.idMoneda || '$'

  form.fecha = props.sobre?.fecha || today
  form.idMiembro = props.sobre?.idMiembro || ''
  form.idMonedaGlobal = props.sobre ? dollarCurrency : form.idMonedaGlobal || props.monedas[0]?.idMoneda || '$'
  form.montoDiezmo = props.sobre?.montoDiezmo ?? ''
  form.montoPactoAmor = props.sobre?.montoPactoAmor ?? ''
  form.ofrendas = props.sobre?.ofrendas?.length
    ? props.sobre.ofrendas.map((ofrenda) => ({
        key: createKey(),
        nombreOfrenda: ofrenda.nombreOfrenda || '',
        montoOfrenda: ofrenda.montoOfrenda ?? '',
        idMoneda: dollarCurrency,
      }))
    : [newOfrenda()]
  form.transferencias = props.sobre?.transferencias?.length
    ? props.sobre.transferencias.map((transferencia) => ({
        key: createKey(),
        fechaTransferencia: transferencia.fechaTransferencia || form.fecha || today,
        numeroTransferencia: transferencia.numeroTransferencia || '',
        bancoReceptorCuenta: transferencia.bancoReceptorCuenta || '',
        montoTransferencia: transferencia.montoTransferencia ?? '',
        idMoneda: dollarCurrency,
      }))
    : [newTransferencia()]
  currentStep.value = 1
}

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const canGoNext = computed(() => {
  if (currentStep.value === 1) {
    return form.idMonedaGlobal && form.fecha && form.idMiembro
  }
  return true
})

const canSubmit = computed(() => {
  return totalCapturado.value > 0 && totalTransferencias.value > 0 && totalsMatch.value
})

const selectedCurrencyLabel = computed(() => {
  const moneda = props.monedas.find((item) => item.idMoneda === form.idMonedaGlobal)
  return moneda?.simbolo || form.idMonedaGlobal || '$'
})

const isBolivarSelected = computed(() => selectedCurrencyLabel.value === 'Bs' || selectedCurrencyLabel.value === 'Bs.')
const hasValidRate = computed(() => !isBolivarSelected.value || Number(tasaDolar.value || 0) > 0)
const amountLabel = (label) => `${label} (${selectedCurrencyLabel.value})`
const formatUsd = (value) =>
  Number(value || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const parseAmount = (amount) => {
  if (typeof amount === 'number') return amount
  const normalizedAmount = String(amount || '')
    .replace(/\./g, '')
    .replace(',', '.')
  return Number(normalizedAmount || 0)
}
const amountToUsd = (amount) => {
  const numericAmount = parseAmount(amount)
  const rate = Number(tasaDolar.value || 0)

  if (!isBolivarSelected.value) return Number(numericAmount.toFixed(2))
  return rate ? Number((numericAmount / rate).toFixed(2)) : 0
}
const equivalentUsd = (amount) => {
  if (!isBolivarSelected.value) return ''
  return `$ ${formatUsd(amountToUsd(amount))}`
}
const equivalentUsdAmount = (amount) => equivalentUsd(amount).replace('$ ', '') || '0,00'

const loadDollarRate = async () => {
  if (tasaDolar.value) return
  try {
    const tasa = await getTasaDolar()
    tasaDolar.value = tasa.valor
  } catch {
    tasaDolar.value = null
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      resetForm()
      loadDollarRate()
    }
  },
)

watch(
  () => [props.miembros, props.monedas],
  () => {
    form.idMonedaGlobal ||= props.monedas[0]?.idMoneda || '$'
    if (form.ofrendas.length === 0) form.ofrendas = [newOfrenda()]
    if (form.transferencias.length === 0) form.transferencias = [newTransferencia()]
  },
  { immediate: true },
)

watch(
  () => props.idMiembroSeleccionado,
  (nuevoId) => {
    if (nuevoId) {
      form.idMiembro = nuevoId
    }
  },
)

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      emit('clear-miembro-seleccionado')
    }
  },
)

watch(
  () => form.idMonedaGlobal,
  (idMoneda) => {
    form.ofrendas.forEach((ofrenda) => {
      ofrenda.idMoneda = idMoneda
    })
    form.transferencias.forEach((transferencia) => {
      transferencia.idMoneda = idMoneda
    })
    if (isBolivarSelected.value) loadDollarRate()
  },
)

const totalCapturado = computed(() => {
  const diezmo = amountToUsd(form.montoDiezmo)
  const pacto = amountToUsd(form.montoPactoAmor)
  const ofrendas = form.ofrendas.reduce((total, ofrenda) => total + amountToUsd(ofrenda.montoOfrenda), 0)
  return Number((diezmo + pacto + ofrendas).toFixed(2))
})

const totalCapturadoOriginal = computed(() => {
  const diezmo = parseAmount(form.montoDiezmo)
  const pacto = parseAmount(form.montoPactoAmor)
  const ofrendas = form.ofrendas.reduce((total, ofrenda) => total + parseAmount(ofrenda.montoOfrenda), 0)
  return Number((diezmo + pacto + ofrendas).toFixed(2))
})

const totalTransferencias = computed(() =>
  Number(
    form.transferencias
      .reduce((total, transferencia) => total + amountToUsd(transferencia.montoTransferencia), 0)
      .toFixed(2),
  ),
)

const totalsMatch = computed(() => {
  if (!hasValidRate.value) return false
  return Math.abs(totalCapturado.value - totalTransferencias.value) <= 0.01
})

const addOfrenda = () => {
  form.ofrendas.push(newOfrenda())
}

const removeOfrenda = (index) => {
  form.ofrendas.splice(index, 1)
  if (form.ofrendas.length === 0) addOfrenda()
}

const addTransferencia = () => {
  form.transferencias.push(newTransferencia())
}

const removeTransferencia = (index) => {
  form.transferencias.splice(index, 1)
  if (form.transferencias.length === 0) addTransferencia()
}

const submit = () => {
  if (!canSubmit.value) return

  emit('save', {
    fecha: form.fecha,
    idMiembro: form.idMiembro,
    montoDiezmo: parseAmount(form.montoDiezmo),
    idMonedaDiezmo: form.idMonedaGlobal,
    montoPactoAmor: parseAmount(form.montoPactoAmor),
    idMonedaPacto: form.idMonedaGlobal,
    ofrendas: form.ofrendas
      .filter((ofrenda) => parseAmount(ofrenda.montoOfrenda) > 0)
      .map(({ nombreOfrenda, montoOfrenda, idMoneda }) => ({
        nombreOfrenda,
        montoOfrenda: parseAmount(montoOfrenda),
        idMoneda,
      })),
    transferencias: form.transferencias.map(
      ({
        fechaTransferencia,
        numeroTransferencia,
        bancoReceptorCuenta,
        montoTransferencia,
        idMoneda,
      }) => ({
        fechaTransferencia,
        numeroTransferencia,
        bancoReceptorCuenta,
        montoTransferencia: parseAmount(montoTransferencia),
        idMoneda,
      }),
    ),
  })
}
</script>

<template>
  <FormDialog
    :visible="visible"
    :title="sobre ? 'Editar sobre' : 'Nuevo sobre'"
    icon="pi pi-inbox"
    submit-label="Guardar sobre"
    :saving="saving"
    width="min(500px, 94vw)"
    hide-footer
    @update:visible="$emit('update:visible', $event)"
    @submit="submit"
  >
    <div class="stepper-container">
      <div class="stepper-header">
        <div class="stepper-steps">
          <div
            v-for="step in steps"
            :key="step.id"
            v-tooltip.top="step.label"
            :class="['step-item', { active: currentStep === step.id, completed: currentStep > step.id }]"
            @click="currentStep > step.id ? (currentStep = step.id) : null"
          >
            <i :class="step.icon" aria-hidden="true"></i>
          </div>
        </div>
      </div>

      <div class="step-content">
        <div class="step-form-grid">
          <div v-if="currentStep === 1" class="first-row">
            <AppField v-if="siguiente || sobre" id="numeroSobre" label="Nro. Sobre">
              <AppInput id="numeroSobre" class="envelope-number" :model-value="sobre?.numeroSobre || siguiente?.siguienteNumero" type="number" readonly />
            </AppField>

            <AppField id="monedaGlobal" label="Moneda">
              <AppSelect id="monedaGlobal" v-model="form.idMonedaGlobal" :options="monedas" option-label="simbolo" option-value="idMoneda">
                <template #option="{ option }">{{ option.simbolo }}</template>
                <template #value="{ option, placeholder }">
                  {{ option ? option.simbolo : placeholder }}
                </template>
              </AppSelect>
            </AppField>

            <AppField id="fecha" label="Fecha">
              <AppInput id="fecha" v-model="form.fecha" type="date" @change="$emit('date-change', form.fecha)" />
            </AppField>
          </div>

          <AppField v-if="currentStep === 1" id="miembro" label="Miembro">
            <div class="member-picker">
              <AppSelect
                id="miembro"
                v-model="form.idMiembro"
                :options="miembros"
                option-label="nombreCompleto"
                option-value="idMiembro"
                placeholder="Selecciona"
                overlay-class="member-select-panel"
                scroll-height="8.25rem"
                filter
              >
                <template #option="{ option }">{{ memberLabel(option) }}</template>
                <template #value="{ option, placeholder }">
                  {{ option ? memberLabel(option) : placeholder }}
                </template>
              </AppSelect>
              <PButton
                v-tooltip.top="'Nuevo miembro'"
                icon="pi pi-user-plus"
                aria-label="Nuevo miembro"
                outlined
                @click="$emit('create-member')"
              />
            </div>
          </AppField>

          <div v-if="currentStep === 2" :class="['amount-pair', { single: !isBolivarSelected }]">
            <AppField id="diezmo" :label="amountLabel('Diezmo')">
              <AppInput id="diezmo" v-model="form.montoDiezmo" type="number" min="0" step="0.01" placeholder="0,00" required />
            </AppField>

            <AppField v-if="isBolivarSelected" id="diezmo-equivalente" label="Equivalente ($)">
              <AppInput id="diezmo-equivalente" class="equivalent-input" :model-value="equivalentUsdAmount(form.montoDiezmo)" readonly />
            </AppField>
          </div>

          <div v-if="currentStep === 2" :class="['amount-pair', { single: !isBolivarSelected }]">
            <AppField id="pacto" :label="amountLabel('Pacto amor')">
              <AppInput id="pacto" v-model="form.montoPactoAmor" type="number" min="0" step="0.01" placeholder="0,00" />
            </AppField>

            <AppField v-if="isBolivarSelected" id="pacto-equivalente" label="Equivalente ($)">
              <AppInput id="pacto-equivalente" class="equivalent-input" :model-value="equivalentUsdAmount(form.montoPactoAmor)" readonly />
            </AppField>
          </div>

          <section v-if="currentStep === 3" class="form-section">
            <div class="section-heading">
              <strong>Ofrendas</strong>
              <PButton
                v-tooltip.top="'Agregar ofrenda'"
                class="add-line-button"
                icon="pi pi-plus"
                aria-label="Agregar ofrenda"
                @click="addOfrenda"
              />
            </div>

            <div v-for="(ofrenda, index) in form.ofrendas" :key="ofrenda.key" class="line-grid amount-line">
              <div class="offering-fields">
                <AppField :id="`nombre-ofrenda-${ofrenda.key}`" label="Nombre">
                  <AppInput
                    :id="`nombre-ofrenda-${ofrenda.key}`"
                    v-model="ofrenda.nombreOfrenda"
                    :placeholder="offeringPlaceholders[index % offeringPlaceholders.length]"
                  />
                </AppField>

                <AppField :id="`ofrenda-${ofrenda.key}`" :label="amountLabel('Monto')">
                  <AppInput :id="`ofrenda-${ofrenda.key}`" v-model="ofrenda.montoOfrenda" type="number" min="0" step="0.01" placeholder="0,00" />
                </AppField>

                <AppField v-if="isBolivarSelected" :id="`ofrenda-equivalente-${ofrenda.key}`" label="Equivalente ($)">
                  <AppInput :id="`ofrenda-equivalente-${ofrenda.key}`" class="equivalent-input" :model-value="equivalentUsdAmount(ofrenda.montoOfrenda)" readonly />
                </AppField>

                <PButton
                  v-tooltip.top="'Quitar ofrenda'"
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  aria-label="Quitar ofrenda"
                  @click="removeOfrenda(index)"
                />
              </div>
            </div>
          </section>

          <section v-if="currentStep === 4" class="form-section">
            <div class="section-heading">
              <strong>Transferencias</strong>
              <PButton v-tooltip.top="'Agregar transferencia'" class="add-line-button" icon="pi pi-plus" aria-label="Agregar transferencia" @click="addTransferencia" />
            </div>

            <div v-for="(transferencia, index) in form.transferencias" :key="transferencia.key" class="transfer-line">
              <div class="transfer-fields">
                <AppField :id="`fecha-transferencia-${transferencia.key}`" label="Fecha">
                  <AppInput :id="`fecha-transferencia-${transferencia.key}`" v-model="transferencia.fechaTransferencia" type="date" />
                </AppField>

                <AppField :id="`numero-transferencia-${transferencia.key}`" label="Nro. transferencia">
                  <AppInput
                    :id="`numero-transferencia-${transferencia.key}`"
                    v-model="transferencia.numeroTransferencia"
                    :placeholder="transferNumberPlaceholders[index % transferNumberPlaceholders.length]"
                  />
                </AppField>

                <AppField :id="`banco-transferencia-${transferencia.key}`" label="Banco">
                  <AppInput
                    :id="`banco-transferencia-${transferencia.key}`"
                    v-model="transferencia.bancoReceptorCuenta"
                    :placeholder="bankPlaceholders[index % bankPlaceholders.length]"
                  />
                </AppField>

                <AppField :id="`monto-transferencia-${transferencia.key}`" :label="amountLabel('Monto')">
                  <AppInput :id="`monto-transferencia-${transferencia.key}`" v-model="transferencia.montoTransferencia" type="number" min="0" step="0.01" placeholder="0,00" />
                </AppField>

                <AppField v-if="isBolivarSelected" :id="`transferencia-equivalente-${transferencia.key}`" label="Equivalente ($)">
                  <AppInput
                    :id="`transferencia-equivalente-${transferencia.key}`"
                    class="equivalent-input"
                    :model-value="equivalentUsdAmount(transferencia.montoTransferencia)"
                    readonly
                  />
                </AppField>

                <PButton
                  v-tooltip.top="'Quitar transferencia'"
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  aria-label="Quitar transferencia"
                  @click="removeTransferencia(index)"
                />
              </div>
            </div>
          </section>

          <div v-if="currentStep === 4" class="totals-strip">
            <span v-if="isBolivarSelected">Total: Bs {{ formatUsd(totalCapturadoOriginal) }} = $ {{ formatUsd(totalCapturado) }}</span>
            <span v-else>Total: $ {{ formatUsd(totalCapturado) }}</span>
            <span>Transferencias: $ {{ formatUsd(totalTransferencias) }}</span>
          </div>
        </div>

        <div class="step-actions">
          <PButton v-if="currentStep > 1" label="Anterior" severity="secondary" outlined @click="prevStep" />
          <PButton v-if="currentStep < 4" label="Siguiente" :disabled="!canGoNext" @click="nextStep" />
          <PButton v-if="currentStep === 4" label="Guardar sobre" :disabled="!canSubmit" @click="submit" />
        </div>
      </div>
    </div>
  </FormDialog>
</template>

<style scoped>
.stepper-container {
  padding: 0;
}

.stepper-header {
  margin-bottom: 0;
}

.stepper-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.step-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 8px;
  border-radius: 8px;
  background: #eef2f7;
  cursor: default;
  transition: all 0.2s;
}

.step-item.completed {
  background: #dbeafe;
  cursor: pointer;
}

.step-item.completed:hover {
  background: #bfdbfe;
}

.step-item.active {
  background: #2563eb;
}

.step-item i {
  color: var(--color-muted);
  font-size: 16px;
}

.step-item.active i,
.step-item.completed i {
  color: white;
}

.step-content {
  padding: 0;
  margin-top: 20px;
}

.step-form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.first-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
  grid-column: 1 / -1;
}

.first-row .field:last-child {
  grid-column: 1 / -1;
}

.envelope-number {
  font-weight: 900;
}

.equivalent-input {
  color: #065f46;
  font-weight: 900;
}

.amount-pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
}

.amount-pair.single {
  grid-template-columns: 1fr;
}

.step-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 0;
  padding-top: 0;
}

.form-section {
  display: grid;
  gap: 20px;
  padding-top: 4px;
  grid-column: 1 / -1;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-heading strong {
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 900;
}

.add-line-button {
  width: 34px;
  min-width: 34px;
  height: 34px;
  padding: 0;
}

.line-grid,
.transfer-line {
  display: grid;
  gap: 12px;
  align-items: start;
}

.amount-line {
  position: relative;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.offering-fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 42px;
  gap: 12px;
  align-items: start;
}

.offering-fields .field:first-child {
  grid-column: 1 / -1;
}

.offering-fields .p-button {
  grid-column: 3;
  grid-row: 2;
  align-self: start;
  margin-top: 26px;
}

.transfer-line {
  position: relative;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  align-items: center;
}

.amount-line + .amount-line,
.transfer-line + .transfer-line {
  margin-top: 0;
}

.transfer-fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 42px;
  gap: 12px;
  align-items: start;
}

.transfer-fields .field:nth-child(1) {
  grid-column: 1;
  grid-row: 1;
}

.transfer-fields .field:nth-child(2) {
  grid-column: 2 / 4;
  grid-row: 1;
}

.transfer-fields .field:nth-child(3) {
  grid-column: 1 / 4;
  grid-row: 2;
}

.transfer-fields .field:nth-child(4) {
  grid-column: 1;
  grid-row: 3;
}

.transfer-fields .field:nth-child(5) {
  grid-column: 2;
  grid-row: 3;
}

.transfer-line .p-button {
  grid-column: 3;
  grid-row: 3;
  align-self: start;
  margin-top: 26px;
}

.totals-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 4px;
  grid-column: 1 / -1;
}

.totals-strip span {
  padding: 8px 10px;
  border-radius: 8px;
  background: #f8fafc;
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 800;
}

.member-picker {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 42px;
  gap: 10px;
  align-items: center;
}

.member-picker :deep(.p-button) {
  width: 42px;
  height: 42px;
}

.amount-equivalent {
  display: block;
  margin-top: 0;
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 600;
}

.amount-equivalent strong {
  color: #064e3b;
  font-size: 13px;
  font-weight: 900;
}

@media (max-width: 720px) {
  .step-form-grid {
    grid-template-columns: 1fr;
  }

  .first-row {
    grid-template-columns: 1fr;
  }

  .stepper-steps {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .amount-line,
  .transfer-line {
    grid-template-columns: 1fr;
  }

  .step-actions {
    flex-direction: column;
  }

  .step-actions .p-button {
    width: 100%;
  }
}
</style>
