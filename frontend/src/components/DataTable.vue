<script setup>
import { computed, ref } from 'vue'
import Column from 'primevue/column'
import PrimeDataTable from 'primevue/datatable'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  emptyText: { type: String, default: 'Sin registros para mostrar.' },
  loading: { type: Boolean, default: false },
  searchable: { type: Boolean, default: true },
})

const search = ref('')

const skeletonRows = Array.from({ length: 5 }, (_, index) => ({ id: `loading-${index}` }))
const visibleLoading = computed(() => props.loading)

const normalizedSearch = computed(() => search.value.trim().toLowerCase())

const visibleRows = computed(() => {
  if (!normalizedSearch.value) return props.rows

  return props.rows.filter((row) =>
    props.columns.some((column) =>
      String(row[column.key] ?? '')
        .toLowerCase()
        .includes(normalizedSearch.value),
    ),
  )
})

</script>

<template>
  <div class="table-wrap">
    <PToolbar v-if="searchable || $slots.toolbarStart" class="table-toolbar">
      <template #start>
        <span v-if="searchable" class="search-field">
          <i class="pi pi-search" />
          <PInputText v-model="search" placeholder="Buscar" />
        </span>
      </template>
      <template v-if="$slots.toolbarStart" #end>
        <slot name="toolbarStart" />
      </template>
    </PToolbar>

    <PrimeDataTable
      :value="visibleLoading ? skeletonRows : visibleRows"
      class="app-data-table"
      paginator
      :rows="5"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
      current-page-report-template="{first}-{last} de {totalRecords}"
      size="small"
      striped-rows
      table-style="min-width: 720px"
      removable-sort
    >
      <Column
        v-for="column in columns"
        :key="column.key"
        :field="column.key"
        :header="column.label"
        :data-type="column.type || 'text'"
        :sortable="!visibleLoading"
      >
        <template #body="{ data }">
          <PSkeleton v-if="visibleLoading" height="1rem" :width="column.skeletonWidth || '72%'" />
          <PTag v-else-if="column.variant === 'tag' && data[column.key]" :value="data[column.key]" severity="success" />
          <span v-else>{{ data[column.key] }}</span>
        </template>
      </Column>
      <Column
        v-if="$slots.actions"
        header=""
        header-class="actions-header"
        body-class="actions-cell"
      >
        <template #body="{ data }">
          <div v-if="visibleLoading" class="button-row actions">
            <PSkeleton shape="circle" size="2rem" />
            <PSkeleton shape="circle" size="2rem" />
          </div>
          <slot v-else name="actions" :row="data" />
        </template>
      </Column>
      <template #empty>
        <div class="empty-state">{{ search ? 'Sin resultados para la busqueda.' : emptyText }}</div>
      </template>
    </PrimeDataTable>

  </div>
</template>

<style scoped>
.table-wrap {
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.table-toolbar {
  border: 0;
  border-bottom: 1px solid var(--color-line);
  border-radius: 0;
  padding: 12px 14px;
  background: #fff;
}

.search-field {
  position: relative;
  display: block;
  width: 260px;
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

.app-data-table {
  overflow: hidden;
}

.app-data-table :deep(.p-datatable-tbody > tr > td) {
  height: 44px;
  vertical-align: middle;
}

.app-data-table :deep(.actions-header),
.app-data-table :deep(.actions-cell) {
  width: 240px;
  text-align: right;
}

.app-data-table :deep(.actions-header .p-datatable-column-header-content),
.app-data-table :deep(.actions-header .p-column-header-content) {
  justify-content: flex-end;
}

.app-data-table :deep(.actions-cell .actions) {
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .search-field {
    width: 100%;
  }
}
</style>
