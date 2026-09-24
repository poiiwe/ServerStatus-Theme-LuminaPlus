<template>
  <span
    class="inline-block rounded-full"
    :class="status ? 'bg-online' : 'bg-offline'"
    role="img"
    :aria-label="status ? '在线' : '离线'"
  />
</template>

<script setup lang="ts">
defineProps<{
  status: boolean
}>()
</script>
