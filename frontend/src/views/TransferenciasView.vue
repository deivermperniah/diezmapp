<script setup>
import { onMounted, reactive, ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import { getSobres } from '@/services/sobres.service'
import {
  createTransferencia,
  getTransferencias,
} from '@/services/transferencias.service'

const today = new Date().toISOString().slice(0, 10)
const transferencias = ref([])
const sobres = ref([])
const error = ref('')
const status = ref('')

const form = reactive({
  idSobre: '',
  fechaTransferencia: today,
  numeroTransferencia: '',
  bancoReceptorCuenta: '',
  montoTransferencia: '',
})

const columns = [
  { key: 'numeroSobre', label: 'Sobre' },
  { key: 'fechaTransferencia', label: 'Fecha' },
  { key: 'nombreMiembro', label: 'Miembro' },
  { key: 'numeroTransferencia', label: 'Operacion' },
  { key: 'bancoReceptorCuenta', label: 'Cuenta' },
  { key: 'montoTransferencia', label: 'Monto' },
]

const loadData = async () => {
  error.value = ''
  try {
    const [transferenciasData, sobresData] = await Promise.all([getTransferencias(), getSobres()])
    transferencias.value = transferenciasData
    sobres.value = sobresData
    form.idSobre ||= sobresData[0]?.idSobre || ''
  } catch (err) {
    error.value = err.message
  }
}

const submitForm = async () => {
  status.value = ''
  error.value = ''

  try {
    await createTransferencia({
      idSobre: Number(form.idSobre),
      fechaTransferencia: form.fechaTransferencia,
      numeroTransferencia: form.numeroTransferencia,
      bancoReceptorCuenta: form.bancoReceptorCuenta,
      montoTransferencia: Number(form.montoTransferencia),
    })

    status.value = 'Transferencia registrada correctamente.'
    form.numeroTransferencia = ''
    form.bancoReceptorCuenta = ''
    form.montoTransferencia = ''
    await loadData()
  } catch (err) {
    error.value = err.message
  }
}

onMounted(loadData)
</script>

<template>
  <section class="page">
    <div class="page-actions">
      <button class="btn btn-secondary" type="button" @click="loadData">Actualizar</button>
    </div>

    <section class="panel">
      <div class="panel-header">
        <h3 class="panel-title">Nueva transferencia</h3>
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
          <label for="fecha">Fecha transferencia</label>
          <input id="fecha" v-model="form.fechaTransferencia" class="control" type="date" required />
        </div>
        <div class="field">
          <label for="numero">Numero transferencia</label>
          <input id="numero" v-model="form.numeroTransferencia" class="control" required />
        </div>
        <div class="field">
          <label for="cuenta">Banco o cuenta</label>
          <input id="cuenta" v-model="form.bancoReceptorCuenta" class="control" required />
        </div>
        <div class="field">
          <label for="monto">Monto</label>
          <input id="monto" v-model="form.montoTransferencia" class="control" min="0" step="0.01" type="number" required />
        </div>
        <div class="button-row">
          <button class="btn btn-primary" type="submit">Registrar transferencia</button>
        </div>
      </form>
    </section>

    <p v-if="error" class="status status-error">{{ error }}</p>
    <p v-else-if="status" class="status status-ok">{{ status }}</p>

    <section class="panel">
      <div class="panel-header">
        <h3 class="panel-title">Transferencias registradas</h3>
      </div>
      <DataTable
        :columns="columns"
        :rows="transferencias"
        empty-text="Aun no hay transferencias registradas."
      />
    </section>
  </section>
</template>
