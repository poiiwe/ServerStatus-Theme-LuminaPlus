<template>
  <div class="flex items-center justify-between gap-2">
    <Label>{{ title }}</Label>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
