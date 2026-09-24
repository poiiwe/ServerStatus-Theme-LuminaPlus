<script setup lang="ts">
import type { ToggleGroupRootProps } from 'reka-ui'
import { ToggleGroupRoot } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<ToggleGroupRootProps & { class?: string }>()

const emit = defineEmits<{
  'update:modelValue': ToggleGroupRootProps['modelValue']
}>()
</script>

<template>
  <ToggleGroupRoot
    v-bind="props"
    :class="cn('flex items-center justify-center gap-1', props.class)"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <slot />
  </ToggleGroupRoot>
</template>
