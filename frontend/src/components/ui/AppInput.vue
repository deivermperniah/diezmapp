<script setup>
defineProps({
  id: { type: String, required: true },
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  required: { type: Boolean, default: false },
  min: { type: [String, Number], default: null },
  max: { type: [String, Number], default: null },
  step: { type: [String, Number], default: null },
})

defineEmits(['update:modelValue', 'change'])
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
    fluid
    @update:model-value="$emit('update:modelValue', $event ?? '')"
    @change="$emit('change', $event)"
  />
  <PInputText
    v-else
    :id="id"
    :model-value="modelValue"
    :type="type"
    :required="required"
    fluid
    @update:model-value="$emit('update:modelValue', $event)"
    @change="$emit('change', $event)"
  />
</template>
