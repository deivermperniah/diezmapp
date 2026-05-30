<script setup>
import { computed, reactive, watch } from 'vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import FormDialog from '@/components/ui/FormDialog.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  miembros: { type: Array, default: () => [] },
  monedas: { type: Array, default: () => [] },
  siguiente: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'save', 'date-change', 'create-member'])

const today = new Date().toISOString().slice(0, 10)
const createKey = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const form = reactive({
  fecha: today,
  idMiembro: '',
  montoDiezmo: '',
  idMonedaDiezmo: '',
  montoPactoAmor: '',
  idMonedaPacto: '',
  ofrendas: [],
  transferencias: [],
})

const newOfrenda = () => ({
  key: createKey(),
  montoOfrenda: '',
  idMoneda: props.monedas[0]?.idMoneda || '$',
})

const newTransferencia = () => ({
  key: createKey(),
  fechaTransferencia: form.fecha || today,
  numeroTransferencia: '',
  bancoReceptorCuenta: '',
  montoTransferencia: '',
  idMoneda: props.monedas[0]?.idMoneda || '$',
})

const resetForm = () => {
  form.fecha = today
  form.idMiembro = props.miembros[0]?.idMiembro || ''
  form.montoDiezmo = ''
  form.idMonedaDiezmo = props.monedas[0]?.idMoneda || '$'
  form.montoPactoAmor = ''
  form.idMonedaPacto = props.monedas[0]?.idMoneda || '$'
  form.ofrendas = [newOfrenda()]
  form.transferencias = [newTransferencia()]
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      resetForm()
    }
  },
)

watch(
  () => [props.miembros, props.monedas],
  () => {
    form.idMiembro ||= props.miembros[0]?.idMiembro || ''
    form.idMonedaDiezmo ||= props.monedas[0]?.idMoneda || '$'
    form.idMonedaPacto ||= props.monedas[0]?.idMoneda || '$'
    if (form.ofrendas.length === 0) form.ofrendas = [newOfrenda()]
    if (form.transferencias.length === 0) form.transferencias = [newTransferencia()]
  },
  { immediate: true },
)

const totalCapturado = computed(() => {
  const diezmo = Number(form.montoDiezmo || 0)
  const pacto = Number(form.montoPactoAmor || 0)
  const ofrendas = form.ofrendas.reduce((total, ofrenda) => total + Number(ofrenda.montoOfrenda || 0), 0)
  return Number((diezmo + pacto + ofrendas).toFixed(2))
})

const totalTransferencias = computed(() =>
  Number(
    form.transferencias
      .reduce((total, transferencia) => total + Number(transferencia.montoTransferencia || 0), 0)
      .toFixed(2),
  ),
)

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
  emit('save', {
    fecha: form.fecha,
    idMiembro: form.idMiembro,
    montoDiezmo: form.montoDiezmo || 0,
    idMonedaDiezmo: form.idMonedaDiezmo,
    montoPactoAmor: form.montoPactoAmor || 0,
    idMonedaPacto: form.idMonedaPacto,
    ofrendas: form.ofrendas
      .filter((ofrenda) => Number(ofrenda.montoOfrenda || 0) > 0)
      .map(({ montoOfrenda, idMoneda }) => ({ montoOfrenda, idMoneda })),
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
        montoTransferencia,
        idMoneda,
      }),
    ),
  })
}
</script>

<template>
  <FormDialog
    :visible="visible"
    title="Nuevo sobre"
    icon="pi pi-inbox"
    submit-label="Guardar sobre"
    :saving="saving"
    width="min(1100px, 96vw)"
    @update:visible="$emit('update:visible', $event)"
    @submit="submit"
  >
    <form class="dialog-grid" @submit.prevent="submit">
      <div v-if="siguiente" class="next-envelope">
        <span>Siguiente sobre</span>
        <strong>{{ siguiente.siguienteNumero }}</strong>
      </div>

      <AppField id="fecha" label="Fecha">
        <AppInput id="fecha" v-model="form.fecha" type="date" @change="$emit('date-change', form.fecha)" />
      </AppField>

      <AppField id="miembro" label="Miembro" class="member-field">
        <div class="member-picker">
          <AppSelect
            id="miembro"
            v-model="form.idMiembro"
            :options="miembros"
            option-label="nombre"
            option-value="idMiembro"
            filter
          />
          <PButton
            v-tooltip.top="'Nuevo miembro'"
            icon="pi pi-user-plus"
            aria-label="Nuevo miembro"
            outlined
            @click="$emit('create-member')"
          />
        </div>
      </AppField>

      <AppField id="diezmo" label="Diezmo">
        <AppInput id="diezmo" v-model="form.montoDiezmo" type="number" min="0" step="0.01" required />
      </AppField>

      <AppField id="monedaDiezmo" label="Moneda diezmo">
        <AppSelect id="monedaDiezmo" v-model="form.idMonedaDiezmo" :options="monedas" option-label="nombreMoneda" option-value="idMoneda">
          <template #option="{ option }">{{ option.simbolo }} {{ option.nombreMoneda }}</template>
          <template #value="{ option, placeholder }">
            {{ option ? `${option.simbolo} ${option.nombreMoneda}` : placeholder }}
          </template>
        </AppSelect>
      </AppField>

      <AppField id="pacto" label="Pacto amor">
        <AppInput id="pacto" v-model="form.montoPactoAmor" type="number" min="0" step="0.01" />
      </AppField>

      <AppField id="monedaPacto" label="Moneda pacto">
        <AppSelect id="monedaPacto" v-model="form.idMonedaPacto" :options="monedas" option-label="nombreMoneda" option-value="idMoneda">
          <template #option="{ option }">{{ option.simbolo }} {{ option.nombreMoneda }}</template>
          <template #value="{ option, placeholder }">
            {{ option ? `${option.simbolo} ${option.nombreMoneda}` : placeholder }}
          </template>
        </AppSelect>
      </AppField>

      <section class="form-section">
        <div class="section-heading">
          <strong>Ofrendas de colaboración</strong>
          <PButton v-tooltip.top="'Agregar ofrenda'" icon="pi pi-plus" text rounded aria-label="Agregar ofrenda" @click="addOfrenda" />
        </div>

        <div v-for="(ofrenda, index) in form.ofrendas" :key="ofrenda.key" class="line-grid amount-line">
          <AppField :id="`ofrenda-${ofrenda.key}`" :label="`Ofrenda ${index + 1}`">
            <AppInput :id="`ofrenda-${ofrenda.key}`" v-model="ofrenda.montoOfrenda" type="number" min="0" step="0.01" />
          </AppField>

          <AppField :id="`moneda-ofrenda-${ofrenda.key}`" label="Moneda">
            <AppSelect :id="`moneda-ofrenda-${ofrenda.key}`" v-model="ofrenda.idMoneda" :options="monedas" option-label="nombreMoneda" option-value="idMoneda">
              <template #option="{ option }">{{ option.simbolo }} {{ option.nombreMoneda }}</template>
              <template #value="{ option, placeholder }">
                {{ option ? `${option.simbolo} ${option.nombreMoneda}` : placeholder }}
              </template>
            </AppSelect>
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
      </section>

      <section class="form-section">
        <div class="section-heading">
          <strong>Transferencias</strong>
          <PButton v-tooltip.top="'Agregar transferencia'" icon="pi pi-plus" text rounded aria-label="Agregar transferencia" @click="addTransferencia" />
        </div>

        <div v-for="(transferencia, index) in form.transferencias" :key="transferencia.key" class="transfer-line">
          <AppField :id="`fecha-transferencia-${transferencia.key}`" label="Fecha">
            <AppInput :id="`fecha-transferencia-${transferencia.key}`" v-model="transferencia.fechaTransferencia" type="date" />
          </AppField>

          <AppField :id="`numero-transferencia-${transferencia.key}`" label="Nro. transferencia">
            <AppInput :id="`numero-transferencia-${transferencia.key}`" v-model="transferencia.numeroTransferencia" />
          </AppField>

          <AppField :id="`banco-transferencia-${transferencia.key}`" label="Banco/cuenta">
            <AppInput :id="`banco-transferencia-${transferencia.key}`" v-model="transferencia.bancoReceptorCuenta" />
          </AppField>

          <AppField :id="`monto-transferencia-${transferencia.key}`" label="Monto">
            <AppInput :id="`monto-transferencia-${transferencia.key}`" v-model="transferencia.montoTransferencia" type="number" min="0" step="0.01" />
          </AppField>

          <AppField :id="`moneda-transferencia-${transferencia.key}`" label="Moneda">
            <AppSelect :id="`moneda-transferencia-${transferencia.key}`" v-model="transferencia.idMoneda" :options="monedas" option-label="nombreMoneda" option-value="idMoneda">
              <template #option="{ option }">{{ option.simbolo }} {{ option.nombreMoneda }}</template>
              <template #value="{ option, placeholder }">
                {{ option ? `${option.simbolo} ${option.nombreMoneda}` : placeholder }}
              </template>
            </AppSelect>
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
      </section>

      <div class="totals-strip">
        <span>Total capturado: {{ totalCapturado.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
        <span>Transferencias: {{ totalTransferencias.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
      </div>
    </form>
  </FormDialog>
</template>

<style scoped>
.dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.next-envelope {
  display: flex;
  align-items: center;
  justify-content: space-between;
  grid-column: 1 / -1;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: #f8fafc;
}

.next-envelope span {
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 800;
}

.next-envelope strong {
  color: var(--color-ink);
  font-size: 18px;
  font-weight: 900;
}

.form-section,
.totals-strip {
  grid-column: 1 / -1;
}

.member-field {
  grid-column: span 1;
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

.form-section {
  display: grid;
  gap: 12px;
  padding-top: 4px;
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

.line-grid,
.transfer-line {
  display: grid;
  gap: 12px;
  align-items: end;
}

.amount-line {
  grid-template-columns: minmax(0, 1fr) 170px 42px;
}

.transfer-line {
  grid-template-columns: 150px minmax(130px, 0.8fr) minmax(150px, 1fr) 120px 130px 42px;
}

.totals-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 4px;
}

.totals-strip span {
  padding: 8px 10px;
  border-radius: 8px;
  background: #f8fafc;
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 800;
}

@media (max-width: 720px) {
  .dialog-grid,
  .amount-line,
  .transfer-line {
    grid-template-columns: 1fr;
  }
}
</style>
