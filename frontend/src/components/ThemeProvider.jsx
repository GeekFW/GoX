import React, { useEffect } from 'react'
import useAppStore from '../store/useAppStore'

/**
 * 主题提供者组件
 * 负责管理和应用主题状态
 */
const ThemeProvider = ({ children }) => {
  const { theme } = useAppStore()

  useEffect(() => {
    const root = window.document.documentElement
    
    // 移除之前的主题类
    root.classList.remove('light', 'dark')
    
    // 应用当前主题
    root.classList.add(theme)
    
    // 设置主题色彩变量
    if (theme === 'dark') {
      root.style.colorScheme = 'dark'
    } else {
      root.style.colorScheme = 'light'
    }
  }, [theme])

  return children
}

export default ThemeProvider