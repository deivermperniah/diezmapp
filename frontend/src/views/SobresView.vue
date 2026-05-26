<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import DataTable from '@/components/DataTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import PageActions from '@/components/ui/PageActions.vue'
import { getMonedas } from '@/services/catalogos.service'
import { getMiembros } from '@/services/miembros.service'
import { createOfrenda, getOfrendas } from '@/services/ofrendas.service'
import { getIglesiaActivaId } from '@/services/iglesia-activa.service'
import { createSobre, getSiguienteNumeroSobre, getSobres } from '@/services/sobres.service'
import {
  createTransferencia,
  getTransferencias,
} from '@/services/transferencias.service'

const today = new Date().toISOString().slice(0, 10)
const sobres = ref([])
const ofrendas = ref([])
const transferencias = ref([])
const miembros = ref([])
const monedas = ref([])
const siguiente = ref(null)
const error = ref('')
const saving = ref(false)
const toast = useToast()

const form = reactive({
  fecha: today,
  idMiembro: '',
  montoDiezmo: '',
  idMonedaDiezmo: '',
  montoPactoAmor: '',
  idMonedaPacto: '',
  montoOfrenda: '',
  idMonedaOfrenda: '',
  fechaTransferencia: today,
  numeroTransferencia: '',
  bancoReceptorCuenta: '',
  montoTransferencia: '',
  idMonedaTransferencia: '',
})

const sobreColumns = [
  { key: 'numeroSobre', label: 'Sobre' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'nombreMiembro', label: 'Miembro' },
  { key: 'montoDiezmo', label: 'Diezmo' },
  { key: 'montoPactoAmor', label: 'Pacto amor' },
  { key: 'totalIncluido', label: 'Total incluido' },
]

const ofrendaColumns = [
  { key: 'numeroSobre', label: 'Sobre' },
  { key: 'fechaSobre', label: 'Fecha' },
  { key: 'nombreMiembro', label: 'Miembro' },
  { key: 'montoOfrenda', label: 'Ofrenda' },
  { key: 'simboloMoneda', label: 'Moneda' },
]

const transferenciaColumns = [
  { key: 'numeroSobre', label: 'Sobre' },
  { key: 'fechaTransferencia', label: 'Fecha' },
  { key: 'nombreMiembro', label: 'Miembro' },
  { key: 'numeroTransferencia', label: 'Operacion' },
  { key: 'bancoReceptorCuenta', label: 'Cuenta' },
  { key: 'montoTransferencia', label: 'Monto' },
  { key: 'simboloMonedaOriginal', label: 'Moneda original' },
]

const hasValue = (value) => String(value ?? '').trim() !== ''

const hasPositiveAmount = (value) => {
  const amount = Number(value)
  return !Number.isNaN(amount) && amount > 0
}

const hasOfrenda = () => hasPositiveAmount(form.montoOfrenda)

const hasTransferencia = () =>
  hasValue(form.numeroTransferencia) ||
  hasValue(form.bancoReceptorCuenta) ||
  hasPositiveAmount(form.montoTransferencia)

const loadData = async () => {
  error.value = ''
  try {
    const [sobresData, ofrendasData, transferenciasData, miembrosData, monedasData] = await Promise.all([
      getSobres(),
      getOfrendas(),
      getTransferencias(),
      getMiembros(),
      getMonedas(),
    ])

    sobres.value = sobresData
    ofrendas.value = ofrendasData
    transferencias.value = transferenciasData
    miembros.value = miembrosData
    monedas.value = monedasData
    form.idMiembro ||= miembrosData[0]?.idMiembro || ''
    form.idMonedaDiezmo ||= monedasData[0]?.idMoneda || ''
    form.idMonedaPacto ||= monedasData[0]?.idMoneda || ''
    form.idMonedaOfrenda ||= monedasData[0]?.idMoneda || ''
    form.idMonedaTransferencia ||= monedasData[0]?.idMoneda || ''
    await loadSiguiente()
  } catch (err) {
    error.value = err.message
  }
}

const loadSiguiente = async () => {
  if (!form.fecha) return
  siguiente.value = await getSiguienteNumeroSobre(form.fecha)
}

const handleFechaChange = async () => {
  if (!hasTransferencia()) {
    form.fechaTransferencia = form.fecha
  }

  await loadSiguiente()
}

const submitForm = async () => {
  error.value = ''
  saving.value = true

  try {
    const sobre = await createSobre({
      fecha: form.fecha,
      idIglesia: Number(getIglesiaActivaId()),
      idMiembro: Number(form.idMiembro),
      montoDiezmo: Number(form.montoDiezmo),
      idMonedaDiezmo: form.idMonedaDiezmo,
      montoPactoAmor: Number(form.montoPactoAmor || 0),
      idMonedaPacto: form.idMonedaPacto,
    })

    if (hasOfrenda()) {
      await createOfrenda({
        idSobre: Number(sobre.idSobre),
        montoOfrenda: Number(form.montoOfrenda),
        idMoneda: form.idMonedaOfrenda,
      })
    }

    if (hasTransferencia()) {
      await createTransferencia({
        idSobre: Number(sobre.idSobre),
        fechaTransferencia: form.fechaTransferencia,
        numeroTransferencia: form.numeroTransferencia,
        bancoReceptorCuenta: form.bancoReceptorCuenta,
        montoTransferencia: Number(form.montoTransferencia),
        idMoneda: form.idMonedaTransferencia,
      })
    }

    toast.add({
      severity: 'success',
      summary: 'Sobre registrado',
      detail: 'El sobre y sus movimientos fueron guardados.',
      life: 2600,
    })
    form.montoDiezmo = ''
    form.montoPactoAmor = ''
    form.montoOfrenda = ''
    form.numeroTransferencia = ''
    form.bancoReceptorCuenta = ''
    form.montoTransferencia = ''
    form.fechaTransferencia = form.fecha
    await loadData()
  } catch (err) {
    error.value = err.message
    toast.add({
      severity: 'error',
      summary: 'No se pudo registrar',
      detail: err.message,
      life: 3600,
    })
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <section class="page">
    <PageActions>
      <AppButton variant="secondary" @click="loadData">Actualizar</AppButton>
    </PageActions>

    <AppPanel title="Nuevo sobre">
      <template #actions>
        <strong v-if="siguiente">Siguiente: {{ siguiente.siguienteNumero }}</strong>
      </template>
      <form class="panel-body form-grid" @submit.prevent="submitForm">
        <div class="form-section">
          <h4>Sobre</h4>
          <div class="form-grid">
            <AppField id="fecha" label="Fecha">
              <AppInput id="fecha" v-model="form.fecha" type="date" @change="handleFechaChange" />
            </AppField>
            <AppField id="miembro" label="Miembro">
              <AppSelect id="miembro" v-model="form.idMiembro" :options="miembros" option-label="nombre" option-value="idMiembro" />
            </AppField>
            <AppField id="diezmo" label="Monto diezmo">
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
            <AppField id="pacto" label="Monto pacto amor">
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
          </div>
        </div>

        <div class="form-section">
          <h4>Ofrenda adicional</h4>
          <div class="form-grid">
            <AppField id="ofrenda" label="Monto ofrenda">
              <AppInput id="ofrenda" v-model="form.montoOfrenda" type="number" min="0" step="0.01" />
            </AppField>
            <AppField id="monedaOfrenda" label="Moneda ofrenda">
              <AppSelect id="monedaOfrenda" v-model="form.idMonedaOfrenda" :options="monedas" option-label="nombreMoneda" option-value="idMoneda">
                <template #option="{ option }">{{ option.simbolo }} {{ option.nombreMoneda }}</template>
                <template #value="{ option, placeholder }">
                  {{ option ? `${option.simbolo} ${option.nombreMoneda}` : placeholder }}
                </template>
              </AppSelect>
            </AppField>
          </div>
        </div>

        <div class="form-section">
          <h4>Transferencia</h4>
          <div class="form-grid">
            <AppField id="fechaTransferencia" label="Fecha transferencia">
              <AppInput id="fechaTransferencia" v-model="form.fechaTransferencia" type="date" />
            </AppField>
            <AppField id="numeroTransferencia" label="Numero transferencia">
              <AppInput id="numeroTransferencia" v-model="form.numeroTransferencia" />
            </AppField>
            <AppField id="cuentaTransferencia" label="Banco o cuenta">
              <AppInput id="cuentaTransferencia" v-model="form.bancoReceptorCuenta" />
            </AppField>
            <AppField id="montoTransferencia" label="Monto transferencia">
              <AppInput id="montoTransferencia" v-model="form.montoTransferencia" type="number" min="0" step="0.01" />
            </AppField>
            <AppField id="monedaTransferencia" label="Moneda transferencia">
              <AppSelect id="monedaTransferencia" v-model="form.idMonedaTransferencia" :options="monedas" option-label="nombreMoneda" option-value="idMoneda">
                <template #option="{ option }">{{ option.simbolo }} {{ option.nombreMoneda }}</template>
                <template #value="{ option, placeholder }">
                  {{ option ? `${option.simbolo} ${option.nombreMoneda}` : placeholder }}
                </template>
              </AppSelect>
            </AppField>
          </div>
        </div>

        <div class="button-row full-row">
          <AppButton type="submit" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar sobre completo' }}
          </AppButton>
        </div>
      </form>
    </AppPanel>

    <p v-if="error" class="status status-error">{{ error }}</p>

    <AppPanel title="Sobres registrados">
      <DataTable :columns="sobreColumns" :rows="sobres" empty-text="Aun no hay sobres registrados." />
    </AppPanel>

    <div class="grid grid-2">
      <AppPanel title="Ofrendas registradas">
        <DataTable :columns="ofrendaColumns" :rows="ofrendas" empty-text="Aun no hay ofrendas registradas." />
      </AppPanel>

      <AppPanel title="Transferencias registradas">
        <DataTable
          :columns="transferenciaColumns"
          :rows="transferencias"
          empty-text="Aun no hay transferencias registradas."
        />
      </AppPanel>
    </div>
  </section>
</template>

<style scoped>
.panel-body.form-grid {
  grid-template-columns: 1fr;
}

.form-section {
  display: grid;
  gap: 14px;
}

.form-section + .form-section {
  padding-top: 18px;
  border-top: 1px solid var(--color-line);
}

.form-section h4 {
  margin: 0;
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 900;
}

.full-row {
  padding-top: 4px;
}
</style>
