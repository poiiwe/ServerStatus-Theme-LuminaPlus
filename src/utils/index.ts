import type { ServerData } from '@/types'

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0)
    return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

export function formatTime(seconds: number) {
  const date = new Date(seconds * 1000)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  const second = date.getSeconds().toString().padStart(2, '0')
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`
}

export function isOnline(server: ServerData) {
  return server.online4 || server.online6
}

/** 负载格式化为两位小数；无数据返回占位符 */
export function formatLoad(value: number | undefined) {
  return value === undefined ? '—' : value.toFixed(2)
}

/** 负载百分比 = load_1 / CPU 核数；核数未知时返回 undefined（不显示进度条） */
export function loadPercent(server: ServerData): number | undefined {
  const v = server.load_1 ?? server.load
  if (v === undefined || !server.cpu_num)
    return undefined
  return (v / server.cpu_num) * 100
}

/** 三家运营商的延迟与丢包原始数据（顺序：电信、联通、移动） */
export function pingList(server: ServerData) {
  return [
    { carrier: '电信', loss: server.ping_189, time: server.time_189 },
    { carrier: '联通', loss: server.ping_10010, time: server.time_10010 },
    { carrier: '移动', loss: server.ping_10086, time: server.time_10086 },
  ]
}

/** 延迟/丢包摘要：延迟取最小可用值(ms)，丢包取最大百分比；完全无数据返回 null */
export function pingSummary(server: ServerData): { latency: number | null, loss: number | null } {
  const pings = pingList(server)
  const times = pings.map(p => p.time).filter(t => t > 0)
  const losses = pings.map(p => p.loss).filter(l => l > 0)
  if (!times.length && !losses.length)
    return { latency: null, loss: null }
  return {
    latency: times.length ? Math.round(Math.min(...times)) : null,
    loss: losses.length ? Math.round(Math.max(...losses)) : 0,
  }
}

/** 每节点最近一次有效延迟/丢包的缓存，用于稳定显示 */
const pingCache = new Map<string, { latency: number | null, loss: number | null }>()

/**
 * 稳定版延迟/丢包：客户端 TCP 探测偶发瞬间失败时原始数据会全 0，
 * 直接显示会一会有、一会没有；这里保留最近一次有效值，
 * `stale` 为 true 表示当前展示的是缓存值。
 */
export function stablePing(server: ServerData): { latency: number | null, loss: number | null, stale: boolean } {
  const cur = pingSummary(server)
  const prev = pingCache.get(server.name)
  if (cur.latency !== null || cur.loss !== null) {
    pingCache.set(server.name, cur)
    return { ...cur, stale: false }
  }
  if (prev)
    return { ...prev, stale: true }
  return { latency: null, loss: null, stale: false }
}

/** 丢包配色（五档，对齐 LuminaPlus 热力阈值）：null 灰，≤1% 绿，≤3% 黄绿，≤5% 黄，≤10% 琥珀，以上红 */
export function pingLossClass(loss: number | null) {
  if (loss === null)
    return 'text-muted-foreground'
  if (loss <= 1)
    return 'text-green-500'
  if (loss <= 3)
    return 'text-lime-400'
  if (loss <= 5)
    return 'text-yellow-500'
  if (loss <= 10)
    return 'text-amber-500'
  return 'text-red-500'
}

/** 延迟配色（五档，对齐 LuminaPlus）：null 灰，≤60ms 绿，≤100 黄绿，≤160 黄，≤200 琥珀，以上红 */
export function pingLatencyClass(latency: number | null) {
  if (latency === null)
    return 'text-muted-foreground'
  if (latency <= 60)
    return 'text-green-500'
  if (latency <= 100)
    return 'text-lime-400'
  if (latency <= 160)
    return 'text-yellow-500'
  if (latency <= 200)
    return 'text-amber-500'
  return 'text-red-500'
}

/** 实时速率分档配色（对齐 LuminaPlus speedRateColor）：B/s 绿、KB/s 琥珀、MB/s 橙、GB/s+ 红 */
export function speedRateClass(bytesPerSecond: number) {
  const KB = 1024
  const MB = KB * 1024
  const GB = MB * 1024
  if (bytesPerSecond < KB)
    return 'text-green-600 dark:text-green-500'
  if (bytesPerSecond < MB)
    return 'text-amber-500'
  if (bytesPerSecond < GB)
    return 'text-orange-500'
  return 'text-red-500'
}

/** 百分比文本：≥10% 取整，<10% 保留一位小数（对齐 LuminaPlus pctText） */
export function pctText(ratio: number): string {
  const pct = ratio * 100
  return pct >= 10 ? Math.round(pct).toString() : pct.toFixed(1)
}


export interface PingDetail {
  carrier: string
  time: number
  loss: number
  /** true 表示当前展示的是缓存值 */
  stale: boolean
}

/** 稳定版三网明细：同 stablePing，但按运营商分别缓存 */
/** 每节点每运营商最近一次有效探测的缓存 */
const pingDetailCache = new Map<string, { time: number, loss: number }>()

export function stablePingList(server: ServerData): PingDetail[] {
  return pingList(server).map((p) => {
    const key = `${server.name}:${p.carrier}`
    const prev = pingDetailCache.get(key)
    if (p.time > 0 || p.loss > 0) {
      pingDetailCache.set(key, { time: p.time, loss: p.loss })
      return { ...p, stale: false }
    }
    if (prev)
      return { carrier: p.carrier, time: prev.time, loss: prev.loss, stale: true }
    return { ...p, stale: false }
  })
}

export function isCountryFlagEmoji(text: string) {
  const regex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g
  return regex.test(text)
}

export function hasLoadData(server: ServerData) {
  return server.load === undefined
    && server.load_1 === undefined
    && server.load_5 === undefined
    && server.load_15 === undefined
}

export function parseLabels(labelsString: string | undefined) {
  if (labelsString === undefined)
    return {}
  const list = labelsString.split(';')
  const result: { [key: string]: string } = {}
  list.forEach((item) => {
    if (item === '')
      return
    const [key, value] = item.split('=')
    result[key] = value
  })
  return result
}

/** 按用量分级返回进度条填充色：正常 primary，80% 警告，90% 危险 */
export function progressIndicatorClass(value: number, max: number) {
  const ratio = value / max
  if (ratio >= 0.9)
    return 'bg-destructive'
  if (ratio >= 0.8)
    return 'bg-yellow-500'
  return 'bg-primary'
}
