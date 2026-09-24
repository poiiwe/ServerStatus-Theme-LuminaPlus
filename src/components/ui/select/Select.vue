<script setup lang="ts">
import type { SelectRootProps } from 'reka-ui'
import { SelectRoot } from 'reka-ui'

// 注意：open 必须显式声明 default: undefined，
// 否则 Vue 会把未传入的 Boolean prop 强制转为 false，导致 Select 变成受控组件而无法展开。
const props = withDefaults(defineProps<SelectRootProps>(), {
  open: undefined,
  defaultOpen: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: SelectRootProps['modelValue']): void
  (e: 'update:open', open: boolean): void
}>()
</script>

<template>
  <SelectRoot
    v-bind="props"
    @update:model-value="emit('update:modelValue', $event)"
    @update:open="emit('update:open', $event)"
  >
    <slot />
  </SelectRoot>
</template>
