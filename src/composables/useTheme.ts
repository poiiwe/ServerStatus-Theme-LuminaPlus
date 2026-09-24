import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'

export type ThemeMode = 'auto' | 'light' | 'dark'

/**
 * 主题模式：auto 跟随系统，light / dark 手动指定。
 * 存储于 localStorage `sstl-theme`，通过 html.dark class 生效。
 */
export function useTheme() {
  const mode = useColorMode({
    emitAuto: true,
    initialValue: 'auto',
    storageKey: 'sstl-theme',
  })

  return mode
}

/** 当前实际生效的明暗状态（auto 模式下跟随系统） */
export function useIsDark() {
  const mode = useTheme()
  return computed(() => mode.value === 'dark' || (mode.value === 'auto' && mode.system.value === 'dark'))
}
