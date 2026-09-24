<template>
  <!-- 国家代码用方形 SVG 国旗（Windows 不支持旗帜 emoji，emoji 会退化成字母）；
       location 本身已是 emoji 时直接原样显示 -->
  <img
    v-if="!isEmoji"
    :src="`/image/flags/${code.toLowerCase()}.svg`"
    :alt="`${code} flag`"
    :class="size === 'md' ? 'h-4' : 'h-3.5'"
    class="inline-block"
  >
  <span v-else class="leading-none">{{ code }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isCountryFlagEmoji } from '@/utils'

const props = withDefaults(defineProps<{
  code: string
  size?: 'sm' | 'md'
}>(), {
  size: 'sm',
})

const isEmoji = computed(() => isCountryFlagEmoji(props.code))
</script>
