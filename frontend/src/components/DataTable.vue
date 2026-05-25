<script setup>
defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  emptyText: { type: String, default: 'Sin registros para mostrar.' },
})
</script>

<template>
  <div class="table-wrap">
    <table v-if="rows.length" class="data-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
          <th v-if="$slots.actions" class="actions-heading">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id || row.idMiembro || row.idSobre || JSON.stringify(row)">
          <td v-for="column in columns" :key="column.key">
            {{ row[column.key] }}
          </td>
          <td v-if="$slots.actions" class="actions-cell">
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="empty-state">{{ emptyText }}</div>
  </div>
</template>

<style scoped>
.table-wrap {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
}

th,
td {
  padding: 13px 14px;
  border-bottom: 1px solid var(--color-line);
  text-align: left;
  vertical-align: middle;
}

th {
  color: var(--color-muted);
  background: var(--color-surface-muted);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

td {
  color: var(--color-ink);
  font-weight: 650;
}

tr:last-child td {
  border-bottom: 0;
}

.actions-heading,
.actions-cell {
  width: 190px;
  text-align: right;
}
</style>
