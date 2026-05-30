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
import { createOfrenda, getOfrendas } from '@/services/ofrendas.service'
import { getSobres } from '@/services/sobres.service'
import { withMinimumDelay } from '@/utils/loading'

const ofrendas = ref([])
const sobres = ref([])
const monedas = ref([])
const error = ref('')
const loading = ref(false)
const toast = useToast()

const form = reactive({
  idSobre: '',
  montoOfrenda: '',
  idMoneda: '',
})

const columns = [
  { key: 'numeroSobre', label: 'Sobre' },
  { key: 'fechaSobre', label: 'Fecha' },
  { key: 'nombreMiembro', label: 'Miembro' },
  { key: 'montoOfrenda', label: 'Ofrenda' },
  { key: 'simboloMoneda', label: 'Moneda' },
]

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const [ofrendasData, sobresData, monedasData] = await withMinimumDelay(() => Promise.all([
      getOfrendas(),
      getSobres(),
      getMonedas(),
    ]))

    ofrendas.value = ofrendasData
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
    await createOfrenda({
      idSobre: Number(form.idSobre),
      montoOfrenda: Number(form.montoOfrenda),
      idMoneda: form.idMoneda,
    })

    toast.add({
      severity: 'success',
      summary: 'Ofrenda registrada',
      life: 2600,
    })
    form.montoOfrenda = ''
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
    <AppPanel title="Nueva ofrenda">
      <form class="panel-body form-grid" @submit.prevent="submitForm">
        <AppField id="sobre" label="Sobre">
          <AppSelect id="sobre" v-model="form.idSobre" :options="sobres" option-label="nombreMiembro" option-value="idSobre">
            <template #option="{ option }">{{ option.numeroSobre }} - {{ option.nombreMiembro }}</template>
          </AppSelect>
        </AppField>
        <AppField id="monto" label="Monto">
          <AppInput id="monto" v-model="form.montoOfrenda" type="number" min="0" step="0.01" required />
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
          <AppButton type="submit">Registrar ofrenda</AppButton>
        </div>
      </form>
    </AppPanel>

    <p v-if="error" class="status status-error">{{ error }}</p>

    <AppPanel title="Ofrendas registradas">
      <DataTable :columns="columns" :rows="ofrendas" :loading="loading" empty-text="Aun no hay ofrendas registradas.">
        <template #toolbarStart>
          <PButton icon="pi pi-refresh" severity="secondary" outlined :loading="loading" @click="loadData" />
        </template>
      </DataTable>
    </AppPanel>
  </section>
</template>
