import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const THEME_KEY = 'theme'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(true)

  const init = () => {
    const saved = localStorage.getItem(THEME_KEY)
    isDark.value = saved !== 'light'
    _apply()
  }

  const toggle = () => {
    isDark.value = !isDark.value
    const html = document.documentElement
    html.classList.add('theme-transitioning')
    _apply()
    setTimeout(() => html.classList.remove('theme-transitioning'), 500)
    localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
  }

  const _apply = () => {
    document.documentElement.classList.toggle('light-mode', !isDark.value)
  }

  const label = computed(() => (isDark.value ? 'Switch to light mode' : 'Switch to dark mode'))

  return { isDark, label, init, toggle }
})
