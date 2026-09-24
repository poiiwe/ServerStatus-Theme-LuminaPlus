<template>
  <div
    class="flex w-full items-center gap-[2px]"
    role="progressbar"
    :aria-valuenow="Math.round(percent)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div
      v-for="i in segments"
      :key="i"
      class="h-full flex-1 rounded-full transition-colors duration-300"
      :class="i <= filledSegments ? fillClass : 'bg-progress-bg'"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** 当前值 */
  value: number
  /** 最大值 */
  max?: number
  /** 分段数量 */
  segments?: number
  /** 已填充分段的颜色类名，如 bg-metric-cpu */
  fillClass?: string
}>(), {
  max: 100,
  segments: 10,
  fillClass: 'bg-metric-cpu',
})

const percent = computed(() => {
  const max = props.max > 0 ? props.max : 100
  return Math.min(100, Math.max(0, (props.value / max) * 100))
})

const filledSegments = computed(() => Math.round((percent.value / 100) * props.segments))
</script>
