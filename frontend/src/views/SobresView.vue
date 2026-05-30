<script setup>
import { onMounted, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import ContributionFormDialog from '@/components/ContributionFormDialog.vue'
import DataTable from '@/components/DataTable.vue'
import MemberFormDialog from '@/components/MemberFormDialog.vue'
import { getIglesias, getMonedas } from '@/services/catalogos.service'
import { getIglesiaActivaId, iglesiaActivaId } from '@/services/iglesia-activa.service'
import { createMiembro, getMiembros } from '@/services/miembros.service'
import { createSobre, getSiguienteNumeroSobre, getSobres } from '@/services/sobres.service'
import { withMinimumDelay } from '@/utils/loading'

const today = new Date().toISOString().slice(0, 10)
const miembros = ref([])
const monedas = ref([])
const iglesias = ref([])
const sobres = ref([])
const siguiente = ref(null)
const dialogVisible = ref(false)
const memberDialogVisible = ref(false)
const saving = ref(false)
const savingMember = ref(false)
const loading = ref(false)
const toast = useToast()

const columns = [
  { key: 'numeroSobre', label: 'Sobre' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'nombreMiembro', label: 'Miembro' },
  { key: 'montoDiezmo', label: 'Diezmo' },
  { key: 'montoPactoAmor', label: 'Pacto amor' },
  { key: 'totalIncluido', label: 'Total' },
]

const loadData = async ({ showLoading = true } = {}) => {
  if (showLoading) {
    loading.value = true
  }

  try {
    const loader = () => Promise.all([
      getMiembros(),
      getMonedas(),
      getIglesias(),
      getSobres(),
    ])
    const [miembrosData, monedasData, iglesiasData, sobresData] = await (showLoading ? withMinimumDelay(loader) : loader())
    miembros.value = miembrosData
    monedas.value = monedasData
    iglesias.value = iglesiasData
    sobres.value = sobresData
    await loadSiguiente(today)
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'No se pudo cargar la información',
      detail: err.message,
      life: 3600,
    })
  } finally {
    if (showLoading) {
      loading.value = false
    }
  }
}

const loadSiguiente = async (fecha = today) => {
  if (!fecha) return
  siguiente.value = await getSiguienteNumeroSobre(fecha)
}

const saveMember = async (payload) => {
  savingMember.value = true

  try {
    await createMiembro({
      ...payload,
      idIglesia: Number(getIglesiaActivaId() || payload.idIglesia),
    })
    toast.add({ severity: 'success', summary: 'Miembro registrado', life: 2600 })
    memberDialogVisible.value = false
    miembros.value = await getMiembros()
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'No se pudo guardar el miembro',
      detail: err.message,
      life: 3600,
    })
  } finally {
    savingMember.value = false
  }
}

const saveContribution = async (form) => {
  saving.value = true
  try {
    await createSobre({
      fecha: form.fecha,
      idIglesia: Number(getIglesiaActivaId()),
      idMiembro: Number(form.idMiembro),
      montoDiezmo: Number(form.montoDiezmo || 0),
      idMonedaDiezmo: form.idMonedaDiezmo,
      montoPactoAmor: Number(form.montoPactoAmor || 0),
      idMonedaPacto: form.idMonedaPacto || form.idMonedaDiezmo,
      ofrendas: form.ofrendas,
      transferencias: form.transferencias,
    })

    toast.add({
      severity: 'success',
      summary: 'Sobre registrado',
      detail: 'El registro fue guardado correctamente.',
      life: 2600,
    })
    dialogVisible.value = false
    await loadData({ showLoading: false })
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'No se pudo guardar',
      detail: err.message,
      life: 3600,
    })
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
watch(iglesiaActivaId, loadData)
</script>

<template>
  <section class="page">
    <ContributionFormDialog
      v-model:visible="dialogVisible"
      :miembros="miembros"
      :monedas="monedas"
      :siguiente="siguiente"
      :saving="saving"
      @date-change="loadSiguiente"
      @create-member="memberDialogVisible = true"
      @save="saveContribution"
    />

    <MemberFormDialog
      v-model:visible="memberDialogVisible"
      :iglesias="iglesias"
      :default-iglesia="getIglesiaActivaId()"
      :saving="savingMember"
      @save="saveMember"
    />

    <DataTable
      :columns="columns"
      :rows="sobres"
      :loading="loading"
      empty-text="Aun no hay sobres registrados."
    >
      <template #toolbarStart>
        <div class="button-row">
          <PButton icon="pi pi-refresh" severity="secondary" outlined :loading="loading" @click="loadData" />
          <PButton label="Nuevo sobre" icon="pi pi-plus" @click="dialogVisible = true" />
        </div>
      </template>
    </DataTable>
  </section>
</template>
