<script setup>
import { onMounted, reactive, ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import { getMonedas } from '@/services/catalogos.service'
import { getMiembros } from '@/services/miembros.service'
import { createSobre, getSiguienteNumeroSobre, getSobres } from '@/services/sobres.service'

const today = new Date().toISOString().slice(0, 10)
const sobres = ref([])
const miembros = ref([])
const monedas = ref([])
const siguiente = ref(null)
const error = ref('')
const status = ref('')

const form = reactive({
  fecha: today,
  idMiembro: '',
  montoDiezmo: '',
  idMonedaDiezmo: '',
  montoPactoAmor: '',
  idMonedaPacto: '',
})

const columns = [
  { key: 'numeroSobre', label: 'Sobre' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'nombreMiembro', label: 'Miembro' },
  { key: 'montoDiezmo', label: 'Diezmo' },
  { key: 'montoPactoAmor', label: 'Pacto amor' },
  { key: 'totalIncluido', label: 'Total incluido' },
]

const loadData = async () => {
  error.value = ''
  try {
    const [sobresData, miembrosData, monedasData] = await Promise.all([
      getSobres(),
      getMiembros(),
      getMonedas(),
    ])

    sobres.value = sobresData
    miembros.value = miembrosData
    monedas.value = monedasData
    form.idMiembro ||= miembrosData[0]?.idMiembro || ''
    form.idMonedaDiezmo ||= monedasData[0]?.idMoneda || ''
    form.idMonedaPacto ||= monedasData[0]?.idMoneda || ''
    await loadSiguiente()
  } catch (err) {
    error.value = err.message
  }
}

const loadSiguiente = async () => {
  if (!form.fecha) return
  siguiente.value = await getSiguienteNumeroSobre(form.fecha)
}

const submitForm = async () => {
  status.value = ''
  error.value = ''

  try {
    await createSobre({
      fecha: form.fecha,
      idMiembro: Number(form.idMiembro),
      montoDiezmo: Number(form.montoDiezmo),
      idMonedaDiezmo: Number(form.idMonedaDiezmo),
      montoPactoAmor: Number(form.montoPactoAmor || 0),
      idMonedaPacto: Number(form.idMonedaPacto),
    })

    status.value = 'Sobre registrado correctamente.'
    form.montoDiezmo = ''
    form.montoPactoAmor = ''
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
        <h3 class="panel-title">Nuevo sobre</h3>
        <strong v-if="siguiente">Siguiente: {{ siguiente.siguienteNumero }}</strong>
      </div>
      <form class="panel-body form-grid" @submit.prevent="submitForm">
        <div class="field">
          <label for="fecha">Fecha</label>
          <input id="fecha" v-model="form.fecha" class="control" type="date" @change="loadSiguiente" />
        </div>
        <div class="field">
          <label for="miembro">Miembro</label>
          <select id="miembro" v-model="form.idMiembro" class="control" required>
            <option v-for="miembro in miembros" :key="miembro.idMiembro" :value="miembro.idMiembro">
              {{ miembro.nombre }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="diezmo">Monto diezmo</label>
          <input id="diezmo" v-model="form.montoDiezmo" class="control" min="0" step="0.01" type="number" required />
        </div>
        <div class="field">
          <label for="monedaDiezmo">Moneda diezmo</label>
          <select id="monedaDiezmo" v-model="form.idMonedaDiezmo" class="control">
            <option v-for="moneda in monedas" :key="moneda.idMoneda" :value="moneda.idMoneda">
              {{ moneda.simbolo }} {{ moneda.nombreMoneda }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="pacto">Monto pacto amor</label>
          <input id="pacto" v-model="form.montoPactoAmor" class="control" min="0" step="0.01" type="number" />
        </div>
        <div class="field">
          <label for="monedaPacto">Moneda pacto</label>
          <select id="monedaPacto" v-model="form.idMonedaPacto" class="control">
            <option v-for="moneda in monedas" :key="moneda.idMoneda" :value="moneda.idMoneda">
              {{ moneda.simbolo }} {{ moneda.nombreMoneda }}
            </option>
          </select>
        </div>
        <div class="button-row">
          <button class="btn btn-primary" type="submit">Registrar sobre</button>
        </div>
      </form>
    </section>

    <p v-if="error" class="status status-error">{{ error }}</p>
    <p v-else-if="status" class="status status-ok">{{ status }}</p>

    <section class="panel">
      <div class="panel-header">
        <h3 class="panel-title">Sobres registrados</h3>
      </div>
      <DataTable :columns="columns" :rows="sobres" empty-text="Aun no hay sobres registrados." />
    </section>
  </section>
</template>
