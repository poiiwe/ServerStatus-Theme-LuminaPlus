<template>
  <!-- 顶栏工具区 -->
  <div class="absolute right-3 top-4 flex items-center gap-1 sm:right-6">
    <ToggleGroup
      v-model="themeMode"
      type="single"
      class="rounded-full border bg-card p-0.5"
    >
      <ToggleGroupItem value="auto" aria-label="跟随系统" class="h-7 w-7 rounded-full">
        <Monitor class="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="light" aria-label="浅色" class="h-7 w-7 rounded-full">
        <Sun class="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="深色" class="h-7 w-7 rounded-full">
        <Moon class="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
    <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full" aria-label="刷新" @click="fetchData">
      <RotateCw class="h-4 w-4" />
    </Button>
    <Popover v-model:open="showSettingPanel">
      <PopoverTrigger as-child>
        <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full" aria-label="设置">
          <Settings2 class="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-64">
        <h2 class="mb-3 font-semibold leading-none">
          设置
        </h2>
        <div class="flex flex-col gap-3">
          <SettingItem title="视图模式">
            <ToggleGroup
              v-model="layout"
              type="single"
              class="rounded-md border p-0.5"
            >
              <ToggleGroupItem value="card" aria-label="迷你卡片">
                <LayoutGrid class="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="列表视图">
                <List class="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </SettingItem>
          <SettingItem title="CPU图表">
            <Switch v-model="settings.showCpuChart" />
          </SettingItem>
          <SettingItem v-show="settings.showCpuChart" title="记录时间">
            <Select v-model="settings.cpuChartHistoryKeep">
              <SelectTrigger class="h-8 w-28" aria-label="记录时间">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="60">
                  1分钟
                </SelectItem>
                <SelectItem :value="180">
                  3分钟
                </SelectItem>
                <SelectItem :value="300">
                  5分钟
                </SelectItem>
                <SelectItem :value="600">
                  10分钟
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingItem>
          <Separator />
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between gap-2">
              <Label>深色深度</Label>
              <span class="text-xs text-muted-foreground">{{ settings.darkDepth }}</span>
            </div>
            <Slider
              v-model="darkDepthModel"
              :min="0" :max="100" :step="5"
              aria-label="深色深度"
            />
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between gap-2">
              <Label>卡片不透明度</Label>
              <span class="text-xs text-muted-foreground">{{ settings.surfaceAlpha }}</span>
            </div>
            <Slider
              v-model="surfaceAlphaModel"
              :min="0" :max="100" :step="5"
              aria-label="卡片不透明度"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>

  <div v-if="loading" class="flex justify-center py-2">
    <Badge variant="secondary" class="px-4 py-2 text-sm">
      加载中
    </Badge>
  </div>
  <div v-if="error" class="flex justify-center py-2">
    <Badge variant="destructive" class="px-4 py-2 text-sm">
      数据加载失败，请尝试刷新页面或检查 ServerStatus 服务端状态
    </Badge>
  </div>

  <template v-if="serverData">
    <!-- 摘要卡片 -->
    <StatsOverview :servers="serverData.servers" class="mb-3" />

    <!-- 筛选栏：地区筛选 + 排序 -->
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <RegionFilter
        v-model="settings.regionFilter"
        :regions="regions"
        class="min-w-0 flex-1"
      />
      <div>
        <Select v-model="settings.sortBy">
          <SelectTrigger class="h-8 w-32" aria-label="排序方式">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">
              默认排序
            </SelectItem>
            <SelectItem value="name">
              按名称
            </SelectItem>
            <SelectItem value="cpu">
              按 CPU
            </SelectItem>
            <SelectItem value="memory">
              按内存
            </SelectItem>
            <SelectItem value="network">
              按网络速率
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- 节点卡片 / 列表（不做位移动画，原地切换，避免卡顿感） -->
    <div v-if="!filteredServers.length" class="py-8 text-center text-sm text-muted-foreground">
      没有符合筛选条件的节点
    </div>
    <div
      v-else-if="layout === 'card'"
      class="grid gap-4"
      :style="{
        gridTemplateColumns: `repeat(${serverCardCount}, minmax(0, 1fr))`,
      }"
    >
      <ServerCard
        v-for="server, index in filteredServers" :key="index"
        :server="server"
        :show-cpu-chart="settings.showCpuChart"
        :history-keep="settings.cpuChartHistoryKeep"
        class="col-span-1"
        @select="openDetail"
      />
    </div>
    <ServerTable
      v-else
      :servers="filteredServers"
      @select="openDetail"
    />

    <!-- 服务器详情弹窗 -->
    <ServerDetailDialog v-model:open="detailOpen" :server="selectedServer" />
  </template>
  <div class="h-16" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLocalStorage, useWindowSize } from '@vueuse/core'
import {
  LayoutGrid,
  List,
  Monitor,
  Moon,
  RotateCw,
  Settings2,
  Sun,
} from 'lucide-vue-next'
import type { ServerData } from './types'
import { useTheme } from './composables/useTheme'
import type { RegionItem } from './components/RegionFilter.vue'
import { isCountryFlagEmoji, isOnline } from './utils'

const JSON_API = '/json/stats.json'
const CARD_WIDTH = 340
const MIN_FETCH_INTERVAL = 500

const { width: WindowWidth } = useWindowSize()
const themeMode = useTheme()

const settings = useLocalStorage('sstl-settings', {
  layout: 'card',
  showCpuChart: false,
  cpuChartHistoryKeep: 300,
  regionFilter: '',
  sortBy: 'default',
  darkDepth: 60,
  surfaceAlpha: 100,
}, {
  mergeDefaults: true,
})

// 视图模式：仅 迷你卡片 / 列表 两种；兼容旧版本的 grid/flex 取值
const layout = computed<'card' | 'list'>({
  get: () => (settings.value.layout === 'list' ? 'list' : 'card'),
  set: v => (settings.value.layout = v),
})

// reka Slider 的 v-model 是 number[]，这里做单值适配
const darkDepthModel = computed({
  get: () => [settings.value.darkDepth],
  set: v => (settings.value.darkDepth = v[0]),
})
const surfaceAlphaModel = computed({
  get: () => [settings.value.surfaceAlpha],
  set: v => (settings.value.surfaceAlpha = v[0]),
})

// 外观变量应用到根元素（配合 tailwind.css 中的 color-mix 令牌）
watchEffect(() => {
  const el = document.documentElement
  el.style.setProperty('--dark-depth', String(settings.value.darkDepth))
  el.style.setProperty('--surface-alpha', String(settings.value.surfaceAlpha))
})

const serverData = ref<{
  updated: number
  servers: ServerData[]
}>()
const loading = ref(true)
const error = ref(false)
const fetching = ref(false)
const showSettingPanel = ref(false)
const latestUpdated = ref(0)
const timer = ref<Worker>()

// 服务器详情弹窗：只记录节点标识，数据每次从最新的 serverData 派生，弹窗内实时刷新；
// 节点从列表消失（如被移除）时回退到打开时抓取的快照，避免弹窗内容突然清空
const selectedName = ref<string | null>(null)
const selectedSnapshot = ref<ServerData | null>(null)
const detailOpen = ref(false)
const selectedServer = computed(() => {
  if (!selectedName.value)
    return null
  return serverData.value?.servers.find(s => s.name === selectedName.value) ?? selectedSnapshot.value
})
function openDetail(server: ServerData) {
  selectedName.value = server.name
  selectedSnapshot.value = server
  detailOpen.value = true
}

const serverCardCount = computed(() => {
  return Math.floor(WindowWidth.value / CARD_WIDTH) || 1
})

/** 按地区（location）分组统计 */
const regions = computed<RegionItem[]>(() => {
  if (!serverData.value)
    return []
  const map = new Map<string, RegionItem>()
  serverData.value.servers.forEach((s) => {
    const key = s.location || 'unknown'
    const item = map.get(key) ?? { key, count: 0, isEmoji: isCountryFlagEmoji(key) }
    item.count += 1
    map.set(key, item)
  })
  return [...map.values()].sort((a, b) => b.count - a.count)
})

// 地区变化后，已失效的筛选条件自动重置，避免页面空白
watch(regions, (list) => {
  if (settings.value.regionFilter && !list.some(r => r.key === settings.value.regionFilter))
    settings.value.regionFilter = ''
})

const filteredServers = computed(() => {
  if (!serverData.value)
    return []
  let list = [...serverData.value.servers]

  if (settings.value.regionFilter)
    list = list.filter(s => (s.location || 'unknown') === settings.value.regionFilter)

  switch (settings.value.sortBy) {
    case 'name':
      list.sort((a, b) => (a.alias || a.name).localeCompare(b.alias || b.name))
      break
    case 'cpu':
      list.sort((a, b) => (b.cpu ?? -1) - (a.cpu ?? -1))
      break
    case 'memory':
      list.sort((a, b) =>
        (b.memory_total ? b.memory_used / b.memory_total : -1)
        - (a.memory_total ? a.memory_used / a.memory_total : -1))
      break
    case 'network':
      list.sort((a, b) =>
        ((b.network_rx ?? 0) + (b.network_tx ?? 0)) - ((a.network_rx ?? 0) + (a.network_tx ?? 0)))
      break
    default:
      // 在线的排前面，其余保持服务端顺序
      list.sort((a, b) => Number(isOnline(b)) - Number(isOnline(a)))
  }
  return list
})

onMounted(() => {
  fetch(JSON_API)
    .then(res => res.json())
    .then((data) => {
      serverData.value = data
      timer.value = new Worker(new URL('./worker/timer.js', import.meta.url))
      timer.value.addEventListener('message', () => {
        fetchData()
      })
      timer.value.postMessage('start')
    })
    .catch(() => {
      error.value = true
    })
    .finally(() => {
      loading.value = false
    })
})

onUnmounted(() => {
  if (timer.value)
    timer.value.postMessage('stop')
})

function fetchData() {
  if (fetching.value)
    return
  if (Date.now() - latestUpdated.value < MIN_FETCH_INTERVAL)
    return
  fetching.value = true
  fetch(JSON_API)
    .then(res => res.json())
    .then((data) => {
      serverData.value = data
      error.value = false
    })
    .catch(() => {
      error.value = true
    })
    .finally(() => {
      fetching.value = false
      latestUpdated.value = Date.now()
    })
}
</script>
