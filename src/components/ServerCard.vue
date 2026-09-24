<template>
  <Card
    class="relative cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/40 hover:shadow-lg hover:ring-1 hover:ring-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    role="button"
    tabindex="0"
    :aria-label="`查看 ${server.alias || server.name} 的详细信息`"
    @click="emit('select', server)"
    @keydown.enter="emit('select', server)"
    @keydown.space.prevent="emit('select', server)"
  >
    <!-- 状态指示 + 详情 tooltip -->
    <div class="absolute right-3 top-3">
      <Tooltip>
        <TooltipTrigger as-child>
          <StatusIndicator
            :status="isOnline(server)"
            class="h-3 w-3 cursor-help"
          />
        </TooltipTrigger>
        <TooltipContent>
          <div class="flex gap-3">
            <div class="flex items-center gap-1">
              IPv4
              <StatusIndicator :status="server.online4" class="h-2 w-2" />
            </div>
            <div class="flex items-center gap-1">
              IPv6
              <StatusIndicator :status="server.online6" class="h-2 w-2" />
            </div>
          </div>
          <div v-if="server.latest_ts !== undefined">
            最后上报时间<br>
            {{ formatTime(server.latest_ts) }}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>

    <!-- 标题行：国旗 + 名称（离线时名称泛红） -->
    <div class="flex items-center gap-1.5 pr-5">
      <FlagIcon :code="server.location" />
      <span
        class="truncate text-sm font-semibold"
        :class="{ 'text-offline': !isOnline(server) }"
      >{{ server.alias || server.name }}</span>
    </div>

    <!-- V4/V6 徽标 + 配置徽标（labels.spec） -->
    <div class="mt-1.5 flex gap-1">
      <span
        class="rounded px-1 py-px text-[10px] font-medium"
        :class="server.online4 ? 'bg-online/15 text-online' : 'bg-muted text-muted-foreground'"
      >V4</span>
      <span
        class="rounded px-1 py-px text-[10px] font-medium"
        :class="server.online6 ? 'bg-online/15 text-online' : 'bg-muted text-muted-foreground'"
      >V6</span>
      <span
        v-if="labels.spec"
        class="flex items-center gap-0.5 rounded bg-online/15 px-1 py-px text-[10px] font-medium text-online"
      >
        <Tag class="h-2.5 w-2.5" aria-hidden="true" />
        {{ labels.spec }}
      </span>
    </div>

    <!-- CPU 图表（可选）：懒初始化——滚动进入视口后才创建 ECharts 实例，避免几十张卡片同时初始化阻塞首屏 -->
    <div v-if="showCpuChart" ref="chartWrap" class="mt-2 h-[100px]">
      <StatusChart v-if="chartVisible" :data="cpuHistory" class="h-full" />
    </div>

    <!-- 度量网格 -->
    <div class="mt-3 grid grid-cols-2 gap-x-3 gap-y-3">
      <MetricItem
        v-if="server.cpu !== undefined"
        label="CPU" :value="pctText(server.cpu / 100)" unit="%"
        :percent="server.cpu" fill-class="bg-metric-cpu"
      >
        <template #icon>
          <Cpu class="h-3 w-3" />
        </template>
      </MetricItem>
      <MetricItem
        v-if="server.memory_total !== undefined"
        label="内存" :value="memoryPercent" unit="%"
        :percent="server.memory_used" :max="server.memory_total" fill-class="bg-metric-memory"
      >
        <template #icon>
          <MemoryStick class="h-3 w-3" />
        </template>
      </MetricItem>
      <MetricItem
        v-if="server.hdd_total !== undefined"
        label="磁盘" :value="hddPercent" unit="%"
        :percent="server.hdd_used" :max="server.hdd_total" fill-class="bg-metric-disk"
      >
        <template #icon>
          <HardDrive class="h-3 w-3" />
        </template>
      </MetricItem>
      <MetricItem
        v-if="hasAnyLoad"
        label="负载" :value="loadText"
        :percent="loadPercent(server)" fill-class="bg-metric-load"
        value-class="text-metric-load"
      >
        <template #icon>
          <Gauge class="h-3 w-3" />
        </template>
      </MetricItem>
    </div>

    <!-- 速率与流量：区块间细分隔线（对齐 LuminaPlus 节奏）；实时速率按档位着色，累计灰色，箭头弱化 -->
    <div class="mt-3 space-y-1.5 border-t pt-2 text-[13px]">
      <div class="grid grid-cols-2 items-center gap-x-3">
        <span class="flex items-center gap-1">
          <ArrowUp class="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span
            class="font-semibold tabular-nums"
            :class="speedRateClass(server.network_tx ?? 0)"
          >
            {{ formatBytes(server.network_tx ?? 0, 1) }}<span class="text-[10px] font-normal">/s</span>
          </span>
        </span>
        <span class="flex items-center gap-1 text-muted-foreground">
          <ArrowUp class="h-3 w-3 shrink-0" aria-hidden="true" />
          <span class="font-medium tabular-nums">{{ formatBytes(server.network_out ?? 0, 1) }}</span>
        </span>
      </div>
      <div class="grid grid-cols-2 items-center gap-x-3">
        <span class="flex items-center gap-1">
          <ArrowDown class="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span
            class="font-semibold tabular-nums"
            :class="speedRateClass(server.network_rx ?? 0)"
          >
            {{ formatBytes(server.network_rx ?? 0, 1) }}<span class="text-[10px] font-normal">/s</span>
          </span>
        </span>
        <span class="flex items-center gap-1 text-muted-foreground">
          <ArrowDown class="h-3 w-3 shrink-0" aria-hidden="true" />
          <span class="font-medium tabular-nums">{{ formatBytes(server.network_in ?? 0, 1) }}</span>
        </span>
      </div>
    </div>

    <!-- 延迟与丢包：左列延迟、右列丢包，同列对齐；数值五档着色，丢包保留一位小数 -->
    <div class="mt-3 grid grid-cols-2 gap-x-3 border-t pt-2 text-[13px] text-muted-foreground">
      <span class="flex items-center gap-1">
        <Clock class="h-3 w-3" />
        延迟
        <span
          class="font-medium tabular-nums"
          :class="pingLatencyClass(ping.latency)"
        >{{ ping.latency ?? '—' }}<span class="text-[10px] font-normal">ms</span></span>
      </span>
      <span class="flex items-center gap-1">
        <Activity class="h-3 w-3" />
        丢包
        <span
          class="font-medium tabular-nums"
          :class="pingLossClass(ping.loss)"
        >{{ ping.loss === null ? '—' : ping.loss.toFixed(1) }}<template v-if="ping.loss !== null"><span class="text-[10px] font-normal">%</span></template></span>
      </span>
    </div>

    <!-- 运行时间：标签灰色弱化，时长数字加粗蓝色、单位缩小灰色 -->
    <div class="mt-3 border-t pt-2 text-xs text-muted-foreground">
      运行时间
      <span v-if="isOnline(server)">
        <UptimeText :uptime="server.uptime" />
      </span>
      <span v-else class="font-medium text-offline">离线</span>
    </div>
  </Card>
</template>

<script setup lang="ts">
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Clock,
  Cpu,
  Gauge,
  HardDrive,
  MemoryStick,
  Tag,
} from 'lucide-vue-next'
import type { ServerData } from '@/types'
import { formatBytes, formatLoad, formatTime, isOnline, loadPercent, parseLabels, pctText, pingLatencyClass, pingLossClass, speedRateClass, stablePing } from '@/utils'
import UptimeText from '@/components/UptimeText.vue'

const props = defineProps<{
  server: ServerData
  showCpuChart: boolean
  /** CPU 图表保留的历史时长（秒） */
  historyKeep?: number
}>()

const emit = defineEmits<{
  /** 点击卡片查看详情 */
  select: [server: ServerData]
}>()

const StatusChart = defineAsyncComponent(() => import('@/components/StatusChart.vue'))

// 开启 CPU 记录时立即预取图表 chunk，避免首张卡片渲染时才发起 500KB 的异步下载
watch(() => props.showCpuChart, (v) => {
  if (v)
    import('@/components/StatusChart.vue')
}, { immediate: true })

// 图表懒初始化：进入视口（提前 200px）才挂载，离开视口不销毁（保留实例与历史展示）
const chartWrap = ref<HTMLElement>()
const chartVisible = ref(false)
let chartObserver: IntersectionObserver | undefined
watch(chartWrap, (el) => {
  if (!el || chartVisible.value)
    return
  chartObserver?.disconnect()
  chartObserver = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      chartVisible.value = true
      chartObserver?.disconnect()
    }
  }, { rootMargin: '200px' })
  chartObserver.observe(el)
})
onBeforeUnmount(() => chartObserver?.disconnect())

const DEFAULT_HISTORY_KEEP = 300
let cpuHistoryLastUpdated = 0

const cpuHistory = ref<any[]>([])

const memoryPercent = computed(() =>
  props.server.memory_total ? pctText(props.server.memory_used / props.server.memory_total) : '0',
)
const hddPercent = computed(() =>
  props.server.hdd_total ? pctText(props.server.hdd_used / props.server.hdd_total) : '0',
)
const hasAnyLoad = computed(() =>
  props.server.load !== undefined || props.server.load_1 !== undefined
  || props.server.load_5 !== undefined || props.server.load_15 !== undefined,
)
const loadText = computed(() => formatLoad(props.server.load_1 ?? props.server.load))
const ping = computed(() => stablePing(props.server))
const labels = computed(() => parseLabels(props.server.labels))

watch(() => props.server, () => {
  if (props.server.latest_ts && props.server.cpu) {
    if (props.server.latest_ts <= cpuHistoryLastUpdated)
      return

    const keepTime = props.historyKeep ?? DEFAULT_HISTORY_KEEP
    const list = cpuHistory.value.slice()
    list.push({
      name: Date.now(),
      value: [
        props.server.latest_ts * 1000,
        props.server.cpu,
      ],
    })
    while (list[0].name < Date.now() - keepTime * 1000)
      list.shift()

    cpuHistory.value = list
    cpuHistoryLastUpdated = props.server.latest_ts
  }
})
</script>
