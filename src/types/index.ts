export interface ServerData {
  name: string
  alias: string
  type: string
  location: string
  notify: boolean
  vnstat: boolean
  online4: boolean
  online6: boolean
  uptime: string
  load: number
  load_1: number
  load_5: number
  load_15: number
  /** 各运营商丢包率（%） */
  ping_10010: number
  ping_189: number
  ping_10086: number
  /** 各运营商延迟（ms） */
  time_10010: number
  time_189: number
  time_10086: number
  tcp_count: number
  udp_count: number
  process_count: number
  thread_count: number
  network_rx: number
  network_tx: number
  network_in: number
  network_out: number
  last_network_in: number
  last_network_out: number
  cpu: number
  /** CPU 核数，服务端从 sys_info 透出；可能缺失 */
  cpu_num?: number
  memory_total: number
  memory_used: number
  swap_total: number
  swap_used: number
  hdd_total: number
  hdd_used: number
  labels: string
  weight: number
  latest_ts: number
  si: boolean
}
