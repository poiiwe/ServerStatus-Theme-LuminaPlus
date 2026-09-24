<template>
  <img
    :src="logoSrc"
    :alt="displayName"
    :title="displayName"
    class="shrink-0 object-contain"
    :style="{ width: size + 'px', height: size + 'px' }"
    @error="fallback = true"
  >
</template>

<script setup lang="ts">
/**
 * 系统 logo：按 os 字符串关键词映射到主题内置 SVG 图标（移植自 LuminaPlus OsLogo），
 * 未命中或加载失败回退 Linux 企鹅图标。
 */
const props = withDefaults(defineProps<{
  /** 原始 os 字符串，如 "Debian 12"、labels 的 os 值 */
  os?: string
  /** 图标边长（px） */
  size?: number
}>(), {
  os: '',
  size: 16,
})

interface OsEntry {
  file: string
  keywords: string[]
}

/** 顺序敏感：先命中先赢（与 LuminaPlus 映射表一致） */
const OS_MAP: OsEntry[] = [
  { file: 'os-alma.svg', keywords: ['alma'] },
  { file: 'os-alpine.webp', keywords: ['alpine'] },
  { file: 'os-armbian.svg', keywords: ['armbian'] },
  { file: 'os-centos.svg', keywords: ['centos', 'cent os'] },
  { file: 'os-debian.svg', keywords: ['debian', 'deb'] },
  { file: 'os-freebsd.svg', keywords: ['freebsd', 'bsd'] },
  { file: 'os-ubuntu.svg', keywords: ['ubuntu', 'elementary'] },
  { file: 'os-windows.svg', keywords: ['windows', 'win', 'microsoft'] },
  { file: 'os-arch.svg', keywords: ['arch'] },
  { file: 'os-kail.svg', keywords: ['kail', 'kali'] },
  { file: 'os-istore.png', keywords: ['istore'] },
  { file: 'os-openwrt.svg', keywords: ['openwrt', 'open wrt', 'qwrt', 'immortalwrt'] },
  { file: 'os-nix.svg', keywords: ['nixos', 'nix'] },
  { file: 'os-rocky.svg', keywords: ['rocky'] },
  { file: 'os-fedora.svg', keywords: ['fedora'] },
  { file: 'os-openSUSE.svg', keywords: ['opensuse', 'suse'] },
  { file: 'os-gentoo.svg', keywords: ['gentoo'] },
  { file: 'os-redhat.svg', keywords: ['redhat', 'rhel'] },
  { file: 'os-mint.svg', keywords: ['mint'] },
  { file: 'os-manjaro-.svg', keywords: ['manjaro'] },
  { file: 'os-synology.ico', keywords: ['synology', 'dsm'] },
  { file: 'os-fnos.ico', keywords: ['fnos', 'fnnas'] },
  { file: 'os-proxmox.ico', keywords: ['proxmox'] },
  { file: 'os-macos.svg', keywords: ['macos', 'mac os', 'osx', 'darwin', 'mac'] },
  { file: 'os-qnap.svg', keywords: ['qnap', 'qts', 'qes'] },
  { file: 'os-orange-pi.svg', keywords: ['orange pi', 'orangepi'] },
  { file: 'os-huawei.svg', keywords: ['huawei', 'euleros'] },
  { file: 'alibabacloud-color.svg', keywords: ['aliyun', 'alibaba'] },
  { file: 'os-OpenCloudOS.png', keywords: ['opencloud'] },
  { file: 'os-unraid.svg', keywords: ['unraid'] },
  { file: 'os-astar.png', keywords: ['astra'] },
]

const FALLBACK = 'linux.svg'

const fallback = ref(false)

const matched = computed<OsEntry | undefined>(() => {
  const s = props.os.toLowerCase()
  if (!s)
    return undefined
  return OS_MAP.find(entry => entry.keywords.some(k => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(s)))
})

const logoSrc = computed(() =>
  `/image/logo/${fallback.value || !matched.value ? FALLBACK : matched.value.file}`,
)

/** 展示名：取原串第一段（空格/斜线切分），兜底 “Linux” */
const displayName = computed(() => {
  const first = props.os.split(/[\s/]+/)[0]
  return first || 'Linux'
})
</script>
