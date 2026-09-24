<template>
  <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
    <!-- 在线节点 -->
    <Card class="p-3">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs text-muted-foreground">在线节点</span>
        <div class="flex items-baseline gap-1">
          <span class="text-xl font-semibold leading-none">{{ onlineCount }}</span>
          <span class="text-xs text-muted-foreground">/ {{ servers.length }}</span>
        </div>
      </div>
      <div class="mt-2 flex gap-[3px]">
        <Tooltip v-for="server, index in servers" :key="index">
          <TooltipTrigger as-child>
            <div
              class="h-1.5 flex-1 rounded-full"
              :class="isOnline(server) ? 'bg-online' : 'bg-offline'"
            />
          </TooltipTrigger>
          <TooltipContent>
            {{ server.alias || server.name }}：{{ isOnline(server) ? '在线' : '离线' }}
          </TooltipContent>
        </Tooltip>
      </div>
    </Card>

    <!-- 实时带宽 -->
    <Card class="p-3">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs text-muted-foreground">实时带宽</span>
        <span class="text-xl font-semibold leading-none text-metric-disk">{{ formatSpeed(totalRx + totalTx) }}</span>
      </div>
      <div class="mt-2 flex gap-3 text-xs text-muted-foreground">
        <span class="flex items-center gap-1">
          <ArrowUpToLine class="h-3 w-3 text-traffic-up" />
          {{ formatSpeed(totalTx) }}
        </span>
        <span class="flex items-center gap-1">
          <ArrowDownToLine class="h-3 w-3 text-traffic-down" />
          {{ formatSpeed(totalRx) }}
        </span>
      </div>
    </Card>

    <!-- 累计流量 -->
    <Card class="p-3">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs text-muted-foreground">累计流量</span>
        <span class="text-xl font-semibold leading-none">{{ formatBytes(totalIn + totalOut, 1) }}</span>
      </div>
      <div class="mt-2 flex gap-3 text-xs text-muted-foreground">
        <span class="flex items-center gap-1">
          <ArrowUpToLine class="h-3 w-3 text-traffic-up" />
          {{ formatBytes(totalOut, 1) }}
        </span>
        <span class="flex items-center gap-1">
          <ArrowDownToLine class="h-3 w-3 text-traffic-down" />
          {{ formatBytes(totalIn, 1) }}
        </span>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ArrowDownToLine, ArrowUpToLine } from 'lucide-vue-next'
import type { ServerData } from '@/types'
import { formatBytes, isOnline } from '@/utils'

const props = defineProps<{
  servers: ServerData[]
}>()

const onlineCount = computed(() => props.servers.filter(isOnline).length)
const totalRx = computed(() => props.servers.reduce((sum, s) => sum + (s.network_rx ?? 0), 0))
const totalTx = computed(() => props.servers.reduce((sum, s) => sum + (s.network_tx ?? 0), 0))
const totalIn = computed(() => props.servers.reduce((sum, s) => sum + (s.network_in ?? 0), 0))
const totalOut = computed(() => props.servers.reduce((sum, s) => sum + (s.network_out ?? 0), 0))

function formatSpeed(bytesPerSecond: number) {
  return `${formatBytes(bytesPerSecond, 1)}/s`
}
</script>
