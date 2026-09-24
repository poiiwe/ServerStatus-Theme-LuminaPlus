<template>
  <div class="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <button
      class="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors"
      :class="!modelValue
        ? 'border-transparent bg-primary text-primary-foreground'
        : 'bg-card text-muted-foreground hover:text-foreground'"
      @click="$emit('update:modelValue', '')"
    >
      全部
    </button>
    <button
      v-for="region in regions"
      :key="region.key"
      class="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors"
      :class="modelValue === region.key
        ? 'border-transparent bg-primary text-primary-foreground'
        : 'bg-card text-muted-foreground hover:text-foreground'"
      @click="$emit('update:modelValue', region.key)"
    >
      <FlagIcon :code="region.key" />
      <span class="uppercase">{{ region.isEmoji ? '' : region.key }}</span>
      <span class="text-xs opacity-70">{{ region.count }}</span>
    </button>
  </div>
</template>

<script lang="ts">
export interface RegionItem {
  key: string
  count: number
  isEmoji: boolean
}
</script>

<script setup lang="ts">
defineProps<{
  regions: RegionItem[]
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [key: string]
}>()
</script>
