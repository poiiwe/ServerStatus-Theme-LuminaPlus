<script setup lang="ts">
import { ProgressIndicator, ProgressRoot } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  /** 当前进度值 */
  value?: number
  /** 最大值 */
  max?: number
  class?: string
  /** 进度条填充部分的额外类名（如按用量分级的警示色） */
  indicatorClass?: string
}>(), {
  value: 0,
  max: 100,
})

const percent = computed(() => {
  const max = props.max > 0 ? props.max : 100
  return Math.min(100, Math.max(0, (props.value / max) * 100))
})
</script>

<template>
  <ProgressRoot
    :model-value="props.value"
    :max="props.max"
    :class="cn('relative h-5 w-full overflow-hidden rounded-full bg-secondary text-xs', props.class)"
  >
    <ProgressIndicator
      :class="cn('h-full w-full flex-1 bg-primary transition-all', props.indicatorClass)"
      :style="`transform: translateX(-${100 - percent}%);`"
    />
    <div class="absolute inset-0 flex items-center justify-center whitespace-nowrap px-2">
      <slot />
    </div>
  </ProgressRoot>
</template>
