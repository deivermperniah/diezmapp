<script setup>
import { computed, ref } from 'vue'
import Column from 'primevue/column'
import PrimeDataTable from 'primevue/datatable'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  emptyText: { type: String, default: 'Sin registros para mostrar.' },
})

const search = ref('')

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
    <PToolbar v-if="rows.length" class="table-toolbar">
      <template #start>
        <strong>{{ visibleRows.length }} registros</strong>
      </template>
      <template #end>
        <span class="search-field">
          <i class="pi pi-search" />
          <PInputText v-model="search" placeholder="Buscar" />
        </span>
      </template>
    </PToolbar>

    <PrimeDataTable
      v-if="visibleRows.length"
      :value="visibleRows"
      class="app-data-table"
      paginator
      :rows="8"
      :rows-per-page-options="[8, 15, 30]"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      current-page-report-template="{first}-{last} de {totalRecords}"
      size="small"
      striped-rows
      table-style="min-width: 720px"
    >
      <Column
        v-for="column in columns"
        :key="column.key"
        :field="column.key"
        :header="column.label"
        sortable
      />
      <Column v-if="$slots.actions" header="Acciones" body-class="actions-cell">
        <template #body="{ data }">
          <slot name="actions" :row="data" />
        </template>
      </Column>
    </PrimeDataTable>

    <div v-else class="empty-state">{{ search ? 'Sin resultados para la busqueda.' : emptyText }}</div>

  </div>
</template>

<style scoped>
.table-wrap {
  width: 100%;
  overflow-x: auto;
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

@media (max-width: 720px) {
  .search-field {
    width: 100%;
  }
}
</style>
