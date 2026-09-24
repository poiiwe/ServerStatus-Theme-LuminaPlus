<template>
  <span class="tabular-nums">
    <span class="font-semibold text-metric-cpu">{{ parts.num }}</span>
    <span class="text-[10px] font-normal text-muted-foreground">{{ parts.unit }}</span>
  </span>
</template>

<script setup lang="ts">
/**
 * 在线时长文本：数字加粗 CPU 蓝、单位缩小灰色（对齐 LuminaPlus 的 “4天” 排版）。
 * 解析服务端 uptime 字符串（如 “1 天”“3 小时”“5 分钟”）为数字 + 单位两段。
 */
const props = defineProps<{
  uptime: string
}>()

const parts = computed(() => {
  const m = props.uptime.match(/^(\d+)\s*(.*)$/)
  if (!m)
    return { num: props.uptime, unit: '' }
  return { num: m[1], unit: m[2] }
})
</script>
