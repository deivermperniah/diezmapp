<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { getIglesias } from '@/services/catalogos.service'
import {
  getIglesiaActivaId,
  iglesiaActivaId,
  iglesiaActivaNombre,
  setIglesiaActivaId,
} from '@/services/iglesia-activa.service'

const toast = useToast()
const router = useRouter()
const popover = ref(null)
const iglesias = ref([])
const search = ref('')
const loading = ref(false)

const activeName = computed(() => iglesiaActivaNombre.value || 'Seleccionar iglesia')

const filteredIglesias = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return iglesias.value

  return iglesias.value.filter((iglesia) =>
    [iglesia.nombreIglesia, iglesia.ciudad].some((value) =>
      String(value ?? '').toLowerCase().includes(term),
    ),
  )
})

const loadIglesias = async ({ showLoading = true } = {}) => {
  if (showLoading) {
    loading.value = true
  }

  try {
    const iglesiasData = await getIglesias()
    iglesias.value = iglesiasData

    const activeId = getIglesiaActivaId()
    const active = iglesiasData.find((iglesia) => String(iglesia.idIglesia) === String(activeId))

    if (active && !iglesiaActivaNombre.value) {
      setIglesiaActivaId(active.idIglesia, active.nombreIglesia)
    } else if (!active && iglesiasData[0]?.idIglesia) {
      setIglesiaActivaId(iglesiasData[0].idIglesia, iglesiasData[0].nombreIglesia)
    } else if (!iglesiasData.length) {
      setIglesiaActivaId('')
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'No se pudieron cargar las iglesias',
      detail: err.message,
      life: 3600,
    })
  } finally {
    if (showLoading) {
      loading.value = false
    }
  }
}

const selectChurch = (iglesia) => {
  setIglesiaActivaId(iglesia.idIglesia, iglesia.nombreIglesia)
  popover.value?.hide()
}

const openManager = () => {
  popover.value?.hide()
  router.push('/configuracion')
}

const toggle = async (event) => {
  if (!iglesias.value.length) {
    await loadIglesias()
  }

  popover.value?.toggle(event)
}

onMounted(async () => {
  await loadIglesias()
})
</script>

<template>
  <div class="church-switcher">
    <button type="button" class="church-trigger" @click="toggle">
      <span class="church-icon">
        <i class="pi pi-building" aria-hidden="true"></i>
      </span>
      <span class="church-copy">
        <strong>{{ activeName }}</strong>
      </span>
      <i class="pi pi-chevron-down" aria-hidden="true"></i>
    </button>

    <PPopover ref="popover" class="church-popover">
      <div class="church-panel">
        <div class="church-search-row">
          <div class="search-field">
            <i class="pi pi-search" aria-hidden="true"></i>
            <PInputText v-model="search" placeholder="Buscar iglesia" autofocus />
          </div>
          <PButton icon="pi pi-cog" severity="secondary" outlined @click="openManager" />
        </div>

        <div v-if="loading" class="church-state">
          <PProgressSpinner style="width: 28px; height: 28px" stroke-width="4" />
          <span>Cargando iglesias...</span>
        </div>

        <div v-else class="church-list">
          <button
            v-for="iglesia in filteredIglesias"
            :key="iglesia.idIglesia"
            type="button"
            class="church-option"
            :class="{ active: String(iglesia.idIglesia) === String(iglesiaActivaId) }"
            @click="selectChurch(iglesia)"
          >
            <span class="option-mark">
              <i class="pi pi-building" aria-hidden="true"></i>
            </span>
            <span>
              <strong>{{ iglesia.nombreIglesia }}</strong>
              <small>{{ iglesia.ciudad }}</small>
            </span>
            <i v-if="String(iglesia.idIglesia) === String(iglesiaActivaId)" class="pi pi-check" aria-hidden="true"></i>
          </button>

          <p v-if="!filteredIglesias.length" class="empty-state">No hay iglesias con ese nombre.</p>
        </div>
      </div>
    </PPopover>

  </div>
</template>

<style scoped>
.church-switcher {
  min-width: min(340px, 42vw);
}

.church-trigger {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 46px;
  padding: 6px 10px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #eff6ff;
  color: #1d4ed8;
  text-align: left;
}

.church-icon {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 8px;
  background: #dbeafe;
}

.church-copy {
  display: grid;
  min-width: 0;
  line-height: 1.15;
}

.church-copy small {
  color: #3b82f6;
  font-size: 11px;
  font-weight: 850;
}

.church-copy strong {
  overflow: hidden;
  color: #1d4ed8;
  font-size: 14px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.church-panel {
  display: grid;
  width: min(360px, 86vw);
  gap: 12px;
}

.church-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.search-field {
  position: relative;
}

.search-field i {
  position: absolute;
  top: 50%;
  left: 12px;
  z-index: 1;
  color: var(--color-muted);
  transform: translateY(-50%);
}

.search-field :deep(.p-inputtext) {
  padding-left: 36px;
}

.church-list {
  display: grid;
  max-height: 320px;
  gap: 6px;
  overflow: auto;
}

.church-option {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #fff;
  color: var(--color-ink);
  text-align: left;
}

.church-option:hover,
.church-option.active {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.option-mark {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 8px;
  background: #eef2f7;
  color: #475569;
}

.church-option.active .option-mark {
  background: #dbeafe;
  color: #1d4ed8;
}

.church-option strong,
.church-option small {
  display: block;
}

.church-option strong {
  font-size: 14px;
  font-weight: 900;
}

.church-option small {
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 750;
}

.church-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  color: var(--color-muted);
  font-weight: 800;
}

@media (max-width: 720px) {
  .church-switcher {
    width: 100%;
    min-width: 0;
  }
}
</style>
