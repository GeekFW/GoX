import React, { useEffect } from 'react'
import TitleBar from './TitleBar'
import Navigation from './Navigation'
import StatusBar from './StatusBar'
import useAppStore from '../store/useAppStore'
import { cn } from '../lib/utils'

/**
 * 主布局组件
 */
const MainLayout = ({ children }) => {
  const { theme } = useAppStore()

  // 应用主题到document
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className={cn(
      "flex flex-col h-screen bg-background text-foreground",
      "transition-colors duration-200"
    )}>
      {/* 顶部标题栏 */}
      <TitleBar />
      
      {/* 导航菜单 */}
      <Navigation />
      
      {/* 主内容区域 */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full p-4 pb-10 overflow-auto">
          {children}
        </div>
      </main>
      
      {/* 底部状态栏 */}
      <StatusBar />
    </div>
  )
}

export default MainLayout