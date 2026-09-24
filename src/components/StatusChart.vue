<template>
  <VChart ref="chartRef" class="chart" :option="option" :autoresize="true" />
</template>

<script setup lang="ts">
import type { ComposeOption } from 'echarts/core'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import type { LineSeriesOption } from 'echarts/charts'
import { LineChart } from 'echarts/charts'
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useIsDark } from '@/composables/useTheme'

const props = defineProps<{
  data: any[]
}>()

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
])

type EChartsOption = ComposeOption<
  | TooltipComponentOption
  | GridComponentOption
  | LineSeriesOption
>

const chartRef = ref<any>()
const isDark = useIsDark()

/**
 * 降采样：卡片上的图宽约 300px，显示点数过多既无意义又拖慢渲染。
 * 从完整历史里均匀取样，上限 120 点（折线拐点密度已远超屏幕像素精度）。
 */
function downsample(data: any[], max = 120): any[] {
  if (data.length <= max)
    return data
  const step = data.length / max
  const out: any[] = []
  for (let i = 0; i < max; i++)
    out.push(data[Math.floor(i * step)])
  out.push(data[data.length - 1])
  return out
}

watch(() => props.data, () => {
  chartRef.value?.setOption({
    series: [
      {
        data: downsample(props.data),
      },
    ],
  })
}, { flush: 'post' })

const option = computed<EChartsOption>(() => {
  const axisColor = isDark.value ? '#a1a1aa' : '#71717a'
  // 与主题 --metric-cpu 令牌一致，深浅模式各自取易读的蓝色
  const lineColor = isDark.value ? '#539bf5' : '#3b82f6'
  const areaColor = isDark.value ? 'rgba(83, 155, 245, 0.18)' : 'rgba(59, 130, 246, 0.14)'
  return {
    // 监控场景关闭全部动画：多卡片同屏时动画是渲染卡顿的主要来源
    animation: false,
    grid: {
      left: 40,
      right: 20,
      top: 10,
      bottom: 20,
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        params = params[0]
        return `${formatTime(params.value[0])}: ${params.value[1]}%`
      },
      axisPointer: {
        animation: false,
      },
    },
    xAxis: {
      // 用 value 轴而非 time 轴：time 轴每次更新都要重算刻度范围与标签避让，
      // 多实例下开销显著；value 轴配合 dataMin/dataMax 行为一致且便宜
      type: 'value',
      min: 'dataMin',
      max: 'dataMax',
      splitLine: {
        show: false,
      },
      axisLabel: {
        color: axisColor,
        hideOverlap: true,
        formatter: (value: number) => {
          return formatTime(value)
        },
      },
    },
    yAxis: {
      type: 'value',
      max: (value: any) => {
        return value.max <= 20
          ? 20
          : value.max <= 50
            ? 50
            : 100
      },
      axisLabel: {
        color: axisColor,
        hideOverlap: true,
        showMaxLabel: true,
        formatter: (value: any) => {
          return `${value}%`
        },
      },
    },
    series: [
      {
        data: downsample(props.data),
        type: 'line',
        showSymbol: false,
        lineStyle: {
          color: lineColor,
          width: 2,
        },
        itemStyle: {
          color: lineColor,
        },
        areaStyle: {
          color: areaColor,
        },
      },
    ],
  }
})

function formatTime(time: number) {
  const date = new Date(time)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}
</script>

<style>
.chart {
  width: 100%;
  height: 100px;
}
</style>
