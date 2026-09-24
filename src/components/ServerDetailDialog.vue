<template>
  <Dialog v-model:open="open">
    <DialogContent v-if="server">
      <DialogHeader>
        <div class="flex items-center gap-2">
          <FlagIcon :code="server.location" size="md" />
          <DialogTitle>{{ server.alias || server.name }}</DialogTitle>
          <StatusIndicator :status="isOnline(server)" class="h-2.5 w-2.5" />
          <span class="text-xs" :class="isOnline(server) ? 'text-muted-foreground' : 'text-offline'">
            {{ isOnline(server) ? '在线' : '离线' }}
          </span>
        </div>
        <DialogDescription>
          {{ osName || '未知系统' }}<template v-if="server.cpu_num"> · {{ server.cpu_num }} 核</template>
          <template v-if="server.type"> · {{ server.type }}</template>
        </DialogDescription>
      </DialogHeader>

      <!-- 概览指标 -->
      <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        <DetailItem label="CPU" :value="server.cpu !== undefined ? `${server.cpu.toFixed(1)}%` : '—'" />
        <DetailItem label="负载 (1/5/15)" :value="loadText" value-class="text-metric-load" />
        <DetailItem label="运行时间" :value="server.uptime || '—'" />
        <DetailItem label="内存" :value="memoryText" />
        <DetailItem label="Swap" :value="swapText" />
        <DetailItem label="磁盘" :value="hddText" />
      </div>

      <Separator />

      <!-- 网络 -->
      <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <DetailItem label="实时速率" :value="`${formatBytes(server.network_tx ?? 0, 1)}/s ↑ · ${formatBytes(server.network_rx ?? 0, 1)}/s ↓`" />
        <DetailItem label="累计流量" :value="`${formatBytes(server.network_out ?? 0, 1)} ↑ · ${formatBytes(server.network_in ?? 0, 1)} ↓`" />
        <DetailItem label="TCP / UDP" :value="`${server.tcp_count ?? 0} / ${server.udp_count ?? 0}`" />
        <DetailItem label="进程 / 线程" :value="`${server.process_count ?? 0} / ${server.thread_count ?? 0}`" />
      </div>

      <Separator />

      <!-- 延迟与丢包 -->
      <div>
        <div class="mb-2 text-xs font-medium text-muted-foreground">
          延迟与丢包
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="p in pings" :key="p.carrier"
            class="rounded-md border bg-muted/40 px-3 py-2 text-center"
            :class="{ 'opacity-60': p.stale }"
          >
            <div class="text-xs text-muted-foreground">
              {{ p.carrier }}
            </div>
            <div class="mt-0.5 text-sm font-semibold tabular-nums">
              {{ p.time > 0 ? `${Math.round(p.time)} ms` : '—' }}
            </div>
            <div
              class="text-xs tabular-nums"
              :class="p.loss > 0 ? 'text-destructive' : 'text-muted-foreground'"
            >
              <template v-if="p.time > 0 || p.loss > 0">
                丢包 {{ p.loss > 0 ? `${p.loss.toFixed(0)}%` : '0%' }}
              </template>
              <template v-else>
                —
              </template>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <!-- 其他 -->
      <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <DetailItem label="节点标识" :value="server.name" />
        <DetailItem label="最后上报" :value="server.latest_ts ? formatTime(server.latest_ts) : '—'" />
        <DetailItem v-if="labels.spec" label="主机规格" :value="labels.spec" />
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import StatusIndicator from '@/components/StatusIndicator.vue'
import DetailItem from '@/components/DetailItem.vue'
import type { ServerData } from '@/types'
import { formatBytes, formatTime, isOnline, parseLabels, stablePingList } from '@/utils'

const props = defineProps<{
  server: ServerData | null
}>()

const open = defineModel<boolean>('open', { default: false })

const labels = computed(() => parseLabels(props.server?.labels))
const osName = computed(() => labels.value.os ?? '')

const pings = computed(() => (props.server ? stablePingList(props.server) : []))

/** stats.json 中内存/磁盘单位是 KiB（si 时为 KB），换算成字节展示 */
function k2b(kb: number) {
  return kb * (props.server?.si ? 1000 : 1024)
}

const loadText = computed(() => {
  const s = props.server
  if (!s)
    return '—'
  const parts = [s.load_1, s.load_5, s.load_15].map(v => (v === undefined ? '—' : v.toFixed(2)))
  return parts.join(' / ')
})

const memoryText = computed(() => {
  const s = props.server
  if (!s || !s.memory_total)
    return '—'
  return `${formatBytes(k2b(s.memory_used), 1)} / ${formatBytes(k2b(s.memory_total), 1)}`
})

const swapText = computed(() => {
  const s = props.server
  if (!s || !s.swap_total)
    return '无'
  return `${formatBytes(k2b(s.swap_used), 1)} / ${formatBytes(k2b(s.swap_total), 1)}`
})

const hddText = computed(() => {
  const s = props.server
  if (!s || !s.hdd_total)
    return '—'
  // hdd 单位是 MB
  const mb2b = (mb: number) => mb * (s.si ? 1_000_000 : 1_048_576)
  return `${formatBytes(mb2b(s.hdd_used), 1)} / ${formatBytes(mb2b(s.hdd_total), 1)}`
})
</script>
