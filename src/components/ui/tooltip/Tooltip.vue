<script setup lang="ts">
import type { TooltipRootProps } from 'reka-ui'
import { TooltipProvider, TooltipRoot } from 'reka-ui'

// open 需显式 default: undefined，避免未传入时被 Vue 转为 false 而变成受控组件
const props = withDefaults(defineProps<TooltipRootProps>(), {
  open: undefined,
  defaultOpen: undefined,
})

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <TooltipRoot
      v-bind="props"
      @update:open="emit('update:open', $event)"
    >
      <slot />
    </TooltipRoot>
  </TooltipProvider>
</template>
