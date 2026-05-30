<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import DataTable from '@/components/DataTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import { getMonedas } from '@/services/catalogos.service'
import { iglesiaActivaId } from '@/services/iglesia-activa.service'
import { getSobres } from '@/services/sobres.service'
import {
  createTransferencia,
  getTransferencias,
} from '@/services/transferencias.service'
import { withMinimumDelay } from '@/utils/loading'

const today = new Date().toISOString().slice(0, 10)
const transferencias = ref([])
const sobres = ref([])
const monedas = ref([])
const error = ref('')
const loading = ref(false)
const toast = useToast()

const form = reactive({
  idSobre: '',
  fechaTransferencia: today,
  numeroTransferencia: '',
  bancoReceptorCuenta: '',
  montoTransferencia: '',
  idMoneda: '',
})

const columns = [
  { key: 'numeroSobre', label: 'Sobre' },
  { key: 'fechaTransferencia', label: 'Fecha' },
  { key: 'nombreMiembro', label: 'Miembro' },
  { key: 'numeroTransferencia', label: 'Operacion' },
  { key: 'bancoReceptorCuenta', label: 'Cuenta' },
  { key: 'montoTransferencia', label: 'Monto' },
  { key: 'simboloMonedaOriginal', label: 'Moneda original' },
]

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const [transferenciasData, sobresData, monedasData] = await withMinimumDelay(() => Promise.all([
      getTransferencias(),
      getSobres(),
      getMonedas(),
    ]))
    transferencias.value = transferenciasData
    sobres.value = sobresData
    monedas.value = monedasData
    form.idSobre ||= sobresData[0]?.idSobre || ''
    form.idMoneda ||= monedasData[0]?.idMoneda || ''
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  error.value = ''

  try {
    await createTransferencia({
      idSobre: Number(form.idSobre),
      fechaTransferencia: form.fechaTransferencia,
      numeroTransferencia: form.numeroTransferencia,
      bancoReceptorCuenta: form.bancoReceptorCuenta,
      montoTransferencia: Number(form.montoTransferencia),
      idMoneda: form.idMoneda,
    })

    toast.add({
      severity: 'success',
      summary: 'Transferencia registrada',
      life: 2600,
    })
    form.numeroTransferencia = ''
    form.bancoReceptorCuenta = ''
    form.montoTransferencia = ''
    await loadData()
  } catch (err) {
    error.value = err.message
    toast.add({
      severity: 'error',
      summary: 'No se pudo registrar',
      detail: err.message,
      life: 3600,
    })
  }
}

onMounted(loadData)
watch(iglesiaActivaId, loadData)
</script>

<template>
  <section class="page">
    <AppPanel title="Nueva transferencia">
      <form class="panel-body form-grid" @submit.prevent="submitForm">
        <AppField id="sobre" label="Sobre">
          <AppSelect id="sobre" v-model="form.idSobre" :options="sobres" option-label="nombreMiembro" option-value="idSobre">
            <template #option="{ option }">{{ option.numeroSobre }} - {{ option.nombreMiembro }}</template>
          </AppSelect>
        </AppField>
        <AppField id="fecha" label="Fecha transferencia">
          <AppInput id="fecha" v-model="form.fechaTransferencia" type="date" required />
        </AppField>
        <AppField id="numero" label="Numero transferencia">
          <AppInput id="numero" v-model="form.numeroTransferencia" required />
        </AppField>
        <AppField id="cuenta" label="Banco o cuenta">
          <AppInput id="cuenta" v-model="form.bancoReceptorCuenta" required />
        </AppField>
        <AppField id="monto" label="Monto">
          <AppInput id="monto" v-model="form.montoTransferencia" type="number" min="0" step="0.01" required />
        </AppField>
        <AppField id="moneda" label="Moneda">
          <AppSelect id="moneda" v-model="form.idMoneda" :options="monedas" option-label="nombreMoneda" option-value="idMoneda">
            <template #option="{ option }">{{ option.simbolo }} {{ option.nombreMoneda }}</template>
            <template #value="{ option, placeholder }">
              {{ option ? `${option.simbolo} ${option.nombreMoneda}` : placeholder }}
            </template>
          </AppSelect>
        </AppField>
        <div class="button-row">
          <AppButton type="submit">Registrar transferencia</AppButton>
        </div>
      </form>
    </AppPanel>

    <p v-if="error" class="status status-error">{{ error }}</p>

    <AppPanel title="Transferencias registradas">
      <DataTable
        :columns="columns"
        :rows="transferencias"
        :loading="loading"
        empty-text="Aun no hay transferencias registradas."
      >
        <template #toolbarStart>
          <PButton icon="pi pi-refresh" severity="secondary" outlined :loading="loading" @click="loadData" />
        </template>
      </DataTable>
    </AppPanel>
  </section>
</template>
