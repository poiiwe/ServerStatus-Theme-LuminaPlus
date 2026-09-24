<script setup lang="ts">
import type { SelectValueProps } from 'reka-ui'
import { SelectValue } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<SelectValueProps & { class?: string }>()
</script>

<template>
  <SelectValue v-bind="props" :class="cn(props.class)">
    <slot />
  </SelectValue>
</template>
