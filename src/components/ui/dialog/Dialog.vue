<script setup lang="ts">
import type { DialogRootProps } from 'reka-ui'
import { DialogRoot } from 'reka-ui'

// open 需显式 default: undefined，避免未传入时被 Vue 转为 false 而变成受控组件
const props = withDefaults(defineProps<DialogRootProps>(), {
  open: undefined,
  defaultOpen: undefined,
})

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()
</script>

<template>
  <DialogRoot
    v-bind="props"
    @update:open="emit('update:open', $event)"
  >
    <slot />
  </DialogRoot>
</template>
