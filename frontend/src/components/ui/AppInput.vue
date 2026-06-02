<script setup>
const toDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value

  const [year, month, day] = String(value).split('-').map(Number)
  return new Date(year, month - 1, day)
}

const toDateString = (value) => {
  if (!value) return ''
  const date = value instanceof Date ? value : toDate(value)
  if (!date) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

defineProps({
  id: { type: String, required: true },
  modelValue: { type: [String, Number, Date], default: '' },
  type: { type: String, default: 'text' },
  required: { type: Boolean, default: false },
  min: { type: [String, Number], default: null },
  max: { type: [String, Number], default: null },
  step: { type: [String, Number], default: null },
  placeholder: { type: String, default: null },
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'change'])

const emitNumberValue = (value) => {
  emit('update:modelValue', value ?? '')
}

const emitNumberInput = (event) => {
  emitNumberValue(event?.value ?? event?.target?.value ?? event?.originalEvent?.target?.value ?? '')
}
</script>

<template>
  <PInputNumber
    v-if="type === 'number'"
    :input-id="id"
    :model-value="modelValue === '' ? null : Number(modelValue)"
    :min="min === null ? undefined : Number(min)"
    :max="max === null ? undefined : Number(max)"
    :min-fraction-digits="step === '0.01' || step === 0.01 ? 2 : 0"
    :max-fraction-digits="step === '0.01' || step === 0.01 ? 2 : 0"
    :placeholder="placeholder"
    :readonly="readonly"
    fluid
    @input="emitNumberInput"
    @update:model-value="emitNumberValue"
    @change="$emit('change', $event)"
  />
  <PDatePicker
    v-else-if="type === 'date'"
    :input-id="id"
    :model-value="toDate(modelValue)"
    date-format="dd/mm/yy"
    show-icon
    :manual-input="false"
    fluid
    @update:model-value="$emit('update:modelValue', toDateString($event))"
    @date-select="$emit('change', toDateString($event))"
  />
  <PInputText
    v-else
    :id="id"
    :model-value="modelValue"
    :type="type"
    :required="required"
    :placeholder="placeholder"
    :readonly="readonly"
    fluid
    @update:model-value="$emit('update:modelValue', $event)"
    @change="$emit('change', $event)"
  />
</template>
