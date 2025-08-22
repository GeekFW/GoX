import React, { useEffect } from 'react'
import useAppStore from '../store/useAppStore'

/**
 * 主题提供者组件
 * 负责管理和应用主题状态
 */
const ThemeProvider = ({ children }) => {
  const { theme, themeColor } = useAppStore()

  useEffect(() => {
    const root = window.document.documentElement
    
    // 移除之前的主题类
    root.classList.remove('light', 'dark')
    
    // 移除之前的主题色类
    root.classList.remove('theme-blue', 'theme-green', 'theme-red', 'theme-purple', 'theme-pink', 'theme-cyan')
    
    // 应用当前主题
    root.classList.add(theme)
    
    // 应用当前主题色
    root.classList.add(`theme-${themeColor}`)
    
    // 设置主题色彩变量
    if (theme === 'dark') {
      root.style.colorScheme = 'dark'
    } else {
      root.style.colorScheme = 'light'
    }
  }, [theme, themeColor])

  return children
}

export default ThemeProvider