<script setup lang="ts">
import type { ToggleGroupItemProps } from 'reka-ui'
import { ToggleGroupItem } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<ToggleGroupItemProps & { class?: string }>()
</script>

<template>
  <ToggleGroupItem
    v-bind="props"
    :class="cn(
      'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium text-muted-foreground transition-colors',
      'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground',
      'disabled:pointer-events-none disabled:opacity-50',
      props.class,
    )"
  >
    <slot />
  </ToggleGroupItem>
</template>
