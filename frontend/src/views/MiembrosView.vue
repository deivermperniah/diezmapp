<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import { getIglesias } from '@/services/catalogos.service'
import {
  createMiembro,
  deleteMiembro,
  getMiembros,
  updateMiembro,
} from '@/services/miembros.service'

const miembros = ref([])
const iglesias = ref([])
const loading = ref(false)
const status = ref('')
const error = ref('')
const editingId = ref(null)

const form = reactive({
  nombre: '',
  email: '',
  idIglesia: '',
})

const columns = [
  { key: 'idMiembro', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'nombreIglesia', label: 'Iglesia' },
]

const isEditing = computed(() => Boolean(editingId.value))

const resetForm = () => {
  editingId.value = null
  form.nombre = ''
  form.email = ''
  form.idIglesia = iglesias.value[0]?.idIglesia || ''
}

const loadData = async () => {
  loading.value = true
  error.value = ''

  try {
    const [miembrosData, iglesiasData] = await Promise.all([getMiembros(), getIglesias()])
    miembros.value = miembrosData
    iglesias.value = iglesiasData

    if (!form.idIglesia) {
      form.idIglesia = iglesiasData[0]?.idIglesia || ''
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  status.value = ''
  error.value = ''

  try {
    const payload = {
      nombre: form.nombre,
      email: form.email || null,
      idIglesia: Number(form.idIglesia),
    }

    if (isEditing.value) {
      await updateMiembro(editingId.value, payload)
      status.value = 'Miembro actualizado correctamente.'
    } else {
      await createMiembro(payload)
      status.value = 'Miembro registrado correctamente.'
    }

    await loadData()
    resetForm()
  } catch (err) {
    error.value = err.message
  }
}

const editRow = (row) => {
  editingId.value = row.idMiembro
  form.nombre = row.nombre
  form.email = row.email || ''
  form.idIglesia = row.idIglesia
}

const removeRow = async (row) => {
  status.value = ''
  error.value = ''

  try {
    await deleteMiembro(row.idMiembro)
    status.value = 'Miembro eliminado correctamente.'
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
        <h3 class="panel-title">{{ isEditing ? 'Editar miembro' : 'Nuevo miembro' }}</h3>
      </div>
      <form class="panel-body form-grid" @submit.prevent="submitForm">
        <div class="field">
          <label for="nombre">Nombre</label>
          <input id="nombre" v-model="form.nombre" class="control" required />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" class="control" type="email" />
        </div>
        <div class="field">
          <label for="iglesia">Iglesia</label>
          <select id="iglesia" v-model="form.idIglesia" class="control" required>
            <option v-for="iglesia in iglesias" :key="iglesia.idIglesia" :value="iglesia.idIglesia">
              {{ iglesia.nombreIglesia }}
            </option>
          </select>
        </div>
        <div class="button-row">
          <button class="btn btn-primary" type="submit">
            {{ isEditing ? 'Guardar cambios' : 'Registrar miembro' }}
          </button>
          <button v-if="isEditing" class="btn btn-secondary" type="button" @click="resetForm">
            Cancelar
          </button>
        </div>
      </form>
    </section>

    <p v-if="error" class="status status-error">{{ error }}</p>
    <p v-else-if="status" class="status status-ok">{{ status }}</p>
    <p v-else-if="loading" class="status">Cargando miembros...</p>

    <section class="panel">
      <div class="panel-header">
        <h3 class="panel-title">Listado de miembros</h3>
      </div>
      <DataTable :columns="columns" :rows="miembros" empty-text="Aun no hay miembros registrados.">
        <template #actions="{ row }">
          <div class="button-row actions">
            <button class="btn btn-secondary" type="button" @click="editRow(row)">Editar</button>
            <button class="btn btn-danger" type="button" @click="removeRow(row)">Eliminar</button>
          </div>
        </template>
      </DataTable>
    </section>
  </section>
</template>

<style scoped>
.actions {
  justify-content: flex-end;
}
</style>
