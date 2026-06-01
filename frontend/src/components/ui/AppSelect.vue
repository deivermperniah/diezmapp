<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  optionLabel: { type: String, required: true },
  optionValue: { type: String, required: true },
  placeholder: { type: String, default: 'Seleccionar' },
  filter: { type: Boolean, default: false },
  overlayClass: { type: String, default: '' },
  scrollHeight: { type: String, default: '14rem' },
})

defineEmits(['update:modelValue'])

const selectedOption = computed(() =>
  props.options.find(
    (option) => String(option[props.optionValue]) === String(props.modelValue),
  ),
)
</script>

<template>
  <PSelect
    :input-id="id"
    :model-value="modelValue"
    :options="options"
    :option-label="optionLabel"
    :option-value="optionValue"
    :placeholder="placeholder"
    :filter="filter"
    :overlay-class="overlayClass"
    :scroll-height="scrollHeight"
    fluid
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #option="{ option }">
      <slot name="option" :option="option">
        {{ option[optionLabel] }}
      </slot>
    </template>
    <template #value="{ value, placeholder }">
      <slot name="value" :value="value" :option="selectedOption" :placeholder="placeholder">
        {{ selectedOption?.[optionLabel] || placeholder }}
      </slot>
    </template>
  </PSelect>
</template>
