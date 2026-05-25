<script setup>
import { onMounted, reactive, ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import { getMonedas } from '@/services/catalogos.service'
import { createOfrenda, getOfrendas } from '@/services/ofrendas.service'
import { getSobres } from '@/services/sobres.service'

const ofrendas = ref([])
const sobres = ref([])
const monedas = ref([])
const error = ref('')
const status = ref('')

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
  error.value = ''
  try {
    const [ofrendasData, sobresData, monedasData] = await Promise.all([
      getOfrendas(),
      getSobres(),
      getMonedas(),
    ])

    ofrendas.value = ofrendasData
    sobres.value = sobresData
    monedas.value = monedasData
    form.idSobre ||= sobresData[0]?.idSobre || ''
    form.idMoneda ||= monedasData[0]?.idMoneda || ''
  } catch (err) {
    error.value = err.message
  }
}

const submitForm = async () => {
  status.value = ''
  error.value = ''

  try {
    await createOfrenda({
      idSobre: Number(form.idSobre),
      montoOfrenda: Number(form.montoOfrenda),
      idMoneda: Number(form.idMoneda),
    })

    status.value = 'Ofrenda registrada correctamente.'
    form.montoOfrenda = ''
    await loadData()
  } catch (err) {
    error.value = err.message
  }
}

onMounted(loadData)
</script>

<template>
  <section class="page">
    <div class="page-header">
      <div>
        <p class="page-kicker">Colaboraciones</p>
        <h2 class="page-title">Ofrendas</h2>
        <p class="page-subtitle">Registra aportes adicionales asociados a un sobre.</p>
      </div>
      <button class="btn btn-secondary" type="button" @click="loadData">Actualizar</button>
    </div>

    <section class="panel">
      <div class="panel-header">
        <h3 class="panel-title">Nueva ofrenda</h3>
      </div>
      <form class="panel-body form-grid" @submit.prevent="submitForm">
        <div class="field">
          <label for="sobre">Sobre</label>
          <select id="sobre" v-model="form.idSobre" class="control" required>
            <option v-for="sobre in sobres" :key="sobre.idSobre" :value="sobre.idSobre">
              {{ sobre.numeroSobre }} - {{ sobre.nombreMiembro }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="monto">Monto</label>
          <input id="monto" v-model="form.montoOfrenda" class="control" min="0" step="0.01" type="number" required />
        </div>
        <div class="field">
          <label for="moneda">Moneda</label>
          <select id="moneda" v-model="form.idMoneda" class="control" required>
            <option v-for="moneda in monedas" :key="moneda.idMoneda" :value="moneda.idMoneda">
              {{ moneda.simbolo }} {{ moneda.nombreMoneda }}
            </option>
          </select>
        </div>
        <div class="button-row">
          <button class="btn btn-primary" type="submit">Registrar ofrenda</button>
        </div>
      </form>
    </section>

    <p v-if="error" class="status status-error">{{ error }}</p>
    <p v-else-if="status" class="status status-ok">{{ status }}</p>

    <section class="panel">
      <div class="panel-header">
        <h3 class="panel-title">Ofrendas registradas</h3>
      </div>
      <DataTable :columns="columns" :rows="ofrendas" empty-text="Aun no hay ofrendas registradas." />
    </section>
  </section>
</template>
