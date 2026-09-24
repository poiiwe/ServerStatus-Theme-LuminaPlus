<template>
  <Card class="overflow-hidden p-0">
    <!-- 窄窗口：低优先级列自动隐藏（系统 <1024px、流量 <768px），极小窗口保留横向滚动，滚动条常驻可见 -->
    <div class="table-scrollbar overflow-x-auto pb-1">
      <!-- table-fixed：列宽由表头定义固定，任何单元格内容变化都不会引起列宽抖动 -->
      <table class="w-full min-w-[700px] table-fixed text-sm lg:min-w-[1180px]">
        <thead>
          <tr class="border-b text-left text-xs text-muted-foreground">
            <th class="w-[160px] px-4 py-2.5 font-medium lg:w-[210px]">
              节点
            </th>
            <th class="hidden w-[130px] px-3 py-2.5 font-medium lg:table-cell">
              系统
            </th>
            <!-- CPU/内存/磁盘：小屏给固定窄宽防压爆，桌面端恢复平分剩余空间；进度条仅宽屏显示 -->
            <th class="w-[64px] px-2 py-2.5 font-medium lg:w-auto lg:px-3">
              CPU
            </th>
            <th class="w-[64px] px-2 py-2.5 font-medium lg:w-auto lg:px-3">
              内存
            </th>
            <th class="w-[64px] px-2 py-2.5 font-medium lg:w-auto lg:px-3">
              磁盘
            </th>
            <th class="w-[84px] px-2 py-2.5 font-medium lg:w-[100px] lg:px-3">
              负载
            </th>
            <th class="w-[92px] px-2 py-2.5 font-medium lg:w-[104px] lg:px-3">
              实时
            </th>
            <th class="hidden w-[104px] px-3 py-2.5 font-medium md:table-cell">
              流量
            </th>
            <th class="w-[108px] px-2 py-2.5 font-medium lg:w-[130px] lg:px-3">
              网络
            </th>
            <th class="w-[90px] px-3 py-2.5 font-medium lg:w-[110px]">
              在线
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="server, index in servers"
            :key="index"
            class="cursor-pointer border-b transition-colors duration-150 last:border-0 hover:bg-primary/[0.06]"
            :class="{ 'bg-red-500/[0.04]': !isOnline(server) }"
            @click="emit('select', server)"
          >
            <!-- 节点：名称 + 配置徽标；固定列宽，名称超长省略 -->
            <td class="px-4 py-2.5">
              <div class="flex items-center gap-1.5">
                <FlagIcon :code="server.location" />
                <span class="min-w-0 truncate font-medium">{{ server.alias || server.name }}</span>
              </div>
              <div v-if="nodeBadge(server)" class="mt-1">
                <span class="flex w-fit items-center gap-0.5 rounded bg-online/15 px-1 py-px text-[10px] font-medium text-online">
                  <Tag class="h-2.5 w-2.5" aria-hidden="true" />
                  {{ nodeBadge(server) }}
                </span>
              </div>
            </td>
            <!-- 系统：OS logo + 名称（版本取原串第一段）；窄窗口隐藏 -->
            <td class="hidden px-3 py-2.5 text-muted-foreground lg:table-cell">
              <span v-if="parseLabels(server.labels).os" class="flex items-center gap-1.5">
                <OsLogo :os="parseLabels(server.labels).os" :size="16" />
                <span class="text-xs capitalize">{{ formatOsLabel(parseLabels(server.labels).os) }}</span>
              </span>
              <span v-else>—</span>
            </td>
            <!-- CPU -->
            <td class="overflow-hidden px-2 py-2.5 lg:px-3">
              <template v-if="server.cpu !== undefined">
                <div class="truncate font-medium tabular-nums">
                  {{ pctText(server.cpu / 100) }}<span class="text-xs text-muted-foreground">%</span>
                </div>
                <SegmentedProgress :value="server.cpu" fill-class="bg-metric-cpu" class="mt-1 hidden h-1 w-full lg:flex" :segments="10" />
              </template>
              <span v-else>—</span>
            </td>
            <!-- 内存 -->
            <td class="overflow-hidden px-2 py-2.5 lg:px-3">
              <template v-if="server.memory_total !== undefined">
                <div class="truncate font-medium tabular-nums">
                  {{ pctText(server.memory_used / server.memory_total) }}<span class="text-xs text-muted-foreground">%</span>
                </div>
                <SegmentedProgress
                  :value="server.memory_used" :max="server.memory_total"
                  fill-class="bg-metric-memory" class="mt-1 hidden h-1 w-full lg:flex" :segments="10"
                />
              </template>
              <span v-else>—</span>
            </td>
            <!-- 磁盘 -->
            <td class="overflow-hidden px-2 py-2.5 lg:px-3">
              <template v-if="server.hdd_total !== undefined">
                <div class="truncate font-medium tabular-nums">
                  {{ pctText(server.hdd_used / server.hdd_total) }}<span class="text-xs text-muted-foreground">%</span>
                </div>
                <SegmentedProgress
                  :value="server.hdd_used" :max="server.hdd_total"
                  fill-class="bg-metric-disk" class="mt-1 hidden h-1 w-full lg:flex" :segments="10"
                />
              </template>
              <span v-else>—</span>
            </td>
            <!-- 负载 -->
            <td class="overflow-hidden px-2 py-2.5 lg:px-3">
              <div class="truncate font-medium tabular-nums text-metric-load">
                {{ formatLoad(server.load_1 ?? server.load) }}
              </div>
              <SegmentedProgress
                v-if="loadPercent(server) !== undefined"
                :value="loadPercent(server)!" fill-class="bg-metric-load" class="mt-1 hidden h-1 w-full lg:flex" :segments="10"
              />
            </td>
            <!-- 实时：速率按档位着色（B/s 绿、KB/s 琥珀、MB/s 橙、GB/s 红），箭头弱化；固定列宽不换行，避免数值位数变化引起表格整体移动 -->
            <td class="w-[104px] whitespace-nowrap px-2 py-2.5 text-xs tabular-nums lg:px-3">
              <div class="flex items-center gap-1 font-semibold" :class="speedRateClass(server.network_tx ?? 0)">
                <ArrowUp class="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
                {{ formatBytes(server.network_tx ?? 0, 1) }}/s
              </div>
              <div class="flex items-center gap-1 font-semibold" :class="speedRateClass(server.network_rx ?? 0)">
                <ArrowDown class="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
                {{ formatBytes(server.network_rx ?? 0, 1) }}/s
              </div>
            </td>
            <!-- 流量：灰色累计；固定列宽不换行；窄窗口隐藏 -->
            <td class="hidden w-[104px] whitespace-nowrap px-3 py-2.5 text-xs tabular-nums text-muted-foreground md:table-cell">
              <div class="flex items-center gap-1">
                <ArrowUp class="h-3 w-3 shrink-0" aria-hidden="true" />
                {{ formatBytes(server.network_out ?? 0, 1) }}
              </div>
              <div class="flex items-center gap-1">
                <ArrowDown class="h-3 w-3 shrink-0" aria-hidden="true" />
                {{ formatBytes(server.network_in ?? 0, 1) }}
              </div>
            </td>
            <!-- 网络：延迟 + 丢包摘要（与卡片一致） -->
            <td class="px-2 py-2.5 text-xs tabular-nums lg:px-3">
              <div class="flex items-center gap-2.5">
                <span
                  class="font-medium"
                  :class="pingLatencyClass(ping(server).latency)"
                >{{ ping(server).latency ?? '—' }}<span class="text-[10px] font-normal">ms</span></span>
                <span
                  class="font-medium"
                  :class="pingLossClass(ping(server).loss)"
                >{{ ping(server).loss === null ? '—' : ping(server).loss!.toFixed(1) }}<span
                  v-if="ping(server).loss !== null"
                  class="text-[10px] font-normal"
                >%</span></span>
              </div>
            </td>
            <!-- 在线：时长数字加粗蓝色、单位缩小灰色；离线泛红 -->
            <td class="px-4 py-2.5">
              <div class="flex items-center gap-1.5">
                <StatusIndicator :status="isOnline(server)" class="h-2.5 w-2.5" />
                <span v-if="isOnline(server)" class="text-xs">
                  <UptimeText :uptime="server.uptime" />
                </span>
                <span v-else class="text-xs font-medium text-offline">离线</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ArrowDown, ArrowUp, Tag } from 'lucide-vue-next'
import type { ServerData } from '@/types'
import { formatBytes, formatLoad, isOnline, loadPercent, parseLabels, pctText, pingLatencyClass, pingLossClass, speedRateClass, stablePing } from '@/utils'
import OsLogo from '@/components/OsLogo.vue'
import UptimeText from '@/components/UptimeText.vue'

const props = defineProps<{
  servers: ServerData[]
}>()

const emit = defineEmits<{
  /** 点击行查看详情 */
  select: [server: ServerData]
}>()

/** 节点徽标：展示配置规格（labels.spec） */
function nodeBadge(server: ServerData): string | undefined {
  return parseLabels(server.labels).spec
}

/** 系统名展示：取原串第一段作为名称（对齐 LuminaPlus formatOsLabel），macOS 特殊大小写 */
function formatOsLabel(os: string): string {
  const first = os.split(/[\s/]+/)[0] || os
  if (first.toLowerCase() === 'macos')
    return 'macOS'
  return first
}

/** 稳定版延迟/丢包摘要（与卡片一致，缓存最近一次有效值） */
function ping(server: ServerData) {
  return stablePing(server)
}
</script>
