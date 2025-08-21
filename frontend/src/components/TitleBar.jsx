import React from 'react'
import { Minus, Square, X, Moon, Sun } from 'lucide-react'
import { cn } from '../lib/utils'
import useAppStore from '../store/useAppStore'
import { WindowMinimise, WindowToggleMaximise, Quit } from '../../wailsjs/runtime/runtime'
import { Button } from './ui/Button'

/**
 * 顶部标题栏组件
 */
const TitleBar = () => {
  const { theme, setTheme } = useAppStore()

  const handleMinimize = () => {
    WindowMinimise()
  }

  const handleMaximize = () => {
    WindowToggleMaximise()
  }

  const handleClose = () => {
    Quit()
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="drag-region flex items-center justify-between h-8 bg-background border-b border-border px-4">
      {/* 左侧：应用标题 */}
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">G</span>
        </div>
        <span className="text-sm font-medium text-foreground">Gox Client</span>
      </div>

      {/* 右侧：控制按钮 */}
      <div className="no-drag flex items-center space-x-1">
        {/* 主题切换按钮 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="w-6 h-6"
          title="切换主题"
        >
          {theme === 'dark' ? (
            <Sun className="w-3 h-3" />
          ) : (
            <Moon className="w-3 h-3" />
          )}
        </Button>

        {/* 最小化按钮 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMinimize}
          className="w-6 h-6"
          title="最小化"
        >
          <Minus className="w-3 h-3" />
        </Button>

        {/* 最大化按钮 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMaximize}
          className="w-6 h-6"
          title="最大化"
        >
          <Square className="w-3 h-3" />
        </Button>

        {/* 关闭按钮 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="w-6 h-6 hover:bg-destructive hover:text-destructive-foreground"
          title="关闭"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}

export default TitleBar