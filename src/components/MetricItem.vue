<template>
  <div>
    <div class="flex items-center justify-between gap-2">
      <span class="flex items-center gap-1 text-sm text-muted-foreground">
        <slot name="icon" />
        {{ label }}
      </span>
      <span class="text-sm font-semibold tabular-nums">
        <span :class="valueClass">{{ value }}</span>
        <span v-if="unit" class="ml-0.5 text-xs font-normal text-muted-foreground">{{ unit }}</span>
      </span>
    </div>
    <SegmentedProgress
      v-if="percent !== undefined"
      :value="percent" :max="max" :fill-class="fillClass" :segments="segments"
      class="mt-2 h-2"
    />
    <div v-if="sub" class="mt-1 text-xs text-muted-foreground">
      {{ sub }}
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: string
  unit?: string
  sub?: string
  /** 传入则显示分段进度条 */
  percent?: number
  max?: number
  /** 进度条分段数 */
  segments?: number
  fillClass?: string
  valueClass?: string
}>(), {
  max: 100,
  segments: 18,
  fillClass: 'bg-metric-cpu',
  valueClass: '',
})
</script>
