<template>
  <div>
    <div class="text-xs text-muted-foreground">
      {{ label }}
    </div>
    <div
      class="mt-0.5 text-sm font-medium tabular-nums"
      :class="valueClass"
    >
      {{ value }}
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: string
  /** 数值颜色类名，如 text-metric-load */
  valueClass?: string
}>(), {
  valueClass: '',
})
</script>
